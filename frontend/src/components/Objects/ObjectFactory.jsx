import StickyNote from './StickyNote';
import Rectangle from './Rectangle';
import Circle from './Circle';
import LineShape from './LineShape';
import TextElement from './TextElement';
import Frame from './Frame';
import Connector from './Connector';

export default function ObjectFactory({ object, allObjects, isSelected, onSelect, onGroupDragMove, onGroupDragEnd, selectedObjectIds }) {
  if (!object?.type) return null;
  const sharedProps = { object, isSelected, onSelect, onGroupDragMove, onGroupDragEnd, selectedObjectIds };

  switch (object.type) {
    case 'stickyNote':
      return <StickyNote {...sharedProps} />;
    case 'rectangle':
      return <Rectangle {...sharedProps} />;
    case 'circle':
      return <Circle {...sharedProps} />;
    case 'line':
      return <LineShape {...sharedProps} />;
    case 'text':
      return <TextElement {...sharedProps} />;
    case 'frame':
      return <Frame {...sharedProps} />;
    case 'connector':
      return <Connector {...sharedProps} allObjects={allObjects} />;
    default:
      console.warn('Unknown object type:', object.type);
      return null;
  }
}
