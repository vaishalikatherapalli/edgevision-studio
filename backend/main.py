from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine, Base
from routers.auth import router as auth_router
from routers.inference import router as inference_router
from routers.devices import router as devices_router
import models.user
import models.inference
import models.device

Base.metadata.create_all(bind=engine)

app = FastAPI(title="EdgeVision Studio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(inference_router)
app.include_router(devices_router)

@app.get("/health")
def health():
    return {"status": "EdgeVision running"}