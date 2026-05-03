import time
import json
import numpy as np
import onnxruntime as ort
from PIL import Image
import io
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from core.database import get_db
from routers.auth import get_current_user
from models.user import User
from models.inference import InferenceResult

router = APIRouter(prefix="/inference", tags=["inference"])

# COCO class names - these are the 80 objects YOLOv8 can detect
COCO_CLASSES = [
    "person","bicycle","car","motorcycle","airplane","bus","train","truck",
    "boat","traffic light","fire hydrant","stop sign","parking meter","bench",
    "bird","cat","dog","horse","sheep","cow","elephant","bear","zebra","giraffe",
    "backpack","umbrella","handbag","tie","suitcase","frisbee","skis","snowboard",
    "sports ball","kite","baseball bat","baseball glove","skateboard","surfboard",
    "tennis racket","bottle","wine glass","cup","fork","knife","spoon","bowl",
    "banana","apple","sandwich","orange","broccoli","carrot","hot dog","pizza",
    "donut","cake","chair","couch","potted plant","bed","dining table","toilet",
    "tv","laptop","mouse","remote","keyboard","cell phone","microwave","oven",
    "toaster","sink","refrigerator","book","clock","vase","scissors","teddy bear",
    "hair drier","toothbrush"
]

# Load model once when server starts
print("Loading YOLOv8 ONNX model...")
session = ort.InferenceSession("yolov8n.onnx")
print("Model loaded and ready!")

def preprocess_image(image_bytes: bytes):
    """Convert uploaded image to tensor YOLOv8 expects"""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((640, 640))
    img_array = np.array(img, dtype=np.float32) / 255.0
    img_array = img_array.transpose(2, 0, 1)  # HWC -> CHW
    img_array = np.expand_dims(img_array, axis=0)  # add batch dim
    return img_array

def parse_detections(outputs, confidence_threshold=0.5):
    """Extract detected objects from raw model output"""
    detections = []
    output = outputs[0][0].T  # shape: (8400, 84)

    for row in output:
        class_scores = row[4:]
        class_id = int(np.argmax(class_scores))
        confidence = float(class_scores[class_id])

        if confidence >= confidence_threshold:
            label = COCO_CLASSES[class_id] if class_id < len(COCO_CLASSES) else "unknown"
            detections.append({
                "label": label,
                "confidence": round(confidence * 100, 1),
                "class_id": class_id
            })

    # Remove duplicates - keep highest confidence per class
    seen = {}
    for d in detections:
        label = d["label"]
        if label not in seen or d["confidence"] > seen[label]["confidence"]:
            seen[label] = d

    # Sort by confidence
    return sorted(seen.values(), key=lambda x: x["confidence"], reverse=True)

class DetectionResponse(BaseModel):
    filename: str
    inference_time_ms: float
    detections: List[dict]
    total_objects: int

@router.post("/detect", response_model=DetectionResponse)
async def detect_objects(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Read image
    image_bytes = await file.read()

    # Run inference and time it
    start = time.time()
    input_tensor = preprocess_image(image_bytes)
    input_name = session.get_inputs()[0].name
    outputs = session.run(None, {input_name: input_tensor})
    detections = parse_detections(outputs)
    inference_time = round((time.time() - start) * 1000, 2)

    # Save result to database
    result = InferenceResult(
        user_id=current_user.id,
        filename=file.filename,
        detected_objects=json.dumps(detections),
        inference_time_ms=inference_time
    )
    db.add(result)
    db.commit()

    return DetectionResponse(
        filename=file.filename,
        inference_time_ms=inference_time,
        detections=detections,
        total_objects=len(detections)
    )

@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = db.query(InferenceResult)\
        .filter(InferenceResult.user_id == current_user.id)\
        .order_by(InferenceResult.created_at.desc())\
        .limit(20).all()

    return [
        {
            "id": r.id,
            "filename": r.filename,
            "detections": json.loads(r.detected_objects),
            "inference_time_ms": r.inference_time_ms,
            "created_at": r.created_at.isoformat()
        }
        for r in results
    ]