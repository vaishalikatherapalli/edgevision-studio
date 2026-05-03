from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime
from core.database import Base

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    device_type = Column(String, nullable=False)  # MCU, MPU, NPU
    status = Column(String, default="offline")     # online, offline
    last_inference_ms = Column(Float, default=0.0)
    model_version = Column(String, default="yolov8n-v1")
    created_at = Column(DateTime, default=datetime.utcnow)