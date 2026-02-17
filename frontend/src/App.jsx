import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { useCanvas } from './hooks/useCanvas';
import { usePresence } from './hooks/usePresence';
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
        onColorChange={setSelectedColor}
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
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
