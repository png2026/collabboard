import { useRef, useEffect, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { useBoardObjects } from '../../hooks/useBoardObjects';
import { useAuth } from '../../hooks/useAuth.js';
import { createObject, deleteObject } from '../../services/board';
import { TYPE_DEFAULT_COLORS } from '../../utils/colors';
import ObjectFactory from '../Objects/ObjectFactory';
import MultipleCursors from '../Presence/MultipleCursors';

export default function BoardCanvas({ stageScale, stagePosition, selectedTool, selectedColor, onWheel, onDragEnd, presenceUsers, onCursorMove, selectedObjectId, onSelectObject }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const { user } = useAuth();
  const { objects, loading, error } = useBoardObjects();

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

  // Delete selected object with Delete/Backspace key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectId) {
        // Don't delete if user is typing in an input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        deleteObject(selectedObjectId)
          .then(() => onSelectObject(null))
          .catch(console.error);
      } else if (e.key === 'Escape') {
        onSelectObject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId, onSelectObject]);

  // Handle stage click to create objects
  const handleStageClick = async (e) => {
    // Deselect when clicking empty canvas
    if (e.target === e.target.getStage()) {
      onSelectObject(null);
    }

    // Only create objects if a tool is selected (not SELECT)
    if (selectedTool === 'SELECT') return;

    // Don't create if clicking on an existing object
    if (e.target !== e.target.getStage()) return;

    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();

    // Convert screen coordinates to canvas coordinates
    const transform = stage.getAbsoluteTransform().copy().invert();
    const canvasPos = transform.point(pointerPos);

    try {
      if (selectedTool === 'STICKY_NOTE') {
        await createObject(
          {
            type: 'stickyNote',
            x: canvasPos.x,
            y: canvasPos.y,
            width: 200,
            height: 150,
            text: '',
            color: selectedColor ?? TYPE_DEFAULT_COLORS.stickyNote,
            rotation: 0,
            zIndex: objects.length,
          },
          user.uid
        );
      } else if (selectedTool === 'RECTANGLE') {
        await createObject(
          {
            type: 'rectangle',
            x: canvasPos.x,
            y: canvasPos.y,
            width: 120,
            height: 120,
            color: selectedColor ?? TYPE_DEFAULT_COLORS.rectangle,
            rotation: 0,
            zIndex: objects.length,
          },
          user.uid
        );
      } else if (selectedTool === 'CIRCLE') {
        await createObject(
          {
            type: 'circle',
            x: canvasPos.x,
            y: canvasPos.y,
            radius: 60,
            color: selectedColor ?? TYPE_DEFAULT_COLORS.circle,
            rotation: 0,
            zIndex: objects.length,
          },
          user.uid
        );
      }
    } catch (error) {
      console.error('Failed to create object:', error);
    }
  };

  // Track mouse position for multiplayer cursors
  const handleMouseMove = (e) => {
    if (!onCursorMove) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pointerPos = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    const canvasPos = transform.point(pointerPos);
    onCursorMove(canvasPos.x, canvasPos.y);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-gray-50"
      style={{ top: '60px' }} // Account for toolbar height
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          draggable={selectedTool === 'SELECT'}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePosition.x}
          y={stagePosition.y}
          onWheel={onWheel}
          onDragEnd={onDragEnd}
          onClick={handleStageClick}
          onTap={handleStageClick}
          onMouseMove={handleMouseMove}
        >
          <Layer>
            {objects.map((object) => (
              <ObjectFactory
                key={object.id}
                object={object}
                isSelected={selectedObjectId === object.id}
                onSelect={onSelectObject}
              />
            ))}
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

      {/* Object count */}
      <div className="fixed bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
        <span className="text-sm text-gray-600">
          Objects: {objects.length}
        </span>
      </div>
    </div>
  );
}
