import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// Set VITE_BOARD_ENV=test (via `vite --mode test` which loads .env.test)
// to use an isolated 'test-board' Firestore collection instead of production.
const BOARD_ENV = import.meta.env.VITE_BOARD_ENV || 'prod';
const BOARD_ID = BOARD_ENV === 'test' ? 'test-board' : 'default-board';

/**
 * CONFLICT RESOLUTION STRATEGY: Last-Write-Wins (LWW)
 *
 * Each object is an independent Firestore document. When two users edit the
 * same object simultaneously, Firestore's default behavior applies: the last
 * write to reach the server overwrites the previous one at the field level.
 *
 * Why this is acceptable for a whiteboard:
 * - Objects are small, independent units (a sticky note, a shape, etc.)
 * - Concurrent edits to the *same* object are rare (users typically work on
 *   different objects or different properties)
 * - Every write records `updatedBy` and `updatedAt` for auditability
 * - Real-time `onSnapshot` listeners propagate the winning value to all
 *   clients within milliseconds, minimizing stale-state windows
 * - Offline persistence (IndexedDB) queues local writes and syncs them on
 *   reconnect; Firestore merges them using the same LWW policy
 *
 * Trade-off: if two users simultaneously change different fields on the same
 * object (e.g., one edits text, another moves position), both changes are
 * preserved because `updateDoc` performs a shallow merge. Only truly
 * conflicting field-level edits result in one value being overwritten.
 */

/**
 * Create a new object on the board
 */
export async function createObject(objectData, userId) {
  try {
    const objectsRef = collection(db, `boards/${BOARD_ID}/objects`);
    const docRef = await addDoc(objectsRef, {
      ...objectData,
      createdBy: userId,
      updatedBy: userId,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating object:', error);
    throw error;
  }
}

/**
 * Update an existing object
 */
export async function updateObject(objectId, updates, userId) {
  try {
    const objectRef = doc(db, `boards/${BOARD_ID}/objects`, objectId);
    await updateDoc(objectRef, {
      ...updates,
      updatedBy: userId,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating object:', error);
    throw error;
  }
}

/**
 * Delete an object
 */
export async function deleteObject(objectId) {
  try {
    const objectRef = doc(db, `boards/${BOARD_ID}/objects`, objectId);
    await deleteDoc(objectRef);
  } catch (error) {
    console.error('Error deleting object:', error);
    throw error;
  }
}

/**
 * Update multiple objects atomically using batched writes
 */
export async function updateMultipleObjects(updates, userId) {
  try {
    const batch = writeBatch(db);
    for (const { id, changes } of updates) {
      const ref = doc(db, `boards/${BOARD_ID}/objects`, id);
      batch.update(ref, { ...changes, updatedBy: userId, updatedAt: serverTimestamp() });
    }
    await batch.commit();
  } catch (error) {
    console.error('Error batch updating objects:', error);
    throw error;
  }
}

/**
 * Returns the current board ID ('default-board' or 'test-board' depending on VITE_BOARD_ENV).
 */
export function getBoardId() {
  return BOARD_ID;
}
