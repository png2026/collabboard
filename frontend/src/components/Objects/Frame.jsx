import { useRef, useEffect, memo } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { updateObject } from '../../services/board';
import { useAuth } from '../../hooks/useAuth.js';

const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 300;
const TITLE_HEIGHT = 30;
const TITLE_PADDING = 8;

export default memo(function Frame({ object, isSelected, onSelect, onGroupDragMove, onGroupDragEnd, selectedObjectIds }) {
  const { user } = useAuth();
  const groupRef = useRef();
  const inputRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (inputRef.current && document.body.contains(inputRef.current)) {
        document.body.removeChild(inputRef.current);
        inputRef.current = null;
      }
    };
  }, []);

  const w = object.width || DEFAULT_WIDTH;
  const h = object.height || DEFAULT_HEIGHT;
  const borderColor = object.color || '#6B7280';

  const handleTransformEnd = async (e) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    try {
      await updateObject(object.id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(100, w * scaleX),
        height: Math.max(80, h * scaleY),
        rotation: node.rotation(),
      }, user.uid);
    } catch (error) {
      console.error('Failed to update transform:', error);
    }
  };

  const handleDragMove = (e) => {
    if (onGroupDragMove) onGroupDragMove(object.id, e);
  };

  const handleDragEnd = async (e) => {
    if (selectedObjectIds?.size > 1 && selectedObjectIds.has(object.id)) {
      if (onGroupDragEnd) {
        await onGroupDragEnd(object.id, e);
        return;
      }
    }
    try {
      await updateObject(object.id, { x: e.target.x(), y: e.target.y() }, user.uid);
    } catch (error) {
      console.error('Failed to update position:', error);
    }
  };

  const removeInput = () => {
    if (inputRef.current) {
      inputRef.current._cleanup?.();
      if (document.body.contains(inputRef.current)) {
        document.body.removeChild(inputRef.current);
      }
      inputRef.current = null;
    }
  };

  const handleDoubleClick = () => {
    removeInput();

    const stage = groupRef.current.getStage();
    const stageBox = stage.container().getBoundingClientRect();
    const scale = stage.scaleX();

    // Convert stage coordinates → viewport pixels
    const viewportX = stageBox.left + stage.x() + object.x * scale;
    const viewportY = stageBox.top + stage.y() + object.y * scale;
    const scaledPad = TITLE_PADDING * scale;

    const input = document.createElement('input');
    inputRef.current = input;
    document.body.appendChild(input);

    input.value = object.title || 'Frame';
    input.type = 'text';
    input.style.position = 'absolute';
    input.style.top = viewportY + scaledPad + 'px';
    input.style.left = viewportX + scaledPad + 'px';
    input.style.width = (w - TITLE_PADDING * 2) * scale + 'px';
    input.style.height = TITLE_HEIGHT * scale + 'px';
    input.style.fontSize = 14 * scale + 'px';
    input.style.border = '2px solid #3B82F6';
    input.style.borderRadius = '2px';
    input.style.padding = '2px 4px';
    input.style.margin = '0';
    input.style.background = 'white';
    input.style.outline = 'none';
    input.style.fontFamily = 'Arial, sans-serif';
    input.style.fontWeight = 'bold';
    input.style.color = borderColor;
    input.style.zIndex = '1000';

    input.focus();
    input.select();

    const handleSave = async () => {
      if (!mountedRef.current) return;
      const newTitle = input.value;
      if (newTitle !== object.title) {
        try {
          await updateObject(object.id, { title: newTitle }, user.uid);
        } catch (error) {
          if (mountedRef.current) console.error('Failed to update title:', error);
        }
      }
      removeInput();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        removeInput();
      }
    };
    input.addEventListener('blur', handleSave);
    input.addEventListener('keydown', handleKeyDown);
    input._cleanup = () => {
      input.removeEventListener('blur', handleSave);
      input.removeEventListener('keydown', handleKeyDown);
    };
  };

  return (
    <Group
      id={object.id}
      ref={groupRef}
      x={object.x}
      y={object.y}
      width={w}
      height={h}
      rotation={object.rotation || 0}
      draggable
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onClick={(e) => onSelect(object.id, e.evt)}
      onTap={(e) => onSelect(object.id, e.evt)}
      onDblClick={handleDoubleClick}
      onDblTap={handleDoubleClick}
      onTransformEnd={handleTransformEnd}
    >
      {/* Frame body */}
      <Rect
        width={w}
        height={h}
        fill="rgba(249, 250, 251, 0.5)"
        stroke={isSelected ? '#3B82F6' : borderColor}
        strokeWidth={isSelected ? 2 : 1.5}
        cornerRadius={8}
        dash={[8, 4]}
      />
      {/* Title bar background */}
      <Rect
        x={0}
        y={0}
        width={w}
        height={TITLE_HEIGHT}
        fill={borderColor}
        opacity={0.15}
        cornerRadius={[8, 8, 0, 0]}
        listening={false}
      />
      {/* Title text */}
      <Text
        x={TITLE_PADDING}
        y={TITLE_PADDING}
        text={object.title || 'Frame'}
        fontSize={14}
        fontFamily="Arial, sans-serif"
        fontStyle="bold"
        fill={borderColor}
        width={w - TITLE_PADDING * 2}
        listening={false}
      />
    </Group>
  );
});
