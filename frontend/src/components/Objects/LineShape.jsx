import { memo } from 'react';
import { Group, Line, Rect } from 'react-konva';
import { updateObject } from '../../services/board';
import { useAuth } from '../../hooks/useAuth.js';

const HIT_HEIGHT = 20;

export default memo(function LineShape({ object, isSelected, onSelect, onGroupDragMove, onGroupDragEnd, selectedObjectIds }) {
  const { user } = useAuth();

  const length = object.width || 150;
  const color = object.color || '#6B7280';
  const strokeWidth = object.strokeWidth || 3;

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

  const handleTransformEnd = async (e) => {
    const node = e.target;
    const scaleX = node.scaleX();
    node.scaleX(1);
    node.scaleY(1);
    try {
      await updateObject(object.id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(20, length * Math.abs(scaleX)),
        rotation: node.rotation(),
      }, user.uid);
    } catch (error) {
      console.error('Failed to update transform:', error);
    }
  };

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
      {/* Invisible rect gives the Group a bounding box for the Transformer (not for hit testing — the Line's hitStrokeWidth handles that) */}
      <Rect
        x={0}
        y={-HIT_HEIGHT / 2}
        width={length}
        height={HIT_HEIGHT}
        fill="transparent"
        hitStrokeWidth={0}
      />
      <Line
        points={[0, 0, length, 0]}
        stroke={isSelected ? '#3B82F6' : color}
        strokeWidth={strokeWidth}
        hitStrokeWidth={14}
        lineCap="round"
      />
    </Group>
  );
});
