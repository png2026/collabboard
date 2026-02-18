import StickyNote from './StickyNote';
import Rectangle from './Rectangle';
import Circle from './Circle';

export default function ObjectFactory({ object, isSelected, onSelect }) {
  switch (object.type) {
    case 'stickyNote':
      return <StickyNote object={object} isSelected={isSelected} onSelect={onSelect} />;
    case 'rectangle':
      return <Rectangle object={object} isSelected={isSelected} onSelect={onSelect} />;
    case 'circle':
      return <Circle object={object} isSelected={isSelected} onSelect={onSelect} />;
    default:
      console.warn('Unknown object type:', object.type);
      return null;
  }
}
