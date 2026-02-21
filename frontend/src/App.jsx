import { useCallback } from 'react';
import { AuthProvider } from './hooks/useAuth.jsx';
import { useAuth } from './hooks/useAuth.js';
import { useCanvas } from './hooks/useCanvas';
import { usePresence } from './hooks/usePresence';
import { useSelection } from './hooks/useSelection';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { useBoardObjects } from './hooks/useBoardObjects';
import { useAiAgent } from './hooks/useAiAgent';
import { updateObject, updateMultipleObjects } from './services/board';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './components/Auth/LoginPage';
import BoardCanvas from './components/Board/BoardCanvas';
import BoardToolbar from './components/Board/BoardToolbar';
import UserList from './components/Presence/UserList';
import AiChatPanel from './components/AI/AiChatPanel';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const {
    stageScale,
    stagePosition,
    selectedTool,
    selectedColor,
    setSelectedTool,
    setSelectedColor,
    handleWheel,
    handleDragEnd,
    zoomIn,
    zoomOut,
    resetView,
  } = useCanvas();

  const { presenceUsers, updateCursorPosition, leave, myColor } = usePresence(user);
  const { selectedObjectIds, selectObject, selectMultiple, clearSelection } = useSelection();
  const isOnline = useNetworkStatus();

  // Lift board objects to AppContent so both BoardCanvas and AI agent can access them
  const { objects, loading: boardLoading, error: boardError } = useBoardObjects(user);

  // Viewport center for AI placement hints
  const getViewportCenter = useCallback(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - 60; // subtract toolbar height
    return {
      x: (-stagePosition.x + viewportWidth / 2) / stageScale,
      y: (-stagePosition.y + viewportHeight / 2) / stageScale,
    };
  }, [stageScale, stagePosition]);

  const ai = useAiAgent({ objects, user, getViewportCenter });

  const handleColorChange = useCallback((color) => {
    setSelectedColor(color);
    if (selectedObjectIds.size > 0 && user) {
      if (selectedObjectIds.size === 1) {
        const id = selectedObjectIds.values().next().value;
        updateObject(id, { color }, user.uid).catch(console.error);
      } else {
        const updates = Array.from(selectedObjectIds).map(id => ({ id, changes: { color } }));
        updateMultipleObjects(updates, user.uid).catch(console.error);
      }
    }
  }, [selectedObjectIds, user, setSelectedColor]);

  const handleSignOut = async () => {
    await leave();
    signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen">
      {!isOnline && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-yellow-50 px-4 py-2 rounded-lg shadow-lg border border-yellow-300 z-50">
          <span className="text-sm text-yellow-800">Offline — changes will sync when reconnected</span>
        </div>
      )}
      <BoardToolbar
        selectedTool={selectedTool}
        selectedColor={selectedColor}
        stageScale={stageScale}
        onToolChange={setSelectedTool}
        onColorChange={handleColorChange}
        hasSelection={selectedObjectIds.size > 0}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
        onSignOut={handleSignOut}
        user={user}
        onToggleAiPanel={ai.togglePanel}
        isAiPanelOpen={ai.isPanelOpen}
      />
      <UserList
        presenceUsers={presenceUsers}
        currentUser={user}
        myColor={myColor}
      />
      <BoardCanvas
        stageScale={stageScale}
        stagePosition={stagePosition}
        selectedTool={selectedTool}
        selectedColor={selectedColor}
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
        presenceUsers={presenceUsers}
        onCursorMove={updateCursorPosition}
        selectedObjectIds={selectedObjectIds}
        onSelectObject={selectObject}
        onSelectMultiple={selectMultiple}
        onClearSelection={clearSelection}
        objects={objects}
        boardLoading={boardLoading}
        boardError={boardError}
      />
      <AiChatPanel
        isPanelOpen={ai.isPanelOpen}
        onClose={ai.closePanel}
        messages={ai.messages}
        isLoading={ai.isLoading}
        onSendCommand={ai.sendCommand}
        onClearMessages={ai.clearMessages}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
