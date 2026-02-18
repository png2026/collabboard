import { memo } from 'react';
import { Group, Circle as KonvaCircle } from 'react-konva';
import { updateObject } from '../../services/board';
import { useAuth } from '../../hooks/useAuth.js';

export default memo(function Circle({ object, isSelected, onSelect, onGroupDragMove, onGroupDragEnd, selectedObjectIds }) {
  const { user } = useAuth();

  const handleTransformEnd = async (e) => {
    const node = e.target;
    const scaleX = node.scaleX();
    node.scaleX(1);
    node.scaleY(1);
    try {
      await updateObject(object.id, {
        x: node.x(),
        y: node.y(),
        radius: Math.max(10, (object.radius || 60) * scaleX),
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

  const radius = object.radius || 60;

  return (
    <Group
      id={object.id}
      x={object.x}
      y={object.y}
      rotation={object.rotation || 0}
      draggable
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onClick={(e) => onSelect(object.id, e.evt)}
      onTap={(e) => onSelect(object.id, e.evt)}
      onTransformEnd={handleTransformEnd}
    >
      <KonvaCircle
        radius={radius}
        fill={object.color || '#E5E7EB'}
        stroke={isSelected ? '#3B82F6' : '#9CA3AF'}
        strokeWidth={isSelected ? 3 : 2}
        shadowColor="black"
        shadowBlur={4}
        shadowOpacity={0.15}
        shadowOffsetX={2}
        shadowOffsetY={2}
      />
    </Group>
  );
});
