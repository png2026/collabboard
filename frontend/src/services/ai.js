import { auth } from './firebase';
import { createObject, createMultipleObjects, updateMultipleObjects, deleteMultipleObjects, getBoardId } from './board';
import { getObjectCenter } from '../utils/connectorUtils';

// In production, VITE_AI_API_URL is empty — requests go to same origin via Firebase Hosting rewrite.
// In local dev, it points to http://localhost:8080.
const AI_API_URL = import.meta.env.VITE_AI_API_URL ?? 'http://localhost:8080';

/**
 * Send a natural language command to the AI backend.
 * Returns { actions, message, error }.
 */
export async function sendAiCommand(command, boardState, viewportCenter) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const idToken = await user.getIdToken();

  const response = await fetch(`${AI_API_URL}/api/ai/command`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      command,
      boardState: boardState.map(obj => ({
        id: obj.id,
        type: obj.type,
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height,
        radius: obj.radius,
        text: obj.text,
        title: obj.title,
        color: obj.color,
        fontSize: obj.fontSize,
        strokeWidth: obj.strokeWidth,
        strokeColor: obj.strokeColor,
        rotation: obj.rotation,
        zIndex: obj.zIndex,
        fromId: obj.fromId,
        toId: obj.toId,
        arrowEnd: obj.arrowEnd,
        createdBy: obj.createdBy,
      })),
      boardId: getBoardId(),
      viewportCenter,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.detail || `AI request failed (${response.status})`);
  }

  return response.json();
}

/**
 * Execute an array of AI-returned actions against the board.
 * Batches operations for performance: non-connector creates, updates, and deletes
 * are each executed as a single Firestore batch write.
 * Connector creates run sequentially (they reference IDs from earlier creates).
 */
export async function executeActions(actions, userId, currentObjects) {
  let successCount = 0;
  let errorCount = 0;
  const createdIds = [];

  // Build lookup map, augmented as we create new objects
  const objectMap = new Map(currentObjects.map(o => [o.id, o]));

  // Partition actions by type
  const creates = [];       // non-connector creates
  const connectorCreates = []; // connector creates (need IDs from above)
  const updates = [];
  const deletes = [];

  for (const action of actions) {
    if (action.type === 'create') {
      if (action.objectType === 'connector') {
        connectorCreates.push(action);
      } else {
        creates.push(action);
      }
    } else if (action.type === 'update') {
      updates.push(action);
    } else if (action.type === 'delete') {
      deletes.push(action);
    }
  }

  // 1. Batch create non-connector objects
  if (creates.length > 0) {
    try {
      const objectsData = creates.map((action, i) => {
        const props = { ...action.properties };
        props.type = action.objectType;
        if (action.objectType === 'frame') {
          props.zIndex = 0;
        } else {
          props.zIndex = currentObjects.length + i + 1;
        }
        return props;
      });
      const newIds = await createMultipleObjects(objectsData, userId);
      for (let i = 0; i < newIds.length; i++) {
        createdIds.push(newIds[i]);
        objectMap.set(newIds[i], { id: newIds[i], ...objectsData[i] });
      }
      successCount += newIds.length;
    } catch (err) {
      console.error('Failed to batch create objects:', err);
      errorCount += creates.length;
    }
  }

  // 2. Sequential connector creates (need objectMap populated from step 1)
  for (const action of connectorCreates) {
    try {
      const props = { ...action.properties };
      const fromObj = objectMap.get(props.fromId);
      const toObj = objectMap.get(props.toId);
      if (fromObj && toObj) {
        const fromCenter = getObjectCenter(fromObj);
        const toCenter = getObjectCenter(toObj);
        props.fromX = fromCenter.x;
        props.fromY = fromCenter.y;
        props.toX = toCenter.x;
        props.toY = toCenter.y;
      }
      props.type = 'connector';
      props.zIndex = currentObjects.length + createdIds.length + 1;

      const newId = await createObject(props, userId);
      createdIds.push(newId);
      objectMap.set(newId, { id: newId, ...props });
      successCount++;
    } catch (err) {
      console.error('Failed to create connector:', err);
      errorCount++;
    }
  }

  // 3. Batch updates
  if (updates.length > 0) {
    try {
      await updateMultipleObjects(
        updates.map(a => ({ id: a.objectId, changes: a.properties })),
        userId
      );
      successCount += updates.length;
    } catch (err) {
      console.error('Failed to batch update objects:', err);
      errorCount += updates.length;
    }
  }

  // 4. Batch deletes
  if (deletes.length > 0) {
    try {
      await deleteMultipleObjects(deletes.map(a => a.objectId));
      successCount += deletes.length;
    } catch (err) {
      console.error('Failed to batch delete objects:', err);
      errorCount += deletes.length;
    }
  }

  return { successCount, errorCount, createdIds };
}
