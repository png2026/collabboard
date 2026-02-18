# CollabBoard

A real-time collaborative whiteboard application with AI integration capabilities. Built as a 24-hour MVP sprint for the Austin admission gate.

## 🎯 Overview

CollabBoard is an infinite canvas whiteboard that enables multiple users to collaborate in real-time. Users can create sticky notes, shapes, and see each other's cursors as they work together on a shared board. The application emphasizes bulletproof multiplayer synchronization as its core feature.

## ✨ Features

### MVP (All Phases Complete)
- ✅ **Authentication**: Google Sign-In and Email/Password authentication via Firebase Auth
- ✅ **Infinite Canvas**: Pan and zoom capabilities using Konva.js
- ✅ **Sticky Notes**: Create, edit, move, and delete collaborative sticky notes
- ✅ **Shapes**: Square and circle drawing tools (grey by default, recolorable)
- ✅ **Real-time Sync**: Sub-100ms synchronization between multiple users using Firestore
- ✅ **Multiplayer Cursors**: See other users' cursors with color-coded name labels in real-time
- ✅ **Presence Awareness**: Live "Online" user list showing who's currently on the board
- ✅ **Tool Selection**: Toolbar with Select, Sticky Note, Rectangle, and Circle tools
- ✅ **Color Picker**: 8-color palette; per-type defaults (yellow for sticky notes, grey for shapes); recolor selected objects
- ✅ **Selection & Delete**: Click to select (blue highlight), Delete/Backspace to remove, Escape to deselect
- ✅ **Responsive UI**: Clean design with Tailwind CSS, gradient login page
- ✅ **Deployed**: Live at https://collabboard-487701.web.app

### Post-MVP (Planned)
- ⏳ **AI Integration**: Natural language commands for board manipulation
- ⏳ **Connectors/Lines**: Draw lines between objects
- ⏳ **Resize & Rotate**: Handles for transforming objects
- ⏳ **Multi-select**: Select and move multiple objects at once

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Canvas Rendering**: Konva.js + react-konva
- **Styling**: Tailwind CSS v3
- **State Management**: React Hooks (useState, useEffect, custom hooks)

### Backend
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore (real-time sync via `onSnapshot` listeners)
- **Hosting**: Firebase Hosting
- **Future AI Backend**: FastAPI on Google Cloud Run + OpenAI GPT-4

### Development Tools
- Node.js 23.7.0
- npm (package manager)
- Firebase CLI
- Git

## 📁 Project Structure

```
collabboard_app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   └── LoginPage.jsx         # Authentication UI
│   │   │   ├── Board/
│   │   │   │   ├── BoardCanvas.jsx       # Main Konva Stage + pan/zoom + cursor tracking
│   │   │   │   └── BoardToolbar.jsx      # Tool selection, zoom controls, user info
│   │   │   ├── Objects/
│   │   │   │   ├── StickyNote.jsx        # Draggable sticky note with text editing
│   │   │   │   ├── Rectangle.jsx         # Draggable rectangle shape
│   │   │   │   ├── Circle.jsx            # Draggable circle shape
│   │   │   │   └── ObjectFactory.jsx     # Renders objects by type
│   │   │   ├── Presence/
│   │   │   │   ├── Cursor.jsx            # Konva cursor dot + name label
│   │   │   │   ├── MultipleCursors.jsx   # Renders all remote user cursors
│   │   │   │   └── UserList.jsx          # Online users panel
│   │   │   └── ErrorBoundary.jsx         # Crash recovery with reload button
│   │   ├── hooks/
│   │   │   ├── AuthContext.js            # Shared auth context
│   │   │   ├── useAuth.js               # useAuth hook (pure hook, no components)
│   │   │   ├── useAuth.jsx              # AuthProvider component
│   │   │   ├── useBoardObjects.js       # Real-time Firestore object sync
│   │   │   ├── useCanvas.js             # Canvas state (zoom, pan, tool, color)
│   │   │   └── usePresence.js           # Presence tracking + throttled cursor updates
│   │   ├── services/
│   │   │   ├── firebase.js               # Firebase initialization
│   │   │   ├── board.js                  # Firestore CRUD for board objects
│   │   │   └── presence.js               # Firestore presence operations + cursor colors
│   │   ├── utils/
│   │   │   └── colors.js                 # Color palette utilities
│   │   ├── test/
│   │   │   └── setup.js                  # Vitest setup (jest-dom)
│   │   ├── App.jsx                       # Main app component
│   │   ├── main.jsx                      # App entry point
│   │   └── index.css                     # Global styles + Tailwind
│   ├── .env.example                      # Firebase config template
│   ├── firestore.rules                   # Firestore security rules
│   ├── firebase.json                     # Firebase config
│   ├── tailwind.config.js                # Tailwind configuration
│   ├── postcss.config.js                 # PostCSS config
│   ├── vite.config.js                    # Vite configuration
│   └── package.json                      # Dependencies
├── docs/                                 # Project documentation
├── MVP_PRD.md                            # Product requirements document
└── README.md                             # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 23.7.0 or higher
- npm
- Firebase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd collabboard_app
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Configure Firebase**

   Create a `frontend/.env` file with your Firebase project credentials:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

   The app reads these via `import.meta.env` in `frontend/src/services/firebase.js`.

4. **Start development server**
   ```bash
   npm run dev
   ```

   App will be running at `http://localhost:5173`

