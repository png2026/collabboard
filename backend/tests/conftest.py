import os
import json
from unittest.mock import MagicMock

# Set env vars BEFORE any app imports
os.environ.setdefault("OPENAI_API_KEY", "sk-test-fake-key")
os.environ.setdefault("GOOGLE_CLOUD_PROJECT", "test-project")

# Mock Firebase before auth.py import
import firebase_admin
firebase_admin._apps = {"[DEFAULT]": MagicMock()}

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def mock_firebase_auth():
    """Override verify_firebase_token to bypass auth."""
    from main import app
    from app.auth import verify_firebase_token

    async def fake_verify(authorization: str = "Bearer test"):
        return {"uid": "test-user-123", "email": "test@example.com"}

    app.dependency_overrides[verify_firebase_token] = fake_verify
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def client(mock_firebase_auth):
    """Test client with auth bypassed."""
    from main import app
    return TestClient(app)


@pytest.fixture
def sample_board_state():
    """Reusable board state with a few objects."""
    return [
        {"id": "obj-1", "type": "stickyNote", "x": 100, "y": 100,
         "text": "Hello", "color": "#FDE68A", "width": 200, "height": 150},
        {"id": "obj-2", "type": "rectangle", "x": 400, "y": 200,
         "color": "#BFDBFE", "width": 120, "height": 120},
    ]


@pytest.fixture
def make_tool_call():
    """Factory for creating mock OpenAI tool_call objects."""
    def _make(name: str, arguments: dict):
        tc = MagicMock()
        tc.function.name = name
        tc.function.arguments = json.dumps(arguments)
        return tc
    return _make
