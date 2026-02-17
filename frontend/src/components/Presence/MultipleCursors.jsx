import { Layer } from 'react-konva';
import Cursor from './Cursor';

export default function MultipleCursors({ presenceUsers, stageScale }) {
  if (!presenceUsers?.length) return null;

  return (
    <Layer listening={false}>
      {presenceUsers.map((user) => (
        <Cursor key={user.id} user={user} stageScale={stageScale} />
      ))}
    </Layer>
  );
}
