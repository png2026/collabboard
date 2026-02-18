import { useState, useCallback } from 'react';

const ZOOM_FACTOR = 1.15;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

export function useCanvas() {
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [selectedTool, setSelectedTool] = useState('SELECT');
  const [selectedColor, setSelectedColor] = useState(null);

  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();

    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * ZOOM_FACTOR : oldScale / ZOOM_FACTOR;
    const constrainedScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));

    const newPos = {
      x: pointer.x - mousePointTo.x * constrainedScale,
      y: pointer.y - mousePointTo.y * constrainedScale,
    };

    setStageScale(constrainedScale);
    setStagePosition(newPos);
  }, []);

  const handleDragEnd = useCallback((e) => {
    // Only update stage position when the Stage itself is dragged (panning),
    // not when child objects are dragged (their dragend events bubble up here)
    if (e.target !== e.target.getStage()) return;
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
    setStageScale((scale) => Math.min(MAX_ZOOM, scale * ZOOM_FACTOR));
  }, []);

  const zoomOut = useCallback(() => {
    setStageScale((scale) => Math.max(MIN_ZOOM, scale / ZOOM_FACTOR));
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
