# CollabBoard

A real-time collaborative whiteboard application with AI integration capabilities. Built as a 24-hour MVP sprint for the Austin admission gate.

## 🎯 Overview

CollabBoard is an infinite canvas whiteboard that enables multiple users to collaborate in real-time. Users can create sticky notes, shapes, and see each other's cursors as they work together on a shared board. The application emphasizes bulletproof multiplayer synchronization as its core feature.

## ✨ Features

### MVP (All Phases Complete)
- ✅ **Authentication**: Google Sign-In and Email/Password authentication via Firebase Auth
- ✅ **Infinite Canvas**: Pan and zoom capabilities using Konva.js
- ✅ **Sticky Notes**: Create, edit, move, and delete collaborative sticky notes
- ✅ **Shapes**: Rectangle and circle drawing tools (grey by default, recolorable)
- ✅ **Real-time Sync**: Sub-100ms synchronization between multiple users using Firestore
- ✅ **Multiplayer Cursors**: See other users' cursors with color-coded name labels in real-time
- ✅ **Presence Awareness**: Live "Online" user list showing who's currently on the board
- ✅ **Tool Selection**: Toolbar with Select, Sticky Note, Rectangle, and Circle tools
- ✅ **Color Picker**: 8-color palette; per-type defaults (yellow for sticky notes, grey for shapes); recolor selected objects
- ✅ **Selection & Delete**: Click to select (blue highlight), Delete/Backspace to remove, Escape to deselect
- ✅ **Responsive UI**: Clean design with Tailwind CSS, gradient login page
- ✅ **Deployed**: Live at https://collabboard-487701.web.app

### Priority 1 — Post-MVP (Complete)
- ✅ **Multi-select**: Click to select, Shift+click additive toggle, Shift+drag rubber-band selection
- ✅ **Group operations**: Move, duplicate (Ctrl+D), copy/paste (Ctrl+C/V), delete multiple objects at once
- ✅ **Resize & Rotate**: Konva Transformer with 8 resize handles and rotation handle on all object types
- ✅ **Connectors**: Arrow lines between objects with two-click creation, auto-update when endpoints move
- ✅ **Lines**: Standalone line tool with adjustable length and rotation
- ✅ **Text elements**: Standalone text on canvas, double-click to edit, scalable font size
- ✅ **Frames**: Labeled grouping rectangles with dashed borders, rendered behind other objects via z-index sorting
- ✅ **Offline indicator**: Yellow banner when network is disconnected; changes sync on reconnect
- ✅ **Test environment**: Separate Firestore collection (`dev-board`) via `vite --mode test`

### AI Board Agent (Complete)
- ✅ **Natural Language Commands**: Chat-based AI assistant that creates, modifies, and organizes board objects
- ✅ **AI Chat Panel**: Collapsible right-side drawer with conversation history
- ✅ **Creation Commands**: "Create a yellow sticky note that says Hello World"
- ✅ **Manipulation Commands**: "Move all pink sticky notes to the right", "Change color to blue"
- ✅ **Layout Commands**: "Arrange these sticky notes in a grid"
- ✅ **Complex Templates**: "Create a SWOT analysis", "Create a retrospective board with 3 columns"
- ✅ **Viewport-Aware Placement**: AI places objects where the user is currently looking
- ✅ **Real-time Sync**: AI-generated objects sync instantly to all connected users

### Observability & DevOps (Complete)
- ✅ **Langfuse Tracing**: AI request observability — tracks latency, token usage, and tool calls per command
- ✅ **Dev Scripts**: One-command `dev.sh` for both frontend and backend local development
- ✅ **Deploy Scripts**: One-command `deploy.sh` for both frontend (Firebase Hosting) and backend (Cloud Run)
- ✅ **Pre-deploy Tests**: Backend deploy runs `pytest` in Docker before deploying; aborts on failure

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
- **AI Backend**: FastAPI (Python 3.12) + OpenAI GPT-4 Turbo with function calling
- **AI Auth**: Firebase Admin SDK for token verification
- **Observability**: Langfuse (LLM tracing and analytics)

### Development Tools
- Node.js 23.7.0
- npm (package manager)
- Python 3.12 (conda environment `collabboard`)
- Firebase CLI
- Google Cloud SDK (`gcloud`)
- Git

## 📁 Project Structure

