# ⚡ EdgeVision Studio

A full-stack SaaS edge AI platform for real-time object detection and edge device fleet management.

## What it does
- Upload any image → real AI object detection using YOLOv8 ONNX model
- Manage a fleet of edge devices (MCU, MPU, NPU) with real-time WebSocket telemetry
- Full user authentication with JWT / OAuth 2.0
- Analytics dashboard with inference history and device status charts

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Recharts |
| Backend | FastAPI, Python |
| AI Inference | YOLOv8, ONNX Runtime |
| Auth | JWT, OAuth 2.0, bcrypt |
| Database | SQLAlchemy ORM, SQLite |
| Real-time | WebSocket |
| API Docs | Swagger / OpenAPI |

## Architecture
## Run locally

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy python-jose passlib onnxruntime pillow python-multipart ultralytics bcrypt==4.0.1 pydantic-settings
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### API docs
Visit `http://localhost:8000/docs`

## Key concepts covered
- SaaS full-stack architecture
- Real computer vision inference (CNN / YOLOv8)
- ONNX model deployment
- Edge computing device types (MCU / MPU / NPU)
- OAuth 2.0 / JWT authentication
- WebSocket real-time communication
- REST API design with OpenAPI
- ORM database design
- TypeScript + React frontend
