import StickyNote from './StickyNote';

/**
 * Factory component that renders the correct object type
 */
export default function ObjectFactory({ object }) {
  switch (object.type) {
    case 'stickyNote':
      return <StickyNote object={object} />;

    // Future object types will be added here:
    // case 'rectangle':
    //   return <Rectangle object={object} />;
    // case 'circle':
    //   return <Circle object={object} />;

    default:
      console.warn('Unknown object type:', object.type);
      return null;
  }
}
