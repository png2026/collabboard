import pytest
from unittest.mock import patch
from fastapi import HTTPException


@pytest.mark.asyncio
async def test_missing_bearer_prefix():
    from app.auth import verify_firebase_token
    with pytest.raises(HTTPException) as exc:
        await verify_firebase_token("NotBearer xyz")
    assert exc.value.status_code == 401
    assert exc.value.detail == "Invalid authorization header"


@pytest.mark.asyncio
@patch("app.auth.firebase_auth.verify_id_token")
async def test_invalid_token(mock_verify):
    from app.auth import verify_firebase_token
    mock_verify.side_effect = Exception("bad token")
    with pytest.raises(HTTPException) as exc:
        await verify_firebase_token("Bearer bad-token")
    assert exc.value.status_code == 401
    assert exc.value.detail == "Invalid token"


@pytest.mark.asyncio
@patch("app.auth.firebase_auth.verify_id_token")
async def test_valid_token(mock_verify):
    from app.auth import verify_firebase_token
    mock_verify.return_value = {"uid": "abc", "email": "a@b.com"}
    result = await verify_firebase_token("Bearer good-token")
    assert result["uid"] == "abc"
    mock_verify.assert_called_once_with("good-token")
