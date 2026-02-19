TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "createStickyNote",
            "description": "Create a sticky note on the board. Use for ideas, labels, SWOT items, brainstorming, etc.",
            "parameters": {
                "type": "object",
                "properties": {
                    "x": {"type": "number", "description": "X position on the canvas"},
                    "y": {"type": "number", "description": "Y position on the canvas"},
                    "text": {"type": "string", "description": "Text content of the sticky note"},
                    "color": {
                        "type": "string",
                        "description": "Background color hex. Available: #FDE68A (Yellow), #FBCFE8 (Pink), #BFDBFE (Blue), #BBF7D0 (Green), #DDD6FE (Purple), #FED7AA (Orange), #FECACA (Red), #E5E7EB (Gray), #1F2937 (Black)",
                    },
                    "width": {"type": "number", "description": "Width in pixels. Default 200."},
                    "height": {"type": "number", "description": "Height in pixels. Default 150."},
                },
                "required": ["x", "y", "text"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "createShape",
            "description": "Create a shape (rectangle or circle) on the board.",
            "parameters": {
                "type": "object",
                "properties": {
                    "shapeType": {
                        "type": "string",
                        "enum": ["rectangle", "circle"],
                        "description": "Type of shape to create",
                    },
                    "x": {"type": "number", "description": "X position"},
                    "y": {"type": "number", "description": "Y position"},
                    "color": {"type": "string", "description": "Fill color hex"},
                    "width": {"type": "number", "description": "Width (rectangles). Default 120."},
                    "height": {"type": "number", "description": "Height (rectangles). Default 120."},
                    "radius": {"type": "number", "description": "Radius (circles). Default 60."},
                },
                "required": ["shapeType", "x", "y"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "createText",
            "description": "Create a standalone text element on the board. Use for headings, labels, annotations.",
            "parameters": {
                "type": "object",
                "properties": {
                    "x": {"type": "number", "description": "X position"},
                    "y": {"type": "number", "description": "Y position"},
                    "text": {"type": "string", "description": "Text content"},
                    "fontSize": {"type": "number", "description": "Font size. Default 20."},
                    "color": {"type": "string", "description": "Text color hex. Default #374151."},
                    "width": {"type": "number", "description": "Text box width. Default 200."},
                },
                "required": ["x", "y", "text"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "createLine",
            "description": "Create a line on the board. Use for separators, dividers.",
            "parameters": {
                "type": "object",
                "properties": {
                    "x": {"type": "number", "description": "X start position"},
                    "y": {"type": "number", "description": "Y start position"},
                    "width": {"type": "number", "description": "Length of the line. Default 150."},
                    "color": {"type": "string", "description": "Stroke color hex. Default #6B7280."},
                    "strokeWidth": {"type": "number", "description": "Stroke width. Default 3."},
                    "rotation": {"type": "number", "description": "Rotation in degrees. Default 0."},
                },
                "required": ["x", "y"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "createFrame",
            "description": "Create a frame (container/section) on the board. Use for grouping, categories, sections. Frames render behind other objects.",
            "parameters": {
                "type": "object",
                "properties": {
                    "x": {"type": "number", "description": "X position"},
                    "y": {"type": "number", "description": "Y position"},
                    "width": {"type": "number", "description": "Width. Default 400."},
                    "height": {"type": "number", "description": "Height. Default 300."},
                    "title": {"type": "string", "description": "Frame title text."},
                    "color": {"type": "string", "description": "Border color hex. Default #6B7280."},
                },
                "required": ["x", "y", "title"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "createConnector",
            "description": "Create a connector (arrow) between two existing objects. Only use for objects that already exist in the boardState (have known IDs).",
            "parameters": {
                "type": "object",
                "properties": {
                    "fromId": {"type": "string", "description": "Firestore ID of the source object"},
                    "toId": {"type": "string", "description": "Firestore ID of the target object"},
                    "strokeColor": {"type": "string", "description": "Connector color. Default #6B7280."},
                    "strokeWidth": {"type": "number", "description": "Stroke width. Default 2."},
                    "arrowEnd": {"type": "boolean", "description": "Show arrowhead. Default true."},
                },
                "required": ["fromId", "toId"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "moveObject",
            "description": "Move an existing object to a new position.",
            "parameters": {
                "type": "object",
                "properties": {
                    "objectId": {"type": "string", "description": "Firestore ID of the object to move"},
                    "x": {"type": "number", "description": "New X position"},
                    "y": {"type": "number", "description": "New Y position"},
                },
                "required": ["objectId", "x", "y"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "resizeObject",
            "description": "Resize an existing object.",
            "parameters": {
                "type": "object",
                "properties": {
                    "objectId": {"type": "string", "description": "Firestore ID of the object to resize"},
                    "width": {"type": "number", "description": "New width"},
                    "height": {"type": "number", "description": "New height"},
                    "radius": {"type": "number", "description": "New radius (circles only)"},
                },
                "required": ["objectId"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "updateText",
            "description": "Update the text content of a sticky note or text element, or the title of a frame.",
            "parameters": {
                "type": "object",
                "properties": {
                    "objectId": {"type": "string", "description": "Firestore ID of the object"},
                    "text": {"type": "string", "description": "New text content (for stickyNote or text type)"},
                    "title": {"type": "string", "description": "New title (for frame type)"},
                },
                "required": ["objectId"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "changeColor",
            "description": "Change the color of an existing object.",
            "parameters": {
                "type": "object",
                "properties": {
                    "objectId": {"type": "string", "description": "Firestore ID of the object"},
                    "color": {
                        "type": "string",
                        "description": "New color hex. Available: #FDE68A (Yellow), #FBCFE8 (Pink), #BFDBFE (Blue), #BBF7D0 (Green), #DDD6FE (Purple), #FED7AA (Orange), #FECACA (Red), #E5E7EB (Gray), #1F2937 (Black)",
                    },
                },
                "required": ["objectId", "color"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "deleteObject",
            "description": "Delete an existing object from the board.",
            "parameters": {
                "type": "object",
                "properties": {
                    "objectId": {"type": "string", "description": "Firestore ID of the object to delete"},
                },
                "required": ["objectId"],
            },
        },
    },
]
