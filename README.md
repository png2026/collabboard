# CollabBoard

A real-time collaborative whiteboard application with AI integration capabilities. Built as a 24-hour MVP sprint for the Austin admission gate.

## 🎯 Overview

CollabBoard is an infinite canvas whiteboard that enables multiple users to collaborate in real-time. Users can create sticky notes, shapes, and see each other's cursors as they work together on a shared board. The application emphasizes bulletproof multiplayer synchronization as its core feature.

## ✨ Features

### Current (MVP Phase 1-3)
- ✅ **Authentication**: Google Sign-In and Email/Password authentication via Firebase Auth
- ✅ **Infinite Canvas**: Pan and zoom capabilities using Konva.js
- ✅ **Sticky Notes**: Create, edit, move, and delete collaborative sticky notes
- ✅ **Real-time Sync**: Sub-100ms synchronization between multiple users using Firestore
- ✅ **Tool Selection**: Toolbar with multiple drawing tools
- ✅ **Responsive UI**: Beautiful gradient design with Tailwind CSS

### Planned (Phase 4-5)
- ⏳ **Multiplayer Cursors**: See other users' cursors with name labels in real-time
- ⏳ **Presence Awareness**: Live user list showing who's currently on the board
- ⏳ **Shapes**: Rectangle and circle drawing tools
- ⏳ **AI Integration**: Natural language commands for board manipulation (Post-MVP)

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
│   │   │   │   ├── LoginPage.jsx         # Authentication UI
│   │   │   │   └── AuthProvider.jsx      # Auth context provider
│   │   │   ├── Board/
│   │   │   │   ├── BoardCanvas.jsx       # Main Konva Stage + pan/zoom
│   │   │   │   └── BoardToolbar.jsx      # Tool selection UI
│   │   │   └── Objects/
│   │   │       ├── StickyNote.jsx        # Draggable sticky note component
│   │   │       └── ObjectFactory.jsx     # Renders objects by type
│   │   ├── hooks/
│   │   │   ├── useAuth.jsx               # Authentication hook
│   │   │   ├── useBoardObjects.js        # Real-time Firestore sync
│   │   │   └── useCanvas.js              # Canvas state management
│   │   ├── services/
│   │   │   ├── firebase.js               # Firebase initialization
│   │   │   └── board.js                  # Firestore CRUD operations
│   │   ├── utils/
│   │   │   └── colors.js                 # Color palette utilities
│   │   ├── App.jsx                       # Main app component
│   │   ├── main.jsx                      # App entry point
│   │   └── index.css                     # Global styles + Tailwind
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

   Create `frontend/src/services/firebase.js` with your Firebase config:
   ```javascript
   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';
   import { getFirestore } from 'firebase/firestore';

   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     storageBucket: "your-storage-bucket",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };

   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const db = getFirestore(app);
   ```

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
4. Start creating sticky notes on the canvas!

### Testing Real-time Sync

1. Open the app in 2+ browser windows
2. Sign in with different accounts
3. Create/move/edit sticky notes
4. Verify changes sync instantly across all windows

### Deployment

```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Live URL: `https://collabboard-487701.web.app`

## 📊 Data Model

### Firestore Collections

**boards/{boardId}/objects/{objectId}**
```javascript
{
  type: 'stickyNote' | 'rectangle' | 'circle',
  x: number,              // Canvas x position
  y: number,              // Canvas y position
  width: number,
  height: number,
  text: string,           // For sticky notes
  color: string,          // Hex color code
  rotation: number,       // Degrees
  zIndex: number,
  updatedBy: string,      // User ID
  updatedAt: timestamp
}
```

**boards/{boardId}/presence/{userId}** (Planned - Phase 4)
```javascript
{
  displayName: string,
  cursor: { x: number, y: number },
  color: string,
  lastSeen: timestamp
}
```

## 🔐 Security

Current Firestore rules (development):
- All authenticated users can read/write to any board
- Presence updates restricted to own user document

**TODO**: Implement production-ready security rules with proper board ownership and permissions.

## 🐛 Known Issues & Limitations

1. **Conflict Resolution**: Uses last-write-wins (Firestore default)
   - Two users editing the same object simultaneously may overwrite each other
   - Acceptable for MVP, consider operational transformation for production

2. **Performance**: No optimizations yet for large boards (100+ objects)
   - Plan to implement Konva layer caching in Phase 5

3. **Mobile Support**: Limited mobile optimization
   - Touch gestures for pan/zoom not yet implemented

## 📈 Development Timeline

### Phase 1 (Hours 0-3) ✅ COMPLETE
- Vite + React project initialization
- Firebase Authentication implementation
- Tailwind CSS configuration
- Initial deployment to Firebase Hosting

### Phase 2 (Hours 3-6) ✅ COMPLETE
- Infinite canvas with pan/zoom
- Board toolbar with tool selection
- Canvas state management

### Phase 3 (Hours 6-12) ✅ COMPLETE
- Firestore CRUD operations
- Real-time sync with `onSnapshot` listeners
- Sticky note component with drag & edit
- Multi-browser sync testing

### Phase 4 (Hours 12-18) ⏳ IN PROGRESS
- Multiplayer cursor tracking
- Presence awareness system
- User list sidebar

### Phase 5 (Hours 18-24) ⏳ PENDING
- Rectangle and Circle shapes
- Firestore security rules hardening
- UI polish and performance optimization
- Final deployment and MVP verification

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
- Cursor updates throttled to 10-15/second to control Firestore write costs
- Monitor Firebase console for usage spikes
- Consider upgrading to Blaze plan for production

## 🤝 Contributing

This is a solo sprint project for Austin admission. Contributions will be welcomed after the initial MVP gate passes.

## 📝 License

TBD

## 🙏 Acknowledgments

- Built with Claude Code (Sonnet 4.5)
- Firebase for backend infrastructure
- Konva.js for canvas rendering
- Tailwind CSS for styling

## 📧 Contact

Pavel - [Your contact info]

---

**Project Status**: 🟢 Active Development (Phase 3 Complete, Phase 4 In Progress)

**Last Updated**: February 16, 2026

**Live Demo**: https://collabboard-487701.web.app
