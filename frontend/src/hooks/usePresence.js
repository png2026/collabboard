import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { joinBoard, updateCursor, leaveBoard, getCursorColor, heartbeat } from '../services/presence';
import { getBoardId } from '../services/board';

const THROTTLE_MS = 66; // ~15 updates/second max
const HEARTBEAT_MS = 30_000; // 30s heartbeat to keep lastSeen fresh
const STALE_THRESHOLD_MS = 2 * 60 * 1000; // 2 min — hide users whose lastSeen is older

function filterStale(rawUsers) {
  const now = Date.now();
  return rawUsers.filter((u) => now - u._lastSeenMs < STALE_THRESHOLD_MS);
}

export function usePresence(user) {
  const [presenceUsers, setPresenceUsers] = useState([]);
  const lastUpdateRef = useRef(0);
  const rawUsersRef = useRef([]);
  const boardId = getBoardId();

  useEffect(() => {
    if (!user) return;

    joinBoard(boardId, user).catch(console.error);

    // Listen for presence changes and filter out stale users
    const presenceRef = collection(db, `boards/${boardId}/presence`);
    const unsubscribe = onSnapshot(presenceRef, (snapshot) => {
      const now = Date.now();
      const users = [];
      snapshot.forEach((docSnap) => {
        if (docSnap.id !== user.uid) {
          const data = docSnap.data();
          const lastSeenMs = data.lastSeen?.toMillis?.() ?? 0;
          if (now - lastSeenMs < STALE_THRESHOLD_MS) {
            users.push({ id: docSnap.id, ...data, _lastSeenMs: lastSeenMs });
          }
        }
      });
      rawUsersRef.current = users;
      setPresenceUsers(users);
    });

    // Heartbeat: keep our own lastSeen fresh even when idle
    let heartbeatInterval = setInterval(() => {
      heartbeat(boardId, user.uid).catch(console.error);
    }, HEARTBEAT_MS);

    // Pause heartbeat when tab is hidden, resume when visible
    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      } else {
        heartbeat(boardId, user.uid).catch(console.error);
        heartbeatInterval = setInterval(() => {
          heartbeat(boardId, user.uid).catch(console.error);
        }, HEARTBEAT_MS);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Refilter periodically so stale users disappear between snapshots
    const refilterInterval = setInterval(() => {
      const filtered = filterStale(rawUsersRef.current);
      setPresenceUsers(filtered);
    }, 60_000);

    const handleUnload = () => leaveBoard(boardId, user.uid);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(refilterInterval);
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleUnload);
      leaveBoard(boardId, user.uid).catch(console.error);
    };
  }, [boardId, user]);

  const updateCursorPosition = useCallback(
    (x, y) => {
      if (!user) return;
      const now = Date.now();
      if (now - lastUpdateRef.current < THROTTLE_MS) return;
      lastUpdateRef.current = now;
      updateCursor(boardId, user.uid, x, y).catch(console.error);
    },
    [boardId, user]
  );

  const leave = useCallback(() => {
    if (!user) return Promise.resolve();
    return leaveBoard(boardId, user.uid).catch(console.error);
  }, [boardId, user]);

  return {
    presenceUsers,
    updateCursorPosition,
    leave,
    myColor: user ? getCursorColor(user.uid) : '#3B82F6',
  };
}
