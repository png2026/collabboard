import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getBoardId } from '../services/board';

/**
 * Real-time sync hook for board objects
 * This is the heart of multiplayer collaboration.
 *
 * Accepts the authenticated user so the Firestore listener is only started
 * once the user is signed in (Firestore security rules require auth).
 * Re-subscribes automatically if the user changes (login / logout / switch).
 */
export function useBoardObjects(user) {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't subscribe until the user is authenticated — Firestore rules
    // would reject the request and kill the listener permanently.
    if (!user) {
      setObjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const boardId = getBoardId();
    const objectsRef = collection(db, `boards/${boardId}/objects`);
    const q = query(objectsRef);

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newObjects = [];
        snapshot.forEach((doc) => {
          newObjects.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setObjects(newObjects);
        setLoading(false);
      },
      (err) => {
        // permission-denied is expected during sign-out (auth token invalidated before listener cleanup)
        if (err.code === 'permission-denied') return;
        console.error('Error in board objects listener:', err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount or when user changes
    return () => unsubscribe();
  }, [user?.uid]);

  return { objects, loading, error };
}
