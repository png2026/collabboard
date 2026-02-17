import { Group, Circle, Rect, Text } from 'react-konva';

export default function Cursor({ user, stageScale }) {
  if (!user?.cursor) return null;

  const { x, y } = user.cursor;
  const color = user.color || '#3B82F6';
  const name = user.displayName || 'User';

  // Counter-scale label so it stays the same visual size regardless of zoom
  const labelScale = 1 / (stageScale || 1);
  const dotRadius = 6 * labelScale;
  const fontSize = 12 * labelScale;
  const padding = 4 * labelScale;
  const labelWidth = Math.min(name.length * 7 + padding * 2, 120) * labelScale;
  const labelHeight = (fontSize + padding * 2);

  return (
    <Group x={x} y={y}>
      {/* Cursor dot */}
      <Circle
        radius={dotRadius}
        fill={color}
        stroke="white"
        strokeWidth={1.5 * labelScale}
      />

      {/* Name label */}
      <Rect
        x={dotRadius + 4 * labelScale}
        y={-labelHeight / 2}
        width={labelWidth}
        height={labelHeight}
        fill={color}
        cornerRadius={3 * labelScale}
      />
      <Text
        x={dotRadius + 4 * labelScale + padding}
        y={-labelHeight / 2 + padding}
        text={name}
        fontSize={fontSize}
        fill="white"
        fontStyle="bold"
        fontFamily="system-ui, sans-serif"
      />
    </Group>
  );
}
