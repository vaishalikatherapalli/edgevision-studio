from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base

class InferenceResult(Base):
    __tablename__ = "inference_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    detected_objects = Column(String, nullable=False)  # stored as JSON string
    inference_time_ms = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)