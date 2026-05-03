import asyncio
import json
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from core.database import get_db
from routers.auth import get_current_user
from models.user import User
from models.device import Device
import random

router = APIRouter(prefix="/devices", tags=["devices"])

# Track active WebSocket connections
active_connections: List[WebSocket] = []

class DeviceCreate(BaseModel):
    name: str
    device_type: str  # MCU, MPU, NPU

class DeviceResponse(BaseModel):
    id: int
    name: str
    device_type: str
    status: str
    last_inference_ms: float
    model_version: str

    class Config:
        from_attributes = True

@router.post("/register", response_model=DeviceResponse)
def register_device(
    data: DeviceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.device_type not in ["MCU", "MPU", "NPU"]:
        raise HTTPException(status_code=400, detail="device_type must be MCU, MPU, or NPU")

    device = Device(
        user_id=current_user.id,
        name=data.name,
        device_type=data.device_type,
        status="online"
    )
    db.add(device)
    db.commit()
    db.refresh(device)
    return device

@router.get("/", response_model=List[DeviceResponse])
def get_devices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Device)\
        .filter(Device.user_id == current_user.id)\
        .all()

@router.delete("/{device_id}")
def delete_device(
    device_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    device = db.query(Device)\
        .filter(Device.id == device_id, Device.user_id == current_user.id)\
        .first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    db.delete(device)
    db.commit()
    return {"message": "Device deleted"}

@router.websocket("/ws")
async def device_websocket(websocket: WebSocket, db: Session = Depends(get_db)):
    """
    WebSocket endpoint - streams real-time device status updates every 3 seconds.
    This simulates what real edge devices would send back as telemetry.
    """
    await websocket.accept()
    active_connections.append(websocket)
    print(f"WebSocket connected. Total connections: {len(active_connections)}")

    try:
        while True:
            # Get all devices from DB
            devices = db.query(Device).all()

            if devices:
                # Simulate real-time telemetry from each device
                telemetry = []
                for device in devices:
                    # Randomly toggle some devices online/offline
                    simulated_status = random.choice(["online", "online", "online", "offline"])
                    # Simulate different inference speeds per device type
                    if device.device_type == "NPU":
                        latency = round(random.uniform(8, 25), 1)
                    elif device.device_type == "MPU":
                        latency = round(random.uniform(80, 200), 1)
                    else:  # MCU
                        latency = round(random.uniform(300, 800), 1)

                    telemetry.append({
                        "id": device.id,
                        "name": device.name,
                        "device_type": device.device_type,
                        "status": simulated_status,
                        "last_inference_ms": latency,
                        "model_version": device.model_version
                    })

                await websocket.send_text(json.dumps({
                    "type": "telemetry",
                    "devices": telemetry
                }))

            # Wait 3 seconds before next update
            await asyncio.sleep(3)

    except WebSocketDisconnect:
        active_connections.remove(websocket)
        print(f"WebSocket disconnected. Total connections: {len(active_connections)}")