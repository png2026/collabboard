from unittest.mock import patch, MagicMock


def _mock_openai_response(tool_calls=None, content="Done!"):
    mock_message = MagicMock()
    mock_message.tool_calls = tool_calls
    mock_message.content = content
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message = mock_message
    return mock_response


@patch("app.routes.ai.client.chat.completions.create")
def test_single_tool_call(mock_create, client, sample_board_state, make_tool_call):
    tc = make_tool_call("createStickyNote", {"x": 100, "y": 200, "text": "Test"})
    mock_create.return_value = _mock_openai_response(tool_calls=[tc], content="Created!")

    resp = client.post("/api/ai/command", json={
        "command": "create a sticky note",
        "boardState": sample_board_state,
    }, headers={"Authorization": "Bearer fake"})

    assert resp.status_code == 200
    data = resp.json()
    assert len(data["actions"]) == 1
    assert data["actions"][0]["type"] == "create"
    assert data["actions"][0]["objectType"] == "stickyNote"
    assert data["message"] == "Created!"


@patch("app.routes.ai.client.chat.completions.create")
def test_no_tool_calls(mock_create, client, sample_board_state):
    mock_create.return_value = _mock_openai_response(content="I can't do that")

    resp = client.post("/api/ai/command", json={
        "command": "hello",
        "boardState": sample_board_state,
    }, headers={"Authorization": "Bearer fake"})

    assert resp.status_code == 200
    data = resp.json()
    assert len(data["actions"]) == 0
    assert data["message"] == "I can't do that"


@patch("app.routes.ai.client.chat.completions.create")
def test_delete_all(mock_create, client, sample_board_state, make_tool_call):
    tc = make_tool_call("deleteAll", {})
    mock_create.return_value = _mock_openai_response(tool_calls=[tc])

    resp = client.post("/api/ai/command", json={
        "command": "clear the board",
        "boardState": sample_board_state,
    }, headers={"Authorization": "Bearer fake"})

    assert resp.status_code == 200
    data = resp.json()
    assert len(data["actions"]) == 2
    assert all(a["type"] == "delete" for a in data["actions"])
    ids = {a["objectId"] for a in data["actions"]}
    assert ids == {"obj-1", "obj-2"}


@patch("app.routes.ai.client.chat.completions.create")
def test_bulk_create(mock_create, client, sample_board_state, make_tool_call):
    tc = make_tool_call("bulkCreate", {"count": 5})
    mock_create.return_value = _mock_openai_response(tool_calls=[tc])

    resp = client.post("/api/ai/command", json={
        "command": "create 5 random objects",
        "boardState": sample_board_state,
    }, headers={"Authorization": "Bearer fake"})

    assert resp.status_code == 200
    data = resp.json()
    assert len(data["actions"]) == 5
    assert all(a["type"] == "create" for a in data["actions"])


@patch("app.routes.ai.client.chat.completions.create")
def test_openai_error_returns_500(mock_create, client, sample_board_state):
    mock_create.side_effect = Exception("API down")

    resp = client.post("/api/ai/command", json={
        "command": "create something",
        "boardState": sample_board_state,
    }, headers={"Authorization": "Bearer fake"})

    assert resp.status_code == 500
    assert resp.json()["detail"] == "AI request failed"
