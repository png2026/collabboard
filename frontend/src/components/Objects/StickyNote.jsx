import { useState, useRef, useEffect, memo } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { updateObject } from '../../services/board';
import { useAuth } from '../../hooks/useAuth.js';

const STICKY_NOTE_WIDTH = 200;
const STICKY_NOTE_HEIGHT = 150;
const PADDING = 10;

export default memo(function StickyNote({ object, isSelected, onSelect, onGroupDragMove, onGroupDragEnd, selectedObjectIds }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const groupRef = useRef();
  const textareaRef = useRef(null);
  const mountedRef = useRef(true);

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

  const handleTransformEnd = async (e) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    try {
      await updateObject(object.id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(50, (object.width || STICKY_NOTE_WIDTH) * scaleX),
        height: Math.max(50, (object.height || STICKY_NOTE_HEIGHT) * scaleY),
        rotation: node.rotation(),
      }, user.uid);
    } catch (error) {
      console.error('Failed to update transform:', error);
    }
  };

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

  const removeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current._cleanup?.();
      if (document.body.contains(textareaRef.current)) {
        document.body.removeChild(textareaRef.current);
      }
      textareaRef.current = null;
    }
    if (mountedRef.current) setIsEditing(false);
  };

  const handleDoubleClick = () => {
    removeTextarea();
    setIsEditing(true);

    const stage = groupRef.current.getStage();
    const stageBox = stage.container().getBoundingClientRect();
    const scale = stage.scaleX();

    // Convert stage coordinates → viewport pixels
    const viewportX = stageBox.left + stage.x() + object.x * scale;
    const viewportY = stageBox.top + stage.y() + object.y * scale;

    const textarea = document.createElement('textarea');
    textareaRef.current = textarea;
    document.body.appendChild(textarea);

    const w = object.width || STICKY_NOTE_WIDTH;
    const h = object.height || STICKY_NOTE_HEIGHT;
    const scaledPad = PADDING * scale;

    textarea.value = object.text || '';
    textarea.style.position = 'absolute';
    textarea.style.top = viewportY + scaledPad + 'px';
    textarea.style.left = viewportX + scaledPad + 'px';
    textarea.style.width = (w - PADDING * 2) * scale + 'px';
    textarea.style.height = (h - PADDING * 2) * scale + 'px';
    textarea.style.fontSize = 14 * scale + 'px';
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

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        removeTextarea();
      }
    };
    textarea.addEventListener('blur', handleSave);
    textarea.addEventListener('keydown', handleKeyDown);
    textarea._cleanup = () => {
      textarea.removeEventListener('blur', handleSave);
      textarea.removeEventListener('keydown', handleKeyDown);
    };
  };

  const w = object.width || STICKY_NOTE_WIDTH;
  const h = object.height || STICKY_NOTE_HEIGHT;

  return (
    <Group
      id={object.id}
      ref={groupRef}
      x={object.x}
      y={object.y}
      width={w}
      height={h}
      rotation={object.rotation || 0}
      draggable
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onClick={(e) => onSelect(object.id, e.evt)}
      onTap={(e) => onSelect(object.id, e.evt)}
      onDblClick={handleDoubleClick}
      onDblTap={handleDoubleClick}
      onTransformEnd={handleTransformEnd}
    >
      <Rect
        width={w}
        height={h}
        fill={object.color || '#FDE68A'}
        stroke={isSelected ? '#3B82F6' : '#D1D5DB'}
        strokeWidth={isSelected ? 2 : 1}
        shadowEnabled={false}
        cornerRadius={4}
      />
      {!isEditing && (
        <Text
          text={object.text || 'Double-click to edit'}
          x={PADDING}
          y={PADDING}
          width={w - PADDING * 2}
          height={h - PADDING * 2}
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
