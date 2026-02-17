import { useState, useCallback } from 'react';

export function useCanvas() {
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [selectedTool, setSelectedTool] = useState('SELECT');
  const [selectedColor, setSelectedColor] = useState('#FDE68A'); // Default yellow

  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();

    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    // Calculate mouse position relative to stage
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    // Zoom scale factor
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Constrain zoom levels
    const constrainedScale = Math.max(0.1, Math.min(5, newScale));

    // Calculate new position to zoom toward mouse
    const newPos = {
      x: pointer.x - mousePointTo.x * constrainedScale,
      y: pointer.y - mousePointTo.y * constrainedScale,
    };

    setStageScale(constrainedScale);
    setStagePosition(newPos);
  }, []);

  const handleDragEnd = useCallback((e) => {
    setStagePosition({
      x: e.target.x(),
      y: e.target.y(),
    });
  }, []);

  const resetView = useCallback(() => {
    setStageScale(1);
    setStagePosition({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => {
    setStageScale((scale) => Math.min(5, scale * 1.2));
  }, []);

  const zoomOut = useCallback(() => {
    setStageScale((scale) => Math.max(0.1, scale / 1.2));
  }, []);

  return {
    stageScale,
    stagePosition,
    selectedTool,
    selectedColor,
    setSelectedTool,
    setSelectedColor,
    handleWheel,
    handleDragEnd,
    resetView,
    zoomIn,
    zoomOut,
  };
}