```
collabboard_app/
├── backend/                              # AI Agent API (FastAPI)
│   ├── app/
│   │   ├── routes/
│   │   │   └── ai.py                    # POST /api/ai/command endpoint
│   │   ├── auth.py                      # Firebase token verification
│   │   ├── config.py                    # Pydantic settings (API keys, origins)
│   │   ├── prompts.py                   # System prompt for GPT-4
│   │   ├── schemas.py                   # Request/response models
│   │   └── tools.py                     # 11 OpenAI function calling definitions
│   ├── main.py                          # FastAPI app entry point
│   ├── requirements.txt                 # Python dependencies
│   ├── Dockerfile                       # Cloud Run deployment
│   ├── docker-compose.yml               # Local dev with hot reload + debug
│   ├── dev.sh                           # One-command local dev (docker compose up)
│   ├── deploy.sh                        # One-command Cloud Run deploy (runs tests first)
│   ├── .gcloudignore                    # Files excluded from cloud builds
│   └── .env.example                     # Backend env template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AI/
│   │   │   │   └── AiChatPanel.jsx      # Right-side AI chat drawer
│   │   │   ├── Auth/
│   │   │   │   └── LoginPage.jsx         # Authentication UI
│   │   │   ├── Board/
│   │   │   │   ├── BoardCanvas.jsx       # Main Konva Stage + pan/zoom + selection + shortcuts
│   │   │   │   ├── BoardToolbar.jsx      # Tool selection, color picker, zoom, AI toggle
│   │   │   │   ├── SelectionRect.jsx     # Rubber-band selection rectangle
│   │   │   │   └── TransformerComponent.jsx # Konva Transformer (resize/rotate handles)
│   │   │   ├── Objects/
│   │   │   │   ├── StickyNote.jsx        # Draggable sticky note with text editing
│   │   │   │   ├── Rectangle.jsx         # Draggable rectangle shape
│   │   │   │   ├── Circle.jsx            # Draggable circle shape
│   │   │   │   ├── LineShape.jsx         # Draggable line with adjustable length
│   │   │   │   ├── TextElement.jsx       # Standalone text, double-click to edit
│   │   │   │   ├── Frame.jsx            # Labeled grouping frame (dashed border)
│   │   │   │   ├── Connector.jsx         # Arrow line between two objects
│   │   │   │   └── ObjectFactory.jsx     # Renders objects by type
│   │   │   ├── Presence/
│   │   │   │   ├── Cursor.jsx            # Konva cursor dot + name label
│   │   │   │   ├── MultipleCursors.jsx   # Renders all remote user cursors
│   │   │   │   └── UserList.jsx          # Online users panel
│   │   │   └── ErrorBoundary.jsx         # Crash recovery with reload button
│   │   ├── hooks/
│   │   │   ├── AuthContext.js            # Shared auth context
│   │   │   ├── useAiAgent.js            # AI chat state + command orchestration
│   │   │   ├── useAuth.js               # useAuth hook (pure hook, no components)
│   │   │   ├── useAuth.jsx              # AuthProvider component
│   │   │   ├── useBoardObjects.js       # Real-time Firestore object sync
│   │   │   ├── useCanvas.js             # Canvas state (zoom, pan, tool, color)
│   │   │   ├── useNetworkStatus.js      # Online/offline detection
│   │   │   ├── usePresence.js           # Presence tracking + throttled cursor updates
│   │   │   └── useSelection.js          # Multi-select state (Set<id>, additive toggle)
│   │   ├── services/
│   │   │   ├── ai.js                     # AI API client + action executor
│   │   │   ├── firebase.js               # Firebase init (offline persistence enabled)
│   │   │   ├── board.js                  # Firestore CRUD + batch writes for board objects
│   │   │   └── presence.js               # Firestore presence operations + cursor colors
│   │   ├── utils/
│   │   │   ├── colors.js                 # Color palette + per-type defaults
│   │   │   └── connectorUtils.js         # Object center/edge point calculations
│   │   ├── test/
│   │   │   └── setup.js                  # Vitest setup (jest-dom)
│   │   ├── App.jsx                       # Main app component
│   │   ├── main.jsx                      # App entry point
│   │   └── index.css                     # Global styles + Tailwind
│   ├── dev.sh                            # One-command local dev (Vite dev mode)
│   ├── deploy.sh                         # One-command Firebase Hosting deploy
│   ├── .env.example                      # Firebase + AI API config template
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
- Python 3.12 (via conda: `conda create -n collabboard python=3.12`)
- Firebase account
- OpenAI API key
- Google Cloud SDK (`brew install --cask google-cloud-sdk`)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd collabboard_app
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Configure Firebase (frontend)**

   Create a `frontend/.env` file with your Firebase project credentials:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_AI_API_URL=http://localhost:8080
   ```

