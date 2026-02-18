import { useState, useCallback } from 'react';

export function useSelection() {
  const [selectedObjectIds, setSelectedObjectIds] = useState(new Set());

  const selectObject = useCallback((objectId, additive = false) => {
    setSelectedObjectIds(prev => {
      if (!objectId) return new Set();
      if (additive) {
        const next = new Set(prev);
        if (next.has(objectId)) next.delete(objectId);
        else next.add(objectId);
        return next;
      }
      return new Set([objectId]);
    });
  }, []);

  const selectMultiple = useCallback((objectIds) => {
    setSelectedObjectIds(new Set(objectIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedObjectIds(new Set());
  }, []);

  return { selectedObjectIds, selectObject, selectMultiple, clearSelection };
}
