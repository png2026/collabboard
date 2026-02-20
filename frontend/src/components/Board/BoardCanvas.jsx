import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { useAuth } from '../../hooks/useAuth.js';
import { createObject, deleteMultipleObjects, updateMultipleObjects } from '../../services/board';
import { TYPE_DEFAULT_COLORS } from '../../utils/colors';
import { getObjectCenter } from '../../utils/connectorUtils';
import ObjectFactory from '../Objects/ObjectFactory';
import MultipleCursors from '../Presence/MultipleCursors';
import SelectionRect from './SelectionRect';
import TransformerComponent from './TransformerComponent';

function getObjectBounds(obj) {
  if (obj.type === 'circle') {
    const r = obj.radius || 60;
    return { x: obj.x - r, y: obj.y - r, width: r * 2, height: r * 2 };
  }
  if (obj.type === 'connector') return null;
  if (obj.type === 'line') {
    const len = obj.width || 150;
    return { x: obj.x, y: obj.y - 5, width: len, height: 10 };
  }
  if (obj.type === 'frame') {
    return { x: obj.x, y: obj.y, width: obj.width || 400, height: obj.height || 300 };
  }
  if (obj.type === 'stickyNote') {
    return { x: obj.x, y: obj.y, width: obj.width || 200, height: obj.height || 150 };
  }
  if (obj.type === 'text') {
    return { x: obj.x, y: obj.y, width: obj.width || 200, height: obj.fontSize || 20 };
  }
  return { x: obj.x, y: obj.y, width: obj.width || 120, height: obj.height || 120 };
}

function rectsIntersect(a, b) {
  return !(a.x + a.width < b.x || b.x + b.width < a.x ||
           a.y + a.height < b.y || b.y + b.height < a.y);
}

// Find which object was clicked by walking up the Konva node tree
function findClickedObjectId(target, objects) {
  let node = target;
  while (node && node !== node.getStage()) {
    const id = node.id();
    if (id && objects.some(o => o.id === id)) return id;
    node = node.parent;
  }
  return null;
}

