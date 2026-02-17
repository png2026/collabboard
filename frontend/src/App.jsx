import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { useCanvas } from './hooks/useCanvas';
import LoginPage from './components/Auth/LoginPage';
import BoardCanvas from './components/Board/BoardCanvas';
import BoardToolbar from './components/Board/BoardToolbar';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const {
    selectedTool,
    selectedColor,
    setSelectedTool,
    setSelectedColor,
    zoomIn,
    zoomOut,
    resetView,
  } = useCanvas();

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
        onToolChange={setSelectedTool}
        onColorChange={setSelectedColor}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
        onSignOut={signOut}
        user={user}
      />
      <BoardCanvas />
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
