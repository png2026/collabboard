import { auth } from './firebase';
import { createObject, updateObject, deleteObject } from './board';
import { getObjectCenter } from '../utils/connectorUtils';

const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8080';

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
      boardId: 'default-board',
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
 * Actions run sequentially so we can track created IDs for connectors.
 */
export async function executeActions(actions, userId, currentObjects) {
  let successCount = 0;
  let errorCount = 0;
  const createdIds = [];

  // Build lookup map, augmented as we create new objects
  const objectMap = new Map(currentObjects.map(o => [o.id, o]));

  for (const action of actions) {
    try {
      if (action.type === 'create') {
        const props = { ...action.properties };
        const zIndex = currentObjects.length + createdIds.length + 1;

        if (action.objectType === 'connector') {
          // Compute connector geometry from source/target objects
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
          props.zIndex = zIndex;
          props.type = 'connector';
        } else if (action.objectType === 'frame') {
          props.type = 'frame';
          props.zIndex = 0; // Frames render behind other objects
        } else {
          props.type = action.objectType;
          props.zIndex = zIndex;
        }

        const newId = await createObject(props, userId);
        createdIds.push(newId);
        // Track locally so subsequent connectors can reference this object
        objectMap.set(newId, { id: newId, ...props });
        successCount++;
      } else if (action.type === 'update') {
        await updateObject(action.objectId, action.properties, userId);
        successCount++;
      } else if (action.type === 'delete') {
        await deleteObject(action.objectId);
        successCount++;
      }
    } catch (err) {
      console.error(`Failed to execute action: ${action.type}`, err);
      errorCount++;
    }
  }

  return { successCount, errorCount, createdIds };
}
