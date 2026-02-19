from pydantic import BaseModel
from typing import Optional


class BoardObject(BaseModel):
    id: str
    type: str
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    radius: Optional[float] = None
    text: Optional[str] = None
    title: Optional[str] = None
    color: Optional[str] = None
    fontSize: Optional[float] = None
    strokeWidth: Optional[float] = None
    strokeColor: Optional[str] = None
    rotation: Optional[float] = None
    zIndex: Optional[int] = None
    fromId: Optional[str] = None
    toId: Optional[str] = None
    arrowEnd: Optional[bool] = None
    createdBy: Optional[str] = None


class AiCommandRequest(BaseModel):
    command: str
    boardState: list[BoardObject]
    boardId: str = "default-board"
    viewportCenter: Optional[dict] = None


class Action(BaseModel):
    type: str              # "create" | "update" | "delete"
    objectType: Optional[str] = None   # For create: stickyNote, rectangle, etc.
    objectId: Optional[str] = None     # For update/delete
    properties: Optional[dict] = None


class AiCommandResponse(BaseModel):
    actions: list[Action]
    message: str
    error: Optional[str] = None
