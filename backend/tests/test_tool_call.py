import pytest
from app.routes.ai import tool_call_to_action


def test_create_sticky_note_defaults(make_tool_call):
    tc = make_tool_call("createStickyNote", {"x": 100, "y": 200, "text": "Hello"})
    action = tool_call_to_action(tc)
    assert action is not None
    assert action.type == "create"
    assert action.objectType == "stickyNote"
    assert action.properties is not None
    assert action.properties["x"] == 100
    assert action.properties["y"] == 200
    assert action.properties["text"] == "Hello"
    assert action.properties["color"] == "#FDE68A"
    assert action.properties["width"] == 200
    assert action.properties["height"] == 150


def test_create_sticky_note_custom(make_tool_call):
    tc = make_tool_call("createStickyNote", {
        "x": 50, "y": 60, "text": "Custom", "color": "#BFDBFE", "width": 300, "height": 200,
    })
    action = tool_call_to_action(tc)
    assert action is not None
    assert action.properties is not None
    assert action.properties["color"] == "#BFDBFE"
    assert action.properties["width"] == 300
    assert action.properties["height"] == 200


def test_create_shape_rectangle(make_tool_call):
    tc = make_tool_call("createShape", {"shapeType": "rectangle", "x": 10, "y": 20})
    action = tool_call_to_action(tc)
    assert action is not None
    assert action.type == "create"
    assert action.objectType == "rectangle"
    assert action.properties is not None
    assert action.properties["width"] == 120
    assert action.properties["height"] == 120


def test_create_shape_circle(make_tool_call):
    tc = make_tool_call("createShape", {"shapeType": "circle", "x": 10, "y": 20})
    action = tool_call_to_action(tc)
    assert action is not None
    assert action.properties is not None
    assert action.objectType == "circle"
    assert action.properties["radius"] == 60


def test_create_connector(make_tool_call):
    tc = make_tool_call("createConnector", {"fromId": "a", "toId": "b"})
    action = tool_call_to_action(tc)
    assert action is not None
    assert action.type == "create"
    assert action.objectType == "connector"
    assert action.properties is not None
    assert action.properties["fromId"] == "a"
    assert action.properties["toId"] == "b"
    assert action.properties["arrowEnd"] is True


def test_move_object(make_tool_call):
    tc = make_tool_call("moveObject", {"objectId": "obj-1", "x": 500, "y": 600})
    action = tool_call_to_action(tc)
    assert action is not None
    assert action.type == "update"
    assert action.objectId == "obj-1"
    assert action.properties == {"x": 500, "y": 600}


def test_delete_object(make_tool_call):
    tc = make_tool_call("deleteObject", {"objectId": "obj-1"})
    action = tool_call_to_action(tc)
    assert action is not None
    assert action.type == "delete"
    assert action.objectId == "obj-1"


def test_bulk_create_returns_none(make_tool_call):
    tc = make_tool_call("bulkCreate", {"count": 10})
    assert tool_call_to_action(tc) is None


def test_delete_all_returns_none(make_tool_call):
    tc = make_tool_call("deleteAll", {})
    assert tool_call_to_action(tc) is None


def test_unknown_tool_raises(make_tool_call):
    tc = make_tool_call("unknownTool", {})
    with pytest.raises(ValueError, match="Unknown tool"):
        tool_call_to_action(tc)