4. **Set up the AI backend**
   ```bash
   conda activate collabboard
   cd backend
   pip install -r requirements.txt
   ```

   Create `backend/.env` from the example:
   ```env
   OPENAI_API_KEY=sk-your-openai-key
   OPENAI_MODEL=gpt-4-turbo
   ALLOWED_ORIGINS=["http://localhost:5173"]
   ```

   Authenticate with Google Cloud for Firebase token verification:
   ```bash
   gcloud auth application-default login --project your-firebase-project-id
   ```

5. **Start both servers**

   Terminal 1 — Backend:
   ```bash
   cd backend
   ./dev.sh
   ```

   Terminal 2 — Frontend:
   ```bash
   cd frontend
   ./dev.sh
   ```

   Frontend at `http://localhost:5173`, backend at `http://localhost:8080`

   > `backend/dev.sh` runs `docker compose up --build` (hot reload + local ADC credentials).
   > `frontend/dev.sh` runs `npm run dev -- --mode dev` (uses isolated `dev-board` Firestore collection).

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
4. Select a tool from the toolbar and click the canvas to place objects
5. Use Select tool to pan the canvas; Shift+drag for rubber-band multi-select; scroll to zoom
6. Keyboard shortcuts: Delete/Backspace (delete), Ctrl+D (duplicate), Ctrl+C/V (copy/paste), Escape (deselect)
7. Click the **AI** button in the toolbar to open the chat panel
8. Type natural language commands like "Create a yellow sticky note that says Hello World"

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
- [ ] Select **Rectangle** tool → click canvas → grey rectangle appears
- [ ] Select **Circle** tool → click canvas → grey circle appears
- [ ] Select **Line** tool → click canvas → line appears
- [ ] Select **Text** tool → click canvas → text element appears; double-click to edit
- [ ] Select **Frame** tool → click canvas → dashed frame appears; double-click to edit title
- [ ] Select **Connector** tool → click first object → click second object → arrow drawn between them
- [ ] Select an object → pick a color → object changes to that color

#### 3. Selection & Multi-select
- [ ] Click an object → blue Transformer handles appear (resize + rotate)
- [ ] Shift+click another object → both selected
- [ ] Hold Shift + drag empty canvas → rubber-band rectangle selects enclosed objects
- [ ] Drag a selected object when multiple are selected → all move together
- [ ] Press **Delete** or **Backspace** → all selected objects removed (plus attached connectors)
- [ ] Press **Escape** → selection clears
- [ ] **Ctrl+D** → duplicates selected objects (offset by 20px)
- [ ] **Ctrl+C** then **Ctrl+V** → copies and pastes selected objects

#### 4. Resize & Rotate
- [ ] Select an object → drag a corner handle → object resizes
- [ ] Select an object → drag the rotation handle → object rotates
- [ ] Transform syncs to other clients in real-time

#### 5. Pan & Zoom
- [ ] With Select tool, drag empty canvas → board pans
- [ ] Scroll wheel → board zooms in/out
- [ ] Toolbar zoom % updates as you zoom
- [ ] Click the **zoom %** button → zoom returns to 100%, position resets

#### 6. Real-time Sync (requires 2 browser windows)
- [ ] Open app in 2 windows, sign in with different accounts
- [ ] **Online panel**: both users appear with colored dots
- [ ] **Cursors**: move mouse in Window A → cursor with name label appears in Window B
- [ ] **Create sync**: create object in A → appears in B instantly (<100ms)
- [ ] **Move sync**: drag object in A → moves in B
- [ ] **Edit sync**: edit sticky note text in A → updates in B
- [ ] **Delete sync**: select + Delete key in A → disappears from B
- [ ] **Sign-out cleanup**: sign out in A → user disappears from B's Online panel

#### 7. AI Board Agent (requires backend running on port 8080)
- [ ] Click **AI** button in toolbar → chat panel opens on right side
- [ ] Type "Create a yellow sticky note that says Hello World" → sticky note appears on board
- [ ] Type "Create a SWOT analysis" → 4 frames with labeled sticky notes appear
- [ ] Type "Move all the pink sticky notes to the right" → matching objects move
- [ ] Type "Change the color of the Hello World note to blue" → color changes
- [ ] Type "Create a retrospective board with 3 columns" → complex template created
- [ ] AI-created objects sync to other connected users in real-time
- [ ] Click **AI** button again → chat panel closes

#### 8. Error Handling
- [ ] No console errors during normal usage
- [ ] App doesn't crash — if it does, ErrorBoundary shows reload button

### Dev Environment

To use a separate Firestore collection (`dev-board`) instead of production (`default-board`):

```bash
npm run dev -- --mode dev
```

This loads `.env.dev` which sets `VITE_BOARD_ENV=dev`. All board data is isolated from production.

### Deployment

