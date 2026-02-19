import json
from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from app.config import settings
from app.auth import verify_firebase_token
from app.schemas import AiCommandRequest, AiCommandResponse, Action
from app.tools import TOOLS
from app.prompts import SYSTEM_PROMPT

router = APIRouter()
client = OpenAI(api_key=settings.openai_api_key)


def tool_call_to_action(tool_call) -> Action:
    """Convert an OpenAI tool call into a frontend Action."""
    name = tool_call.function.name
    args = json.loads(tool_call.function.arguments)

    if name == "createStickyNote":
        return Action(
            type="create",
            objectType="stickyNote",
            properties={
                "x": args["x"], "y": args["y"],
                "text": args.get("text", ""),
                "color": args.get("color", "#FDE68A"),
                "width": args.get("width", 200),
                "height": args.get("height", 150),
                "rotation": 0,
            },
        )
    elif name == "createShape":
        shape = args["shapeType"]
        props = {"x": args["x"], "y": args["y"], "color": args.get("color", "#E5E7EB"), "rotation": 0}
        if shape == "rectangle":
            props["width"] = args.get("width", 120)
            props["height"] = args.get("height", 120)
        elif shape == "circle":
            props["radius"] = args.get("radius", 60)
        return Action(type="create", objectType=shape, properties=props)
    elif name == "createText":
        return Action(
            type="create",
            objectType="text",
            properties={
                "x": args["x"], "y": args["y"],
                "text": args.get("text", ""),
                "fontSize": args.get("fontSize", 20),
                "color": args.get("color", "#374151"),
                "width": args.get("width", 200),
                "rotation": 0,
            },
        )
    elif name == "createLine":
        return Action(
            type="create",
            objectType="line",
            properties={
                "x": args["x"], "y": args["y"],
                "width": args.get("width", 150),
                "color": args.get("color", "#6B7280"),
                "strokeWidth": args.get("strokeWidth", 3),
                "rotation": args.get("rotation", 0),
            },
        )
    elif name == "createFrame":
        return Action(
            type="create",
            objectType="frame",
            properties={
                "x": args["x"], "y": args["y"],
                "width": args.get("width", 400),
                "height": args.get("height", 300),
                "title": args.get("title", "Frame"),
                "color": args.get("color", "#6B7280"),
                "rotation": 0,
                "zIndex": 0,
            },
        )
    elif name == "createConnector":
        return Action(
            type="create",
            objectType="connector",
            properties={
                "fromId": args["fromId"], "toId": args["toId"],
                "strokeColor": args.get("strokeColor", "#6B7280"),
                "strokeWidth": args.get("strokeWidth", 2),
                "arrowEnd": args.get("arrowEnd", True),
            },
        )
    elif name == "moveObject":
        return Action(type="update", objectId=args["objectId"], properties={"x": args["x"], "y": args["y"]})
    elif name == "resizeObject":
        props = {}
        if "width" in args:
            props["width"] = args["width"]
        if "height" in args:
            props["height"] = args["height"]
        if "radius" in args:
            props["radius"] = args["radius"]
        return Action(type="update", objectId=args["objectId"], properties=props)
    elif name == "updateText":
        props = {}
        if "text" in args:
            props["text"] = args["text"]
        if "title" in args:
            props["title"] = args["title"]
        return Action(type="update", objectId=args["objectId"], properties=props)
    elif name == "changeColor":
        return Action(type="update", objectId=args["objectId"], properties={"color": args["color"]})
    elif name == "deleteObject":
        return Action(type="delete", objectId=args["objectId"])
    else:
        raise ValueError(f"Unknown tool: {name}")


@router.post("/command", response_model=AiCommandResponse)
async def ai_command(request: AiCommandRequest, user: dict = Depends(verify_firebase_token)):
    """Process a natural language AI command against the board."""
    board_state_summary = json.dumps(
        [obj.model_dump(exclude_none=True) for obj in request.boardState],
        indent=None,
    )

    viewport = json.dumps(request.viewportCenter) if request.viewportCenter else "not provided, use (600, 400) as default center"

    user_message = (
        f"Board state (current objects on the board):\n{board_state_summary}\n\n"
        f"Viewport center: {viewport}\n\n"
        f"User command: {request.command}"
    )

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            tools=TOOLS,
            tool_choice="auto",
            temperature=0.3,
            max_tokens=4096,
        )

        message = response.choices[0].message
        actions = []

        if message.tool_calls:
            for tc in message.tool_calls:
                try:
                    actions.append(tool_call_to_action(tc))
                except Exception as e:
                    print(f"Error processing tool call {tc.function.name}: {e}")

        summary = message.content or "Done!"
        return AiCommandResponse(actions=actions, message=summary, error=None)

    except Exception as e:
        print(f"AI command error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
