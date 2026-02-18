import { COLORS } from '../../utils/colors';

const TOOL_ICON = {
  SELECT: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}><path d="M18 11V6a2 2 0 0 0-4 0" fill="#F3F4F6" /><path d="M14 10V4a2 2 0 0 0-4 0v6" fill="#F3F4F6" /><path d="M10 10.5V2a2 2 0 0 0-4 0v9" fill="#F3F4F6" /><path d="M18 11a2 2 0 0 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.46-3.46a2 2 0 0 1 2.83-2.83L8 16" fill="#F3F4F6" /></svg>,
  STICKY_NOTE: <span style={{ display: 'inline-block', width: 18, height: 18, backgroundColor: '#FDE68A', border: '1.5px solid #D1D5DB', borderRadius: 2 }} />,
  RECTANGLE: <span style={{ display: 'inline-block', width: 18, height: 18, backgroundColor: '#E5E7EB', border: '1.5px solid #9CA3AF', borderRadius: 2 }} />,
  CIRCLE: <span style={{ display: 'inline-block', width: 18, height: 18, backgroundColor: '#E5E7EB', border: '1.5px solid #9CA3AF', borderRadius: '50%' }} />,
  LINE: <span style={{ display: 'inline-block', width: 18, height: 2, backgroundColor: '#6B7280', transform: 'rotate(-30deg)' }} />,
  TEXT: <span style={{ fontSize: 18, fontWeight: 'bold', lineHeight: 1, fontFamily: 'serif' }}>T</span>,
  FRAME: <span style={{ display: 'inline-block', width: 18, height: 18, border: '2px dashed #9CA3AF', borderRadius: 3 }} />,
  CONNECTOR: <span style={{ fontSize: 16, lineHeight: 1 }}>↗</span>,
};

const TOOLS = [
  { id: 'SELECT', label: 'Select (Shift+drag to multi-select)' },
  { id: 'STICKY_NOTE', label: 'Sticky Note' },
  { id: 'RECTANGLE', label: 'Rectangle' },
  { id: 'CIRCLE', label: 'Circle' },
  { id: 'LINE', label: 'Line' },
  { id: 'TEXT', label: 'Text' },
  { id: 'FRAME', label: 'Frame' },
  { id: 'CONNECTOR', label: 'Connector' },
];

export default function BoardToolbar({
  selectedTool,
  selectedColor,
  stageScale,
  onToolChange,
  onColorChange,
  onZoomIn,
  onZoomOut,
  onResetView,
  onSignOut,
  user,
  hasSelection,
}) {
  const showColorPicker = selectedTool !== 'SELECT' || hasSelection;
  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left: Logo and Tools */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">CollabBoard</h1>

          {/* Tool Selection */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTool === tool.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={tool.label}
              >
                {TOOL_ICON[tool.id]}
              </button>
            ))}
          </div>

          {/* Color Picker - only shown for creation tools */}
          {showColorPicker && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Color:</span>
              <div className="flex gap-1">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => onColorChange(color.value)}
                    className={`w-8 h-8 rounded-md border-2 transition-all ${
                      selectedColor === color.value
                        ? 'border-gray-900 scale-110'
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Zoom Controls and User */}
        <div className="flex items-center gap-4">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={onZoomOut}
              className="px-3 py-1 text-gray-700 hover:bg-white rounded-md transition-colors"
              title="Zoom Out"
            >
              −
            </button>
            <button
              onClick={onResetView}
              className="px-3 py-1 text-gray-700 hover:bg-white rounded-md transition-colors text-sm min-w-[52px]"
              title="Reset View (click to reset)"
            >
              {Math.round((stageScale ?? 1) * 100)}%
            </button>
            <button
              onClick={onZoomIn}
              className="px-3 py-1 text-gray-700 hover:bg-white rounded-md transition-colors"
              title="Zoom In"
            >
              +
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">
              {user?.displayName || user?.email}
            </span>
            <button
              onClick={onSignOut}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