#### Frontend (Firebase Hosting)

```bash
cd frontend
./deploy.sh
```

The deploy script builds the frontend (`npm run build`) and deploys to Firebase Hosting.

Live URL: `https://collabboard-487701.web.app`

#### Backend (Cloud Run)

The AI backend deploys to Google Cloud Run from source (builds in the cloud via Cloud Build):

```bash
cd backend
./deploy.sh
```

Service URL: `https://collabboard-backend-583286688849.us-central1.run.app`

In production, the frontend does **not** call Cloud Run directly. Firebase Hosting rewrites `/api/**` requests to the Cloud Run service (configured in `firebase.json`), so all API calls stay same-origin — no CORS issues. Authentication is handled at the app level (Firebase token verification in FastAPI).

The deploy script (`backend/deploy.sh`) handles:
- **Running tests first** — `pytest` runs in the Docker container; deploy aborts if tests fail
- Building the container image in Cloud Build using the existing `Dockerfile`
- Setting env vars (`OPENAI_MODEL`, `GOOGLE_CLOUD_PROJECT`, `ALLOWED_ORIGINS`, `LANGFUSE_BASE_URL`)
- Mounting secrets from **GCP Secret Manager**: `openai-api-key`, `langfuse-secret-key`, `langfuse-public-key`

**Prerequisites for deploying:**
- Authenticated with `gcloud auth login`
- Project set: `gcloud config set project collabboard-487701`
- Required APIs enabled: Cloud Run, Cloud Build, Artifact Registry, Secret Manager

#### Backend Local Development (Docker)

Run the backend locally in Docker with hot reload and debugging support:

```bash
cd backend
docker compose up --build
```

This uses `docker-compose.yml` which:
- Mounts your local code as a volume (changes apply instantly)
- Runs uvicorn with `--reload` for hot reloading
- Mounts your local Google ADC credentials for Firebase auth
- Exposes the backend on `http://localhost:8080`

To debug with VS Code, attach to the running container via **Remote Explorer** (Dev Containers extension) — no extra dependencies needed.

**Prerequisite:** Run `gcloud auth application-default login --project collabboard-487701` once to set up local credentials.

#### Environment Files

Vite loads env files by mode. Only `.env.example` files are committed to git — all others are gitignored.

| File | Loaded when | Purpose |
|------|-------------|---------|
| `frontend/.env` | `npm run dev` (default) | Local development — AI API points to `localhost:8080` |
| `frontend/.env.production` | `npm run build` | Production build — AI API URL is empty (same-origin via Firebase Hosting rewrite) |
| `frontend/.env.dev` | `npm run dev -- --mode dev` | Uses isolated `dev-board` Firestore collection |
| `frontend/.env.example` | Never (template) | Documents required variables for new developers |
| `backend/.env` | Local dev (docker-compose / uvicorn) | Backend secrets for local development |
| `backend/.env.example` | Never (template) | Documents required backend variables |

#### Secrets Management

No secrets are committed to git. All `.env` files are in `.gitignore`.

| Secret | Local dev | Production (Cloud Run) |
|--------|-----------|------------------------|
| **OpenAI API key** | `backend/.env` (local file) | GCP Secret Manager (secret: `openai-api-key`), mounted via `--set-secrets` |
| **Langfuse keys** | `backend/.env` (local file) | GCP Secret Manager (secrets: `langfuse-secret-key`, `langfuse-public-key`), mounted via `--set-secrets` |
| **Firebase config** | `frontend/.env` (local file) | `frontend/.env.production` (baked into build). These are public client-side keys, secured by Firestore rules and Firebase Auth — not sensitive |
| **Google ADC** (Firebase Admin) | `docker-compose.yml` mounts `~/.config/gcloud/application_default_credentials.json` | Automatic via Cloud Run's metadata server |

