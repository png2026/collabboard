import { useState, useCallback } from 'react';
import { AuthProvider } from './hooks/useAuth.jsx';
import { useAuth } from './hooks/useAuth.js';
import { useCanvas } from './hooks/useCanvas';
import { usePresence } from './hooks/usePresence';
import { updateObject } from './services/board';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './components/Auth/LoginPage';
import BoardCanvas from './components/Board/BoardCanvas';
import BoardToolbar from './components/Board/BoardToolbar';
import UserList from './components/Presence/UserList';

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
  const [selectedObjectId, setSelectedObjectId] = useState(null);

  const handleColorChange = useCallback((color) => {
    setSelectedColor(color);
    if (selectedObjectId && user) {
      updateObject(selectedObjectId, { color }, user.uid).catch(console.error);
    }
  }, [selectedObjectId, user, setSelectedColor]);

  const handleSignOut = async () => {
    await leave(); // remove presence doc while still authenticated
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
      <BoardToolbar
        selectedTool={selectedTool}
        selectedColor={selectedColor}
        stageScale={stageScale}
        onToolChange={setSelectedTool}
        onColorChange={handleColorChange}
        hasSelection={!!selectedObjectId}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
        onSignOut={handleSignOut}
        user={user}
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
        selectedObjectId={selectedObjectId}
        onSelectObject={setSelectedObjectId}
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
