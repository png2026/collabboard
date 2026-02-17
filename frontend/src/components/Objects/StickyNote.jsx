import { useState, useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { updateObject } from '../../services/board';
import { useAuth } from '../../hooks/useAuth.jsx';

const STICKY_NOTE_WIDTH = 200;
const STICKY_NOTE_HEIGHT = 150;
const PADDING = 10;

export default function StickyNote({ object }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const groupRef = useRef();

  const handleDragEnd = async (e) => {
    const newPos = {
      x: e.target.x(),
      y: e.target.y(),
    };

    try {
      await updateObject(object.id, newPos, user.uid);
    } catch (error) {
      console.error('Failed to update position:', error);
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);

    // Get the absolute position of the sticky note on screen
    const stage = groupRef.current.getStage();
    const group = groupRef.current;
    const transform = group.getAbsoluteTransform();
    const absPos = transform.point({ x: 0, y: 0 });

    // Create textarea overlay
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    // Position and style textarea
    textarea.value = object.text || '';
    textarea.style.position = 'absolute';
    textarea.style.top = absPos.y + PADDING + 'px';
    textarea.style.left = absPos.x + PADDING + 'px';
    textarea.style.width = (STICKY_NOTE_WIDTH - PADDING * 2) * stage.scaleX() + 'px';
    textarea.style.height = (STICKY_NOTE_HEIGHT - PADDING * 2) * stage.scaleY() + 'px';
    textarea.style.fontSize = 14 * stage.scaleX() + 'px';
    textarea.style.border = 'none';
    textarea.style.padding = '0';
    textarea.style.margin = '0';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'transparent';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = '1.2';
    textarea.style.fontFamily = 'Arial, sans-serif';
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = 'left';
    textarea.style.color = '#374151';
    textarea.style.zIndex = '1000';

    textarea.focus();
    textarea.select();

    // Handle save on blur or Enter
    const handleSave = async () => {
      const newText = textarea.value;
      if (newText !== object.text) {
        try {
          await updateObject(object.id, { text: newText }, user.uid);
        } catch (error) {
          console.error('Failed to update text:', error);
        }
      }

      document.body.removeChild(textarea);
      setIsEditing(false);
    };

    textarea.addEventListener('blur', handleSave);
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(textarea);
        setIsEditing(false);
      }
      // Don't save on Enter since we want multi-line text
      // User must click outside or press Escape
    });
  };

  return (
    <Group
      ref={groupRef}
      x={object.x}
      y={object.y}
      draggable
      onDragEnd={handleDragEnd}
      onDblClick={handleDoubleClick}
      onDblTap={handleDoubleClick}
    >
      {/* Sticky note background */}
      <Rect
        width={STICKY_NOTE_WIDTH}
        height={STICKY_NOTE_HEIGHT}
        fill={object.color || '#FDE68A'}
        stroke="#D1D5DB"
        strokeWidth={1}
        shadowColor="black"
        shadowBlur={5}
        shadowOpacity={0.2}
        shadowOffsetX={2}
        shadowOffsetY={2}
        cornerRadius={4}
      />

      {/* Text content */}
      {!isEditing && (
        <Text
          text={object.text || 'Double-click to edit'}
          x={PADDING}
          y={PADDING}
          width={STICKY_NOTE_WIDTH - PADDING * 2}
          height={STICKY_NOTE_HEIGHT - PADDING * 2}
          fontSize={14}
          fontFamily="Arial, sans-serif"
          fill={object.text ? '#374151' : '#9CA3AF'}
          wrap="word"
          align="left"
          verticalAlign="top"
          listening={false}
        />
      )}
    </Group>
  );
}
