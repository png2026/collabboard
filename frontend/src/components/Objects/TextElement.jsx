import { useState, useRef, useEffect, memo } from 'react';
import { Group, Text } from 'react-konva';
import { updateObject } from '../../services/board';
import { useAuth } from '../../hooks/useAuth.js';

const DEFAULT_FONT_SIZE = 20;
const DEFAULT_WIDTH = 200;

export default memo(function TextElement({ object, onSelect, onGroupDragMove, onGroupDragEnd, selectedObjectIds }) {
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

  const fontSize = object.fontSize || DEFAULT_FONT_SIZE;
  const width = object.width || DEFAULT_WIDTH;

  const handleTransformEnd = async (e) => {
    const node = e.target;
    const scaleX = node.scaleX();
    node.scaleX(1);
    node.scaleY(1);
    try {
      await updateObject(object.id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(50, width * scaleX),
        fontSize: Math.max(8, fontSize * scaleX),
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

    textarea.value = object.text || '';
    textarea.style.position = 'absolute';
    textarea.style.top = viewportY + 'px';
    textarea.style.left = viewportX + 'px';
    textarea.style.width = width * scale + 'px';
    textarea.style.height = 'auto';
    textarea.style.minHeight = fontSize * scale * 2 + 'px';
    textarea.style.fontSize = fontSize * scale + 'px';
    textarea.style.border = '2px solid #3B82F6';
    textarea.style.borderRadius = '2px';
    textarea.style.padding = '2px';
    textarea.style.margin = '0';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'white';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = '1.2';
    textarea.style.fontFamily = object.fontFamily || 'Arial, sans-serif';
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = 'left';
    textarea.style.color = object.color || '#374151';
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

  return (
    <Group
      id={object.id}
      ref={groupRef}
      x={object.x}
      y={object.y}
      width={width}
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
      {!isEditing && (
        <Text
          text={object.text || 'Double-click to edit'}
          width={width}
          fontSize={fontSize}
          fontFamily={object.fontFamily || 'Arial, sans-serif'}
          fill={object.text ? (object.color || '#374151') : '#9CA3AF'}
          wrap="word"
          align="left"
        />
      )}
    </Group>
  );
});
