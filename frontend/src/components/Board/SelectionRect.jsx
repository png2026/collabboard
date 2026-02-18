import { Rect } from 'react-konva';

export default function SelectionRect({ rect }) {
  if (!rect) return null;
  return (
    <Rect
      x={Math.min(rect.x1, rect.x2)}
      y={Math.min(rect.y1, rect.y2)}
      width={Math.abs(rect.x2 - rect.x1)}
      height={Math.abs(rect.y2 - rect.y1)}
      fill="rgba(59, 130, 246, 0.1)"
      stroke="#3B82F6"
      strokeWidth={1}
      dash={[4, 4]}
      listening={false}
    />
  );
}
