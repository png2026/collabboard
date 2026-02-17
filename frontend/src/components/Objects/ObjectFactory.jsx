import StickyNote from './StickyNote';
import Rectangle from './Rectangle';
import Circle from './Circle';

export default function ObjectFactory({ object }) {
  switch (object.type) {
    case 'stickyNote':
      return <StickyNote object={object} />;
    case 'rectangle':
      return <Rectangle object={object} />;
    case 'circle':
      return <Circle object={object} />;
    default:
      console.warn('Unknown object type:', object.type);
      return null;
  }
}
