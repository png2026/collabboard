import { Group, Circle as KonvaCircle } from 'react-konva';
import { updateObject } from '../../services/board';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function Circle({ object }) {
  const { user } = useAuth();

  const handleDragEnd = async (e) => {
    try {
      await updateObject(object.id, { x: e.target.x(), y: e.target.y() }, user.uid);
    } catch (error) {
      console.error('Failed to update position:', error);
    }
  };

  const radius = object.radius || 60;

  return (
    <Group
      x={object.x}
      y={object.y}
      draggable
      onDragEnd={handleDragEnd}
    >
      <KonvaCircle
        radius={radius}
        fill={object.color || '#BBF7D0'}
        stroke="#86EFAC"
        strokeWidth={2}
        shadowColor="black"
        shadowBlur={4}
        shadowOpacity={0.15}
        shadowOffsetX={2}
        shadowOffsetY={2}
      />
    </Group>
  );
}