export default function BoardCanvas({
  stageScale, stagePosition, selectedTool, selectedColor,
  onWheel, onDragEnd, presenceUsers, onCursorMove,
  selectedObjectIds, onSelectObject, onSelectMultiple, onClearSelection,
  objects: propObjects, boardLoading, boardError,
}) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectionRect, setSelectionRect] = useState(null);
  const isDrawingSelection = useRef(false);
  const dragStartPos = useRef(null);

  // Connector creation state
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [connectingPreview, setConnectingPreview] = useState(null);

  // Clipboard for copy/paste
  const clipboardRef = useRef([]);

  // Layer caching for pan/zoom performance
  const layerRef = useRef(null);
  const wheelTimeoutRef = useRef(null);
  const isCachedRef = useRef(false);

  // Track Shift key for selection mode (Shift held = rubber-band select, otherwise pan)
  const [shiftHeld, setShiftHeld] = useState(false);
  useEffect(() => {
    const down = (e) => { if (e.key === 'Shift') setShiftHeld(true); };
    const up = (e) => { if (e.key === 'Shift') setShiftHeld(false); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const { user } = useAuth();
  const objects = propObjects || [];
  const loading = boardLoading;
  const error = boardError;

  // Sort objects by zIndex for proper layering
  const sortedObjects = useMemo(() => {
    return [...objects].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  }, [objects]);

  // --- Viewport culling: only render objects visible on screen ---
  const viewportBounds = useMemo(() => {
    const x = -stagePosition.x / stageScale;
    const y = -stagePosition.y / stageScale;
    const width = dimensions.width / stageScale;
    const height = dimensions.height / stageScale;
    const margin = 200; // buffer so objects don't pop in at the edge
    return { x: x - margin, y: y - margin, width: width + margin * 2, height: height + margin * 2 };
  }, [stagePosition.x, stagePosition.y, stageScale, dimensions.width, dimensions.height]);

  const visibleObjects = useMemo(() => {
    return sortedObjects.filter((obj) => {
      if (obj.type === 'connector') {
        const from = objects.find(o => o.id === obj.fromId);
        const to = objects.find(o => o.id === obj.toId);
        if (from && to) {
          const minX = Math.min(from.x, to.x);
          const minY = Math.min(from.y, to.y);
          const maxX = Math.max(from.x + (from.width || 0), to.x + (to.width || 0));
          const maxY = Math.max(from.y + (from.height || 0), to.y + (to.height || 0));
          return rectsIntersect(viewportBounds, { x: minX, y: minY, width: maxX - minX, height: maxY - minY });
        }
        return true;
      }
      const bounds = getObjectBounds(obj);
      if (!bounds) return true;
      return rectsIntersect(viewportBounds, bounds);
    });
  }, [sortedObjects, viewportBounds, objects]);

  // Connector state is only meaningful when CONNECTOR tool is active.
  // Rather than resetting via useEffect (extra render), we derive effective values:
  const effectiveConnectingFrom = selectedTool === 'CONNECTOR' ? connectingFrom : null;
  const effectivePreview = selectedTool === 'CONNECTOR' ? connectingPreview : null;

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // --- Layer caching for pan/zoom: draw 1 bitmap instead of N shapes ---
  const cacheLayer = useCallback(() => {
    const layer = layerRef.current;
    if (!layer || isCachedRef.current) return;
    try {
      const stage = layer.getStage();
      const scale = stage.scaleX();
      // Cache at screen resolution to avoid huge offscreen canvases
      layer.cache({ pixelRatio: Math.min(scale * (window.devicePixelRatio || 1), 2) });
      isCachedRef.current = true;
    } catch (e) {
      console.warn('Layer cache failed:', e);
    }
  }, []);

  const uncacheLayer = useCallback(() => {
    if (!isCachedRef.current || !layerRef.current) return;
    layerRef.current.clearCache();
    isCachedRef.current = false;
  }, []);

  // Cache on pan start, uncache on pan end
  const handleStageDragStart = useCallback((e) => {
    if (e.target !== e.target.getStage()) return;
    cacheLayer();
  }, [cacheLayer]);

  const wrappedDragEnd = useCallback((e) => {
    if (e.target === e.target.getStage()) {
      uncacheLayer();
    }
    onDragEnd(e);
  }, [onDragEnd, uncacheLayer]);

  // Cache on first wheel event, uncache 150ms after last wheel event
  const wrappedWheel = useCallback((e) => {
    cacheLayer();
    clearTimeout(wheelTimeoutRef.current);
    wheelTimeoutRef.current = setTimeout(uncacheLayer, 150);
    onWheel(e);
  }, [onWheel, cacheLayer, uncacheLayer]);

  // Cleanup wheel timeout on unmount
  useEffect(() => {
    return () => clearTimeout(wheelTimeoutRef.current);
  }, []);

  // Duplicate helper: strips id/timestamps and offsets position
  const duplicateObjects = useCallback(async (sourceObjects, offset = 20) => {
    const newIds = [];
    for (const obj of sourceObjects) {
      // Strip metadata fields before duplicating
      const { id: _id, createdAt: _ca, updatedAt: _ua, createdBy: _cb, updatedBy: _ub, ...data } = obj;
      const newObj = { ...data, x: (data.x || 0) + offset, y: (data.y || 0) + offset, zIndex: objects.length + newIds.length + 1 };
      try {
        const newId = await createObject(newObj, user.uid);
        newIds.push(newId);
      } catch (err) {
        console.error('Failed to duplicate object:', err);
      }
    }
    if (newIds.length > 0) onSelectMultiple(newIds);
  }, [objects, user, onSelectMultiple]);

  // Keyboard shortcuts: Delete, Escape, Duplicate (Ctrl+D), Copy (Ctrl+C), Paste (Ctrl+V)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const mod = e.metaKey || e.ctrlKey;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectIds.size > 0) {
        e.preventDefault();
        const idsToDelete = [...selectedObjectIds];
        const connectorIds = objects
          .filter(o => o.type === 'connector' &&
            (idsToDelete.includes(o.fromId) || idsToDelete.includes(o.toId)))
          .map(o => o.id);
        const allIds = [...new Set([...idsToDelete, ...connectorIds])];
        (async () => {
          try {
            await deleteMultipleObjects(allIds);
          } catch (err) {
            console.error('Failed to delete objects:', err);
          }
          onClearSelection();
        })();
      } else if (e.key === 'Escape') {
        setConnectingFrom(null);
        setConnectingPreview(null);
        onClearSelection();
      } else if (mod && e.key === 'd' && selectedObjectIds.size > 0) {
        // Duplicate
        e.preventDefault();
        const selected = objects.filter(o => selectedObjectIds.has(o.id));
        duplicateObjects(selected);
      } else if (mod && e.key === 'c' && selectedObjectIds.size > 0) {
        // Copy
        e.preventDefault();
        clipboardRef.current = objects.filter(o => selectedObjectIds.has(o.id));
      } else if (mod && e.key === 'v' && clipboardRef.current.length > 0) {
        // Paste
        e.preventDefault();
        duplicateObjects(clipboardRef.current, 40);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectIds, onClearSelection, objects, duplicateObjects]);

  const pointerToCanvas = useCallback((stage) => {
    const pointerPos = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    return transform.point(pointerPos);
  }, []);

  // Handle stage click
  const handleStageClick = async (e) => {
    if (isDrawingSelection.current) {
      isDrawingSelection.current = false;
      return;
    }

    const stage = e.target.getStage();
    const canvasPos = pointerToCanvas(stage);
    const clickedOnStage = e.target === stage;

    // Connector tool: two-click creation
    if (selectedTool === 'CONNECTOR') {
      const clickedId = findClickedObjectId(e.target, objects);
      if (clickedId) {
        const clickedObj = objects.find(o => o.id === clickedId);
        if (clickedObj && clickedObj.type !== 'connector') {
          if (!connectingFrom) {
            // First click: set start object
            setConnectingFrom(clickedId);
            const center = getObjectCenter(clickedObj);
            setConnectingPreview({ fromX: center.x, fromY: center.y, toX: center.x, toY: center.y });
          } else if (clickedId !== connectingFrom) {
            // Second click: create connector
            const fromObj = objects.find(o => o.id === connectingFrom);
            const toObj = clickedObj;
            const fromCenter = getObjectCenter(fromObj);
            const toCenter = getObjectCenter(toObj);
            try {
              await createObject({
                type: 'connector',
                fromId: connectingFrom,
                toId: clickedId,
                fromX: fromCenter.x,
                fromY: fromCenter.y,
                toX: toCenter.x,
                toY: toCenter.y,
                strokeColor: selectedColor || '#6B7280',
                strokeWidth: 2,
                arrowEnd: true,
                zIndex: objects.length + 1,
              }, user.uid);
            } catch (err) {
              console.error('Failed to create connector:', err);
            }
            setConnectingFrom(null);
            setConnectingPreview(null);
          }
        }
      } else if (clickedOnStage) {
        // Clicked empty space — cancel connector creation
        setConnectingFrom(null);
        setConnectingPreview(null);
      }
      return;
    }

    // Deselect when clicking empty canvas
    if (clickedOnStage) {
      onClearSelection();
    }

    if (selectedTool === 'SELECT') return;
    if (!clickedOnStage) return;

    try {
      if (selectedTool === 'STICKY_NOTE') {
        await createObject({
          type: 'stickyNote',
          x: canvasPos.x,
          y: canvasPos.y,
          width: 200,
          height: 150,
          text: '',
          color: selectedColor ?? TYPE_DEFAULT_COLORS.stickyNote,
          rotation: 0,
          zIndex: objects.length + 1,
        }, user.uid);
      } else if (selectedTool === 'RECTANGLE') {
        await createObject({
          type: 'rectangle',
          x: canvasPos.x,
          y: canvasPos.y,
          width: 120,
          height: 120,
          color: selectedColor ?? TYPE_DEFAULT_COLORS.rectangle,
          rotation: 0,
          zIndex: objects.length + 1,
        }, user.uid);
      } else if (selectedTool === 'CIRCLE') {
        await createObject({
          type: 'circle',
          x: canvasPos.x,
          y: canvasPos.y,
          radius: 60,
          color: selectedColor ?? TYPE_DEFAULT_COLORS.circle,
          rotation: 0,
          zIndex: objects.length + 1,
        }, user.uid);
      } else if (selectedTool === 'TEXT') {
        await createObject({
          type: 'text',
          x: canvasPos.x,
          y: canvasPos.y,
          text: '',
          fontSize: 20,
          width: 200,
          color: selectedColor || TYPE_DEFAULT_COLORS.text || '#374151',
          rotation: 0,
          zIndex: objects.length + 1,
        }, user.uid);
      } else if (selectedTool === 'LINE') {
        await createObject({
          type: 'line',
          x: canvasPos.x,
          y: canvasPos.y,
          width: 150,
          color: selectedColor || TYPE_DEFAULT_COLORS.line || '#6B7280',
          strokeWidth: 3,
          rotation: 0,
          zIndex: objects.length + 1,
        }, user.uid);
      } else if (selectedTool === 'FRAME') {
        await createObject({
          type: 'frame',
          x: canvasPos.x,
          y: canvasPos.y,
          width: 400,
          height: 300,
          title: 'Frame',
          color: selectedColor || TYPE_DEFAULT_COLORS.frame || '#6B7280',
          rotation: 0,
          zIndex: 0,
        }, user.uid);
      }
    } catch (err) {
      console.error('Failed to create object:', err);
    }
  };

  // Drag-to-select (only when Shift is held)
  const handleMouseDown = (e) => {
    if (selectedTool !== 'SELECT') return;
    if (e.target !== e.target.getStage()) return;
    if (!e.evt.shiftKey) return; // Only rubber-band when Shift is held

    const stage = e.target.getStage();
    const pos = pointerToCanvas(stage);
    dragStartPos.current = pos;
    isDrawingSelection.current = false;
    setSelectionRect(null);
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const canvasPos = pointerToCanvas(stage);

    // Track cursor for multiplayer
    if (onCursorMove) {
      onCursorMove(canvasPos.x, canvasPos.y);
    }

    // Update connector preview line
    if (effectiveConnectingFrom && effectivePreview) {
      setConnectingPreview(prev => ({ ...prev, toX: canvasPos.x, toY: canvasPos.y }));
    }

    // Rubber band selection
    if (dragStartPos.current && selectedTool === 'SELECT') {
      const dx = canvasPos.x - dragStartPos.current.x;
      const dy = canvasPos.y - dragStartPos.current.y;

      if (!isDrawingSelection.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        isDrawingSelection.current = true;
      }

      if (isDrawingSelection.current) {
        setSelectionRect({
          x1: dragStartPos.current.x,
          y1: dragStartPos.current.y,
          x2: canvasPos.x,
          y2: canvasPos.y,
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawingSelection.current && selectionRect) {
      const selRect = {
        x: Math.min(selectionRect.x1, selectionRect.x2),
        y: Math.min(selectionRect.y1, selectionRect.y2),
        width: Math.abs(selectionRect.x2 - selectionRect.x1),
        height: Math.abs(selectionRect.y2 - selectionRect.y1),
      };

      const selectedIds = objects
        .filter(obj => {
          const bounds = getObjectBounds(obj);
          return bounds && rectsIntersect(selRect, bounds);
        })
        .map(obj => obj.id);

      if (selectedIds.length > 0) {
        onSelectMultiple(selectedIds);
      } else {
        onClearSelection();
      }
    }

    setSelectionRect(null);
    dragStartPos.current = null;
    // NOTE: isDrawingSelection.current is intentionally NOT reset here.
    // The click event fires after mouseup; if we reset now, handleStageClick
    // would not know a rubber-band just finished and would call onClearSelection().
    // Instead, handleStageClick resets it after its guard check.
  };

  const handleObjectSelect = useCallback((objectId, nativeEvent) => {
    if (!objectId) {
      onClearSelection();
      return;
    }
    const additive = nativeEvent?.shiftKey || false;
    onSelectObject(objectId, additive);
  }, [onSelectObject, onClearSelection]);

  // Group drag
  const handleGroupDragMove = useCallback((draggedId, e) => {
    if (selectedObjectIds.size <= 1) return;
    if (!selectedObjectIds.has(draggedId)) return;

    const stage = stageRef.current;
    if (!stage) return;

    const node = e.target;
    const draggedObj = objects.find(o => o.id === draggedId);
    if (!draggedObj) return;

    const dx = node.x() - draggedObj.x;
    const dy = node.y() - draggedObj.y;

    selectedObjectIds.forEach(id => {
      if (id === draggedId) return;
      const otherNode = stage.findOne(`#${id}`);
      const otherObj = objects.find(o => o.id === id);
      if (otherNode && otherObj) {
        otherNode.x(otherObj.x + dx);
        otherNode.y(otherObj.y + dy);
      }
    });
  }, [selectedObjectIds, objects]);

  const handleGroupDragEnd = useCallback(async (draggedId) => {
    if (selectedObjectIds.size <= 1) return;
    if (!selectedObjectIds.has(draggedId)) return;

    const stage = stageRef.current;
    if (!stage) return;

    const updates = [...selectedObjectIds].map(id => {
      const node = stage.findOne(`#${id}`);
      if (!node) return null;
      return { id, changes: { x: node.x(), y: node.y() } };
    }).filter(Boolean);

    if (updates.length > 0) {
      try {
        await updateMultipleObjects(updates, user.uid);
      } catch (err) {
        console.error('Failed to update group positions:', err);
      }
    }
  }, [selectedObjectIds, user]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-gray-50"
      style={{ top: '60px', cursor: selectedTool === 'SELECT' ? (shiftHeld ? 'crosshair' : 'grab') : 'default' }}
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          draggable={selectedTool === 'SELECT' && !shiftHeld}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePosition.x}
          y={stagePosition.y}
          onWheel={wrappedWheel}
          onDragStart={handleStageDragStart}
          onDragEnd={wrappedDragEnd}
          onClick={handleStageClick}
          onTap={handleStageClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Layer ref={layerRef} perfectDrawEnabled={false} shadowForStrokeEnabled={false}>
            {visibleObjects.map((object) => (
              <ObjectFactory
                key={object.id}
                object={object}
                allObjects={objects}
                isSelected={selectedObjectIds.has(object.id)}
                onSelect={handleObjectSelect}
                onGroupDragMove={handleGroupDragMove}
                onGroupDragEnd={handleGroupDragEnd}
                selectedObjectIds={selectedObjectIds}
              />
            ))}
            <TransformerComponent selectedObjectIds={selectedObjectIds} stageRef={stageRef} />
            {/* Connector preview line */}
            {effectivePreview && (
              <Line
                points={[effectivePreview.fromX, effectivePreview.fromY, effectivePreview.toX, effectivePreview.toY]}
                stroke="#3B82F6"
                strokeWidth={2}
                dash={[6, 3]}
                listening={false}
              />
            )}
            <SelectionRect rect={selectionRect} />
          </Layer>

          <MultipleCursors presenceUsers={presenceUsers} stageScale={stageScale} />
        </Stage>
      )}

      {loading && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
          <span className="text-sm text-gray-600">Loading board...</span>
        </div>
      )}

      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-50 px-4 py-2 rounded-lg shadow-lg border border-red-200">
          <span className="text-sm text-red-600">Failed to load board. Check your connection.</span>
        </div>
      )}

      {/* Status bar */}
      <div className="fixed bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
        <span className="text-sm text-gray-600">
          Objects: {objects.length} (visible: {visibleObjects.length})
          {effectiveConnectingFrom && ' | Click an object to connect'}
        </span>
      </div>
    </div>
  );
}
