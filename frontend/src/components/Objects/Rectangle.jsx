import { memo } from 'react';
import { Group, Rect } from 'react-konva';
import { updateObject } from '../../services/board';
import { useAuth } from '../../hooks/useAuth.js';

export default memo(function Rectangle({ object, isSelected, onSelect, onGroupDragMove, onGroupDragEnd, selectedObjectIds }) {
  const { user } = useAuth();
  const w = object.width || 120;
  const h = object.height || 120;

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
        width: Math.max(20, w * scaleX),
        height: Math.max(20, h * scaleY),
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

  return (
    <Group
      id={object.id}
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
      onTransformEnd={handleTransformEnd}
    >
      <Rect
        width={w}
        height={h}
        fill={object.color || '#E5E7EB'}
        stroke={isSelected ? '#3B82F6' : '#9CA3AF'}
        strokeWidth={isSelected ? 3 : 2}
        shadowColor="black"
        shadowBlur={4}
        shadowOpacity={0.15}
        shadowOffsetX={2}
        shadowOffsetY={2}
        cornerRadius={4}
      />
    </Group>
  );
});
