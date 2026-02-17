import { Group, Rect } from 'react-konva';
import { updateObject } from '../../services/board';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function Rectangle({ object }) {
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
    >
      <Rect
        width={object.width || 160}
        height={object.height || 100}
        fill={object.color || '#BFDBFE'}
        stroke="#93C5FD"
        strokeWidth={2}
        shadowColor="black"
        shadowBlur={4}
        shadowOpacity={0.15}
        shadowOffsetX={2}
        shadowOffsetY={2}
        cornerRadius={4}
      />
    </Group>
  );
}
