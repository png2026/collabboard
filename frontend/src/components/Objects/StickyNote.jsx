import { useState, useRef, useEffect, memo } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { updateObject } from '../../services/board';
import { useAuth } from '../../hooks/useAuth.js';

const STICKY_NOTE_WIDTH = 200;
const STICKY_NOTE_HEIGHT = 150;
const PADDING = 10;

export default memo(function StickyNote({ object, isSelected, onSelect }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const groupRef = useRef();
  const textareaRef = useRef(null);
  const mountedRef = useRef(true);

  // Track mount state and clean up textarea on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (textareaRef.current && document.body.contains(textareaRef.current)) {
        document.body.removeChild(textareaRef.current);
        textareaRef.current = null;
      }
    };
  }, []);

  const handleDragEnd = async (e) => {
    try {
      await updateObject(object.id, { x: e.target.x(), y: e.target.y() }, user.uid);
    } catch (error) {
      console.error('Failed to update position:', error);
    }
  };

  const removeTextarea = () => {
    if (textareaRef.current && document.body.contains(textareaRef.current)) {
      document.body.removeChild(textareaRef.current);
      textareaRef.current = null;
    }
    if (mountedRef.current) setIsEditing(false);
  };

  const handleDoubleClick = () => {
    // Close any existing textarea first
    removeTextarea();
    setIsEditing(true);

    const stage = groupRef.current.getStage();
    const group = groupRef.current;
    const transform = group.getAbsoluteTransform();
    const absPos = transform.point({ x: 0, y: 0 });

    const textarea = document.createElement('textarea');
    textareaRef.current = textarea;
    document.body.appendChild(textarea);

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

    const handleSave = async () => {
      if (!mountedRef.current) return;
      const newText = textarea.value;
      if (newText !== object.text) {
        try {
          await updateObject(object.id, { text: newText }, user.uid);
        } catch (error) {
          if (mountedRef.current) console.error('Failed to update text:', error);
        }
      }
      removeTextarea();
    };

    textarea.addEventListener('blur', handleSave);
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        removeTextarea();
      }
    });
  };

  return (
    <Group
      ref={groupRef}
      x={object.x}
      y={object.y}
      draggable
      onDragEnd={handleDragEnd}
      onClick={() => onSelect(object.id)}
      onTap={() => onSelect(object.id)}
      onDblClick={handleDoubleClick}
      onDblTap={handleDoubleClick}
    >
      <Rect
        width={STICKY_NOTE_WIDTH}
        height={STICKY_NOTE_HEIGHT}
        fill={object.color || '#FDE68A'}
        stroke={isSelected ? '#3B82F6' : '#D1D5DB'}
        strokeWidth={isSelected ? 2 : 1}
        shadowColor="black"
        shadowBlur={5}
        shadowOpacity={0.2}
        shadowOffsetX={2}
        shadowOffsetY={2}
        cornerRadius={4}
      />
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
});
