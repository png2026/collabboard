import { memo, useMemo } from 'react';
import { Arrow, Line } from 'react-konva';
import { getConnectionPoints } from '../../utils/connectorUtils';

export default memo(function Connector({ object, allObjects, isSelected, onSelect }) {
  const fromObj = useMemo(() => allObjects?.find(o => o.id === object.fromId), [allObjects, object.fromId]);
  const toObj = useMemo(() => allObjects?.find(o => o.id === object.toId), [allObjects, object.toId]);

  const points = useMemo(() => {
    if (fromObj && toObj) {
      const cp = getConnectionPoints(fromObj, toObj);
      return [cp.fromX, cp.fromY, cp.toX, cp.toY];
    }
    return [
      object.fromX || 0, object.fromY || 0,
      object.toX || 0, object.toY || 0,
    ];
  }, [fromObj, toObj, object.fromX, object.fromY, object.toX, object.toY]);

  const color = isSelected ? '#3B82F6' : (object.strokeColor || '#6B7280');
  const ShapeComponent = object.arrowEnd !== false ? Arrow : Line;

  return (
    <ShapeComponent
      id={object.id}
      points={points}
      stroke={color}
      strokeWidth={object.strokeWidth || 2}
      fill={object.arrowEnd !== false ? color : undefined}
      pointerLength={object.arrowEnd !== false ? 10 : undefined}
      pointerWidth={object.arrowEnd !== false ? 10 : undefined}
      hitStrokeWidth={12}
      onClick={(e) => onSelect(object.id, e.evt)}
      onTap={(e) => onSelect(object.id, e.evt)}
      listening={true}
    />
  );
});
