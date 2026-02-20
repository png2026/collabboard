import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.ai import router as ai_router

# GCP Cloud Run captures stdout as structured logs when using JSON format.
# Locally, use a human-readable format.
if os.getenv("K_SERVICE"):
    # Running on Cloud Run — use JSON structured logging
    import json as _json

    class _GCPFormatter(logging.Formatter):
        def format(self, record):
            return _json.dumps({
                "severity": record.levelname,
                "message": super().format(record),
                "logger": record.name,
            })

    _handler = logging.StreamHandler()
    _handler.setFormatter(_GCPFormatter())
else:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("%(levelname)s %(name)s: %(message)s"))

_level = logging.INFO if os.getenv("K_SERVICE") else logging.DEBUG
logging.basicConfig(level=_level, handlers=[_handler])

app = FastAPI(title="CollabBoard AI Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(ai_router, prefix="/api/ai")


@app.get("/health")
async def health():
    return {"status": "ok"}
