import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getBoardId } from '../services/board';

/**
 * Real-time sync hook for board objects
 * This is the heart of multiplayer collaboration
 */
export function useBoardObjects() {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
        console.error('Error in board objects listener:', err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  return { objects, loading, error };
}
