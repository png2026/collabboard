import { memo } from 'react';
import { Group, Rect } from 'react-konva';
import { updateObject } from '../../services/board';
import { useAuth } from '../../hooks/useAuth.js';

export default memo(function Rectangle({ object, isSelected, onSelect }) {
  const { user } = useAuth();

  const handleDragEnd = async (e) => {
    try {
      await updateObject(object.id, { x: e.target.x(), y: e.target.y() }, user.uid);
    } catch (error) {
      console.error('Failed to update position:', error);
    }
  };

  return (
    <Group
      x={object.x}
      y={object.y}
      draggable
      onDragEnd={handleDragEnd}
      onClick={() => onSelect(object.id)}
      onTap={() => onSelect(object.id)}
    >
      <Rect
        width={object.width || 120}
        height={object.height || 120}
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
