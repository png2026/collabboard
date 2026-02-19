import { useState, useCallback } from 'react';
import { sendAiCommand, executeActions } from '../services/ai';

/**
 * Hook for managing AI agent chat state and command execution.
 */
export function useAiAgent({ objects, user, getViewportCenter }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const togglePanel = useCallback(() => setIsPanelOpen(prev => !prev), []);
  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);

  const sendCommand = useCallback(async (command) => {
    if (!command.trim() || !user) return;

    setMessages(prev => [...prev, { role: 'user', content: command, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const viewportCenter = getViewportCenter ? getViewportCenter() : null;
      const result = await sendAiCommand(command, objects, viewportCenter);

      if (result.actions && result.actions.length > 0) {
        const execResult = await executeActions(result.actions, user.uid, objects);

        let content = result.message || 'Done!';
        if (execResult.errorCount > 0) {
          content += ` (${execResult.errorCount} action(s) failed)`;
        }

        setMessages(prev => [...prev, {
          role: 'assistant',
          content,
          timestamp: new Date(),
          actionCount: result.actions.length,
          successCount: execResult.successCount,
          errorCount: execResult.errorCount,
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.message || 'I could not determine any actions for that command.',
          timestamp: new Date(),
          actionCount: 0,
        }]);
      }
    } catch (err) {
      console.error('AI command failed:', err);
      setMessages(prev => [...prev, {
        role: 'error',
        content: err.message || 'Failed to process AI command. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [user, objects, getViewportCenter]);

  const clearMessages = useCallback(() => setMessages([]), []);

  return {
    messages,
    isLoading,
    isPanelOpen,
    togglePanel,
    openPanel,
    closePanel,
    sendCommand,
    clearMessages,
  };
}
