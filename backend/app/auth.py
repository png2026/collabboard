import logging

import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from fastapi import Header, HTTPException

from app.config import settings

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK.
# On Cloud Run this uses Application Default Credentials automatically.
# Locally, run: gcloud auth application-default login --project <project-id>
if not firebase_admin._apps:
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred, {"projectId": settings.google_cloud_project})


async def verify_firebase_token(authorization: str = Header(...)) -> dict:
    """FastAPI dependency: extract and verify Firebase ID token from Authorization header."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization[7:]
    try:
        decoded = firebase_auth.verify_id_token(token)
        return decoded
    except Exception as e:
        logger.warning(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
