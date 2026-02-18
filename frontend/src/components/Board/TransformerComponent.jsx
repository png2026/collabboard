import { useRef, useEffect } from 'react';
import { Transformer } from 'react-konva';

export default function TransformerComponent({ selectedObjectIds, stageRef }) {
  const transformerRef = useRef(null);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer || !stageRef?.current) return;

    const stage = stageRef.current;
    const nodes = [...selectedObjectIds]
      .map(id => stage.findOne(`#${id}`))
      .filter(Boolean);

    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [selectedObjectIds, stageRef]);

  if (selectedObjectIds.size === 0) return null;

  return (
    <Transformer
      ref={transformerRef}
      borderStroke="#3B82F6"
      borderStrokeWidth={1.5}
      anchorStroke="#3B82F6"
      anchorFill="white"
      anchorSize={8}
      anchorCornerRadius={2}
      rotateAnchorOffset={25}
      enabledAnchors={[
        'top-left', 'top-right', 'bottom-left', 'bottom-right',
        'middle-left', 'middle-right', 'top-center', 'bottom-center',
      ]}
      boundBoxFunc={(oldBox, newBox) => {
        if (Math.abs(newBox.width) < 20) return oldBox;
        if (Math.abs(newBox.height) < 5) return oldBox;
        return newBox;
      }}
    />
  );
}
