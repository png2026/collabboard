import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const BOARD_ID = 'default-board'; // For MVP, we use a single shared board

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
 * Get the board ID (for now, always returns default board)
 */
export function getBoardId() {
  return BOARD_ID;
}
