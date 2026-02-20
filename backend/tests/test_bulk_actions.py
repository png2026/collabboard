from app.routes.ai import generate_bulk_actions


def test_bulk_default_count():
    actions = generate_bulk_actions({"count": 50})
    assert len(actions) == 50
    for a in actions:
        assert a.type == "create"
        assert a.objectType in ("stickyNote", "rectangle", "circle", "text", "line")


def test_bulk_custom_types():
    actions = generate_bulk_actions({"count": 10, "types": ["stickyNote"]})
    assert len(actions) == 10
    for a in actions:
        assert a.objectType == "stickyNote"


def test_bulk_respects_area():
    area = {"x": 100, "y": 200, "width": 300, "height": 400}
    actions = generate_bulk_actions({"count": 20, "area": area})
    for a in actions:
        assert 100 <= a.properties["x"] <= 400
        assert 200 <= a.properties["y"] <= 600
