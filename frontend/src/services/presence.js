import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// Vivid colors for user cursors - distinct from sticky note pastel colors
export const CURSOR_COLORS = [
  '#EF4444', // red
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

export function getCursorColor(userId) {
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

/**
 * Register user as present on the board
 */
export async function joinBoard(boardId, user) {
  const presenceRef = doc(db, `boards/${boardId}/presence`, user.uid);
  await setDoc(presenceRef, {
    displayName: user.displayName || user.email || 'Anonymous',
    color: getCursorColor(user.uid),
    cursor: { x: 0, y: 0 },
    lastSeen: serverTimestamp(),
  });
}

/**
 * Update cursor position - call this throttled (10-15/sec max)
 */
export async function updateCursor(boardId, userId, x, y) {
  const presenceRef = doc(db, `boards/${boardId}/presence`, userId);
  await updateDoc(presenceRef, {
    cursor: { x, y },
    lastSeen: serverTimestamp(),
  });
}

/**
 * Heartbeat — refresh lastSeen without changing cursor position.
 * Keeps connected-but-idle users from appearing stale.
 */
export async function heartbeat(boardId, userId) {
  const presenceRef = doc(db, `boards/${boardId}/presence`, userId);
  await updateDoc(presenceRef, { lastSeen: serverTimestamp() });
}

/**
 * Remove user from presence when they leave
 */
export async function leaveBoard(boardId, userId) {
  const presenceRef = doc(db, `boards/${boardId}/presence`, userId);
  await deleteDoc(presenceRef);
}
