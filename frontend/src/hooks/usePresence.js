import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { joinBoard, updateCursor, leaveBoard, getCursorColor } from '../services/presence';
import { getBoardId } from '../services/board';

const THROTTLE_MS = 66; // ~15 updates/second max

export function usePresence(user) {
  const [presenceUsers, setPresenceUsers] = useState([]);
  const lastUpdateRef = useRef(0);
  const boardId = getBoardId();

  useEffect(() => {
    if (!user) return;

    // Register presence on mount
    joinBoard(boardId, user).catch(console.error);

    // Listen to all users' presence
    const presenceRef = collection(db, `boards/${boardId}/presence`);
    const unsubscribe = onSnapshot(presenceRef, (snapshot) => {
      const users = [];
      snapshot.forEach((doc) => {
        if (doc.id !== user.uid) {
          users.push({ id: doc.id, ...doc.data() });
        }
      });
      setPresenceUsers(users);
    });

    // Clean up: remove presence and listener on unmount
    const handleUnload = () => leaveBoard(boardId, user.uid);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleUnload);
      leaveBoard(boardId, user.uid).catch(console.error);
    };
  }, [user?.uid]);

  // Throttled cursor update — call this from mousemove
  const updateCursorPosition = useCallback(
    (x, y) => {
      if (!user) return;
      const now = Date.now();
      if (now - lastUpdateRef.current < THROTTLE_MS) return;
      lastUpdateRef.current = now;
      updateCursor(boardId, user.uid, x, y).catch(console.error);
    },
    [user?.uid]
  );

  return {
    presenceUsers,
    updateCursorPosition,
    myColor: user ? getCursorColor(user.uid) : '#3B82F6',
  };
}