### Firebase Setup

1. **Create Firebase project** at [console.firebase.google.com](https://console.firebase.google.com)

2. **Enable Authentication**
   - Go to Authentication > Sign-in method
   - Enable Google and Email/Password providers

3. **Create Firestore Database**
   - Go to Firestore Database > Create database
   - Start in test mode (will secure later with rules)

4. **Deploy Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

## 🎮 Usage

### Local Development

1. Start the dev server: `npm run dev`
2. Open browser to `http://localhost:5173`
3. Sign in with Google or Email/Password
4. Select a tool (Sticky Note, Rectangle, or Circle) and click the canvas to place objects
5. Use Select tool to pan the canvas; scroll to zoom

### Manual Test Plan

#### 1. Authentication
- [ ] Page title says "CollabBoard"
- [ ] Sign in with Google (popup opens, signs in)
- [ ] Sign in with Email/Password (register first if needed)
- [ ] After login, you land on the board with toolbar visible

#### 2. Tools & Objects
- [ ] Select **Sticky Note** tool → click canvas → yellow note appears (default color)
- [ ] Double-click the note → type text → click away → text saved
- [ ] Pick a color from palette → create another sticky note → it uses the picked color
- [ ] Select **Rectangle** tool → click canvas → grey square appears (default color)
- [ ] Select **Circle** tool → click canvas → grey circle appears (default color)
- [ ] Select an object → pick a color → object changes to that color

#### 3. Move & Delete
- [ ] Switch to **Select** tool → drag any object → it moves smoothly
- [ ] Click an object → blue selection highlight appears
- [ ] Press **Delete** or **Backspace** → object disappears
- [ ] Press **Escape** → selection clears

#### 4. Pan & Zoom
- [ ] With Select tool, drag empty canvas → board pans
- [ ] Scroll wheel → board zooms in/out
- [ ] Toolbar zoom % updates as you zoom
- [ ] Click the **zoom %** button → zoom returns to 100%, position resets

#### 5. Real-time Sync (requires 2 browser windows)
- [ ] Open app in 2 windows, sign in with different accounts
- [ ] **Online panel**: both users appear with colored dots
- [ ] **Cursors**: move mouse in Window A → cursor with name label appears in Window B
- [ ] **Create sync**: create object in A → appears in B instantly (<100ms)
- [ ] **Move sync**: drag object in A → moves in B
- [ ] **Edit sync**: edit sticky note text in A → updates in B
- [ ] **Delete sync**: select + Delete key in A → disappears from B
- [ ] **Sign-out cleanup**: sign out in A → user disappears from B's Online panel

#### 6. Error Handling
- [ ] No console errors during normal usage
- [ ] App doesn't crash — if it does, ErrorBoundary shows reload button

### Deployment

```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Live URL: `https://collabboard-487701.web.app`

## 🧹 Factory Reset (Clean State for Testing)

To wipe all board data and start fresh, use the Firebase CLI to delete the Firestore collections:

```bash
# Make sure you're authenticated
firebase login

# Delete all board objects (sticky notes, rectangles, circles)
firebase firestore:delete --project collabboard-487701 -r boards/default-board/objects --force

# Delete all presence data (cursors, online users)
firebase firestore:delete --project collabboard-487701 -r boards/default-board/presence --force
```

Then start the dev server:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` — the board will be completely empty.

> **Note**: If your Firebase credentials have expired, run `firebase login --reauth` first.

## 📊 Data Model

### Firestore Collections

**boards/{boardId}/objects/{objectId}**
```javascript
{
  type: 'stickyNote' | 'rectangle' | 'circle',
  x: number,              // Canvas x position
  y: number,              // Canvas y position
  width: number,          // For stickyNote and rectangle
  height: number,         // For stickyNote and rectangle
  radius: number,         // For circle
  text: string,           // For sticky notes
  color: string,          // Hex color code
  rotation: number,       // Degrees
  zIndex: number,
  createdBy: string,      // User ID
  updatedBy: string,      // User ID
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**boards/{boardId}/presence/{userId}**
```javascript
{
  displayName: string,
  cursor: { x: number, y: number },
  color: string,          // Vivid cursor color (assigned by user ID hash)
  lastSeen: timestamp
}
```

## 🔐 Security

Firestore security rules:
- **Board objects**: Any authenticated user can read/write (shared board model)
- **Presence**: Any authenticated user can read; writes restricted to own user document only
- Presence cleanup: `leaveBoard()` deletes the presence doc before sign-out to ensure clean removal

## 🐛 Known Issues & Limitations

1. **Conflict Resolution**: Uses last-write-wins (Firestore default)
   - Two users editing the same sticky note text simultaneously may overwrite each other
   - Acceptable for MVP, consider operational transformation for production

2. **Performance**: No optimizations yet for large boards (100+ objects)
   - Consider Konva layer caching for production

3. **Mobile Support**: Limited mobile optimization
   - Touch gestures for pan/zoom not yet implemented

4. **Single Board**: All users share one board (`default-board`)
   - Multi-board support planned for post-MVP

## 📈 Development Timeline

### Phase 1 (Hours 0-3) ✅ COMPLETE
- Vite + React project initialization
- Firebase Authentication (Google + Email/Password)
- Tailwind CSS v3 configuration
- Initial deployment to Firebase Hosting

### Phase 2 (Hours 3-6) ✅ COMPLETE
- Infinite canvas with pan/zoom (Konva.js)
- Board toolbar with tool selection and color picker
- Canvas state management (useCanvas hook)

### Phase 3 (Hours 6-12) ✅ COMPLETE
- Firestore CRUD operations (board.js)
- Real-time sync with `onSnapshot` listeners (useBoardObjects hook)
- Sticky note component with drag & double-click text editing
- Multi-browser real-time sync verified

### Phase 4 (Hours 12-18) ✅ COMPLETE
- Presence service (joinBoard, updateCursor, leaveBoard)
- usePresence hook with throttled cursor updates (~15/sec)
- Multiplayer cursors (Konva dot + name label, counter-scaled for zoom)
- UserList panel showing online users with colored indicators
- Clean sign-out flow (presence deleted before auth sign-out)

### Phase 5 (Hours 18-24) ✅ COMPLETE
- Rectangle and Circle shape components
- Object creation for all 3 tool types via canvas click
- Firestore security rules hardened (presence write restricted to own doc)
- Production build and final deployment

## 🔮 Post-MVP Roadmap

### Priority 1 (Days 2-4)
- Connectors/lines between objects
- Frames for grouping
- Text elements
- Multi-select functionality
- Resize and rotate handles

### AI Integration (Days 3-4)
- FastAPI backend on Google Cloud Run
- OpenAI GPT-4 function calling
- Natural language commands:
  - "Create a red sticky note that says 'Hello'"
  - "Organize all notes into a grid"
  - "Summarize all sticky notes"
  - "Create a flowchart from this list"
  - "Export board as PNG"

### Polish (Days 5-7)
- Advanced UI animations
- Comprehensive documentation
- Demo video
- Performance benchmarks
- Cost analysis and optimization

## 💰 Cost Considerations

**Current Usage (MVP)**
- Firebase Auth: Free tier (unlimited)
- Firestore: ~50k reads/day on free tier
- Hosting: Free tier (10GB/month)
- **Estimated monthly cost**: $0 (within free tier)

**Scaling Concerns**
- Cursor updates throttled to ~15/second to control Firestore write costs
- Monitor Firebase console for usage spikes
- Consider upgrading to Blaze plan for production

## 🤝 Contributing

This is a solo sprint project for Austin admission. Contributions will be welcomed after the initial MVP gate passes.

## 📝 License

TBD

## 🙏 Acknowledgments

- Built with Claude Code (Opus 4.6)
- Firebase for backend infrastructure
- Konva.js for canvas rendering
- Tailwind CSS for styling

## 📧 Contact

Paul - [Your contact info]

---

**Project Status**: ✅ MVP Complete (All 9 requirements met)

**Last Updated**: February 17, 2026

**Live Demo**: https://collabboard-487701.web.app
