import { useRef, useEffect, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { useBoardObjects } from '../../hooks/useBoardObjects';
import { useAuth } from '../../hooks/useAuth.jsx';
import { createObject } from '../../services/board';
import ObjectFactory from '../Objects/ObjectFactory';

export default function BoardCanvas({ stageScale, stagePosition, selectedTool, selectedColor, onWheel, onDragEnd }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const { user } = useAuth();
  const { objects, loading } = useBoardObjects();

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

  // Handle stage click to create objects
  const handleStageClick = async (e) => {
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
            color: selectedColor,
            rotation: 0,
            zIndex: objects.length,
          },
          user.uid
        );
      }
      // Future tools will be handled here
    } catch (error) {
      console.error('Failed to create object:', error);
    }
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
        >
          <Layer>
            {/* Render all board objects */}
            {objects.map((object) => (
              <ObjectFactory key={object.id} object={object} />
            ))}
          </Layer>
        </Stage>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
          <span className="text-sm text-gray-600">Loading board...</span>
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