**To rotate the OpenAI key:**
1. Generate a new key at [platform.openai.com](https://platform.openai.com)
2. Update locally: `backend/.env`
3. Update in production: `gcloud secrets versions add openai-api-key --data-file=-` (paste key, then Ctrl+D)
4. Redeploy: `cd backend && ./deploy.sh`

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
  type: 'stickyNote' | 'rectangle' | 'circle' | 'line' | 'text' | 'frame' | 'connector',
  x: number,              // Canvas x position
  y: number,              // Canvas y position
  width: number,          // For stickyNote, rectangle, line, text, frame
  height: number,         // For stickyNote, rectangle, frame
  radius: number,         // For circle
  text: string,           // For stickyNote and text
  title: string,          // For frame
  fontSize: number,       // For text
  strokeWidth: number,    // For line
  color: string,          // Hex color code
  rotation: number,       // Degrees
  zIndex: number,         // Rendering order (frames use 0 to render behind)
  // Connector-specific fields:
  fromId: string,         // Source object ID
  toId: string,           // Target object ID
  fromX: number, fromY: number,  // Fallback start point
  toX: number, toY: number,      // Fallback end point
  strokeColor: string,    // Connector line color
  arrowEnd: boolean,      // Show arrowhead
  // Metadata:
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

**Firestore rules:**
- **Board objects**: Any authenticated user can read/write (shared board model)
- **Presence**: Any authenticated user can read; writes restricted to own user document only
- Presence cleanup: `leaveBoard()` deletes the presence doc before sign-out to ensure clean removal

**API authentication:**
- Backend verifies Firebase ID tokens on every request (`Authorization: Bearer <token>`)
- Cloud Run IAM invoker check is disabled (`--no-invoker-iam-check`) — auth is handled at the app level
- In production, API requests are proxied through Firebase Hosting (`/api/**` rewrite), so they stay same-origin

**Why `--no-invoker-iam-check`?**
The GCP org policy (`iam.allowedPolicyMemberDomains`) prevents granting `allUsers` or the Firebase Hosting system service account (`firebase-hosting@system.gserviceaccount.com`) invoker access to Cloud Run. Without this, Firebase Hosting rewrites would get 401/403 from Cloud Run's IAM layer before reaching the app. Disabling the IAM invoker check is safe here because the app validates Firebase tokens on every request — unauthenticated calls are rejected with 401 at the application level.

**CORS:**
- **Local dev**: Frontend (`:5173`) and backend (`:8080`) are different origins, so FastAPI's `CORSMiddleware` provides the necessary headers
- **Production**: Firebase Hosting rewrites `/api/**` to Cloud Run (same origin), so no CORS is needed at all

**Secrets:**
- No secrets in git (all `.env` files gitignored)
- Production OpenAI key stored in GCP Secret Manager, not as a plain env var
- Firebase client-side keys are public by design — security enforced by Firestore rules and Firebase Auth, not key secrecy

## 🐛 Known Issues & Limitations

1. **Conflict Resolution**: Uses last-write-wins at field level (Firestore shallow merge)
   - Two users editing the same field on the same object simultaneously: last write wins
   - Different fields on the same object (e.g., one moves, another edits text): both preserved
   - Acceptable for collaborative whiteboard; concurrent edits to the same object are rare

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

### Priority 1 (Days 2-4) ✅ COMPLETE
- ✅ Multi-select (click, Shift+click, Shift+drag rubber-band)
- ✅ Group operations (move, duplicate, copy/paste, delete)
- ✅ Resize & rotate (Konva Transformer on all object types)
- ✅ Connectors/lines between objects (two-click creation, auto-updating endpoints)
- ✅ Text elements (standalone, double-click to edit)
- ✅ Frames for grouping (labeled, dashed border, z-index behind)
- ✅ Line tool
- ✅ Offline indicator + test environment

### AI Board Agent (Days 3-4) ✅ COMPLETE
- ✅ FastAPI backend with OpenAI GPT-4 Turbo function calling (11 tool definitions)
- ✅ Firebase Auth token verification on backend
- ✅ Collapsible AI chat panel (right-side drawer)
- ✅ Frontend action executor (AI returns structured actions, frontend executes via board.js)
- ✅ Viewport-aware object placement
- ✅ Supports creation, manipulation, layout, and complex template commands

### Polish (Days 5-7) ✅ COMPLETE
- ✅ Advanced UI animations
- ✅ Demo video
- ✅ Performance benchmarks
- ✅ Cloud Run deployment
- ✅ Langfuse observability (LLM tracing)
- ✅ Dev scripts (`dev.sh` for frontend & backend)
- ✅ Deploy scripts (`deploy.sh` for frontend & backend)
- ✅ Pre-deploy test gate (pytest runs before backend deploy)

## 💰 Cost Considerations

**Current Usage (MVP)**
- Firebase Auth: Free tier (unlimited)
- Firestore: ~50k reads/day on free tier
- Hosting: Free tier (10GB/month)
- **Estimated monthly cost**: $0 (within free tier)

**AI Backend Costs**
- OpenAI GPT-4 Turbo: ~$0.01-0.03 per AI command (input + output tokens)
- Cloud Run: Pay-per-request when deployed (free tier: 2M requests/month)

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

**Project Status**: ✅ MVP Complete + Post-MVP Complete + AI Board Agent Complete + Polish Complete

**Last Updated**: February 20, 2026

**Live Demo**: https://collabboard-487701.web.app
