# CollabBoard - MVP Product Requirements Document

**Building Real-Time Collaborative Whiteboard Tools with AI-First Development**

## Project Overview

CollabBoard is a production-scale collaborative whiteboard application with AI agent integration. This is a **7-day sprint** with a **hard gate MVP deadline at 24 hours**.

**Gate:** Project completion is required for Austin admission.

**Core Philosophy:** A simple whiteboard with bulletproof multiplayer beats a feature-rich board with broken sync.

---

## Timeline & Checkpoints

| Checkpoint | Deadline | Focus |
|------------|----------|-------|
| Pre-Search | Monday (1 hour in) | Architecture, Planning |
| **MVP** | **Tuesday (24 hours)** | **Collaborative infrastructure** |
| Early Submission | Friday (4 days) | Full feature set |
| Final | Sunday (7 days) | Polish, documentation, deployment |

---

## MVP Requirements (24 Hours) - HARD GATE

All items required to pass:

- [ ] Infinite board with pan/zoom
- [ ] Sticky notes with editable text
- [ ] At least one shape type (rectangle, circle, or line)
- [ ] Create, move, and edit objects
- [ ] Real-time sync between 2+ users
- [ ] Multiplayer cursors with name labels
- [ ] Presence awareness (who's online)
- [ ] User authentication
- [ ] Deployed and publicly accessible

---

## Technical Stack

### Frontend
- **Framework:** React 18 + Vite
- **Canvas Rendering:** Konva.js + react-konva
- **Styling:** Tailwind CSS
- **State Management:** React hooks + Context

### Backend & Services
- **Authentication:** Firebase Auth (Google sign-in + email/password)
- **Database:** Cloud Firestore with onSnapshot listeners
- **AI Backend:** FastAPI (Python) on GCP Cloud Run
- **AI API:** OpenAI GPT-4 with function calling

### Deployment
- **Frontend Hosting:** Firebase Hosting
- **Backend Hosting:** GCP Cloud Run (containerized FastAPI)
- **Version Control:** GitHub

### AI Development Tools
- **Primary:** Claude Code (for React/Konva component generation)
- **Secondary:** Cursor (for inline code completion)

---

## Architecture

### Real-Time Sync Architecture

**Data Flow:**
```
User Input → React Component → Firestore Write → onSnapshot Listener → All Connected Clients
```

**Firestore Data Model:**
```
boards/{boardId}
  ├── name, createdBy, createdAt

boards/{boardId}/objects/{objectId}
  ├── type (stickyNote, rectangle, circle, line, frame, text)
  ├── x, y, width, height
  ├── text, color, rotation, zIndex
  └── updatedBy, updatedAt

boards/{boardId}/presence/{userId}
  ├── displayName
  ├── cursor: {x, y}
  ├── color
  └── lastSeen
```

### AI Agent Architecture

**Flow:**
```
User Command → Frontend → FastAPI Backend → OpenAI GPT-4 Function Calling →
Structured Response → Frontend → Firestore Write → Real-time Sync to All Users
```

**FastAPI Backend (Python on Cloud Run):**
- Single endpoint: `POST /api/ai-command`
- Verifies Firebase Auth token
- Calls OpenAI GPT-4 with function calling
- Returns structured JSON response
- Frontend writes results to Firestore

---

## Core Features

### Board Features

| Feature | Requirements |
|---------|--------------|
| Workspace | Infinite board with smooth pan/zoom |
| Sticky Notes | Create, edit text, change colors |
| Shapes | Rectangles, circles, lines with solid colors |
| Connectors | Lines/arrows connecting objects |
| Text | Standalone text elements |
| Frames | Group and organize content areas |
| Transforms | Move, resize, rotate objects |
| Selection | Single and multi-select (shift-click, drag-to-select) |
| Operations | Delete, duplicate, copy/paste |

### Real-Time Collaboration

| Feature | Requirements |
|---------|--------------|
| Cursors | Multiplayer cursors with names, real-time movement |
| Sync | Object creation/modification appears instantly for all users |
| Presence | Clear indication of who's currently on the board |
| Conflicts | Handle simultaneous edits (last-write-wins acceptable, must document approach) |
| Resilience | Graceful disconnect/reconnect handling |
| Persistence | Board state survives all users leaving and returning |

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Frame rate | 60 FPS during pan, zoom, object manipulation |
| Object sync latency | <100ms |
| Cursor sync latency | <50ms |
| Object capacity | 500+ objects without performance drops |
| Concurrent users | 5+ without degradation |

**Optimization Strategies:**
- Throttle cursor updates to 10-15/second
- Use Konva layer caching
- Only re-render dirty regions
- Separate presence collection with short TTLs

---

## AI Board Agent

### Required Capabilities

Must support **at least 6 distinct commands** across these categories:

#### Creation Commands
- "Add a yellow sticky note that says 'User Research'"
- "Create a blue rectangle at position 100, 200"
- "Add a frame called 'Sprint Planning'"

#### Manipulation Commands
- "Move all the pink sticky notes to the right side"
- "Resize the frame to fit its contents"
- "Change the sticky note color to green"

#### Layout Commands
- "Arrange these sticky notes in a grid"
- "Create a 2x3 grid of sticky notes for pros and cons"
- "Space these elements evenly"

#### Complex Commands
- "Create a SWOT analysis template with four quadrants"
- "Build a user journey map with 5 stages"
- "Set up a retrospective board with What Went Well, What Didn't, and Action Items columns"

### Tool Schema (Minimum)

```javascript
createStickyNote(text, x, y, color)
createShape(type, x, y, width, height, color)
createFrame(title, x, y, width, height)
createConnector(fromId, toId, style)
moveObject(objectId, x, y)
resizeObject(objectId, width, height)
updateText(objectId, newText)
changeColor(objectId, color)
getBoardState() // returns current board objects for context
```

### AI Agent Performance Targets

| Metric | Target |
|--------|--------|
| Response latency | <2 seconds for single-step commands |
| Command breadth | 6+ command types |
| Complexity | Multi-step operation execution |
| Reliability | Consistent, accurate execution |

### Shared AI State
- All users see AI-generated results in real-time
- Multiple users can issue AI commands simultaneously without conflict

---

## Testing Scenarios

We will test:

1. **2 users editing simultaneously** in different browsers
2. **One user refreshing mid-edit** (state persistence check)
3. **Rapid creation and movement** of sticky notes and shapes (sync performance)
4. **Network throttling** and disconnection recovery
5. **5+ concurrent users** without degradation

**Testing Approach:**
- Manual multi-browser testing throughout development
- Chrome DevTools network throttling
- Firebase Emulator Suite for local development

---

## Project File Structure

```
collabboard/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Board/          # Canvas, Stage, Layer
│   │   │   ├── Objects/        # StickyNote, Shape, Connector, Frame
│   │   │   ├── Toolbar/        # Tool selection, color picker
│   │   │   ├── Presence/       # Cursors, user list
│   │   │   └── AI/             # Chat input, command history
│   │   ├── hooks/
│   │   │   ├── useFirestore.js # Real-time listeners
│   │   │   ├── usePresence.js  # Cursor + presence sync
│   │   │   └── useBoard.js     # Board state management
│   │   ├── services/
│   │   │   ├── firebase.js     # Firebase config + init
│   │   │   ├── ai.js           # Calls to FastAPI backend
│   │   │   └── board.js        # CRUD operations
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── firestore.rules
│   ├── firebase.json
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI app + routes
│   │   ├── ai_agent.py         # OpenAI function calling
│   │   ├── schemas.py          # Pydantic models
│   │   ├── auth.py             # Firebase token verification
│   │   └── config.py           # Environment variables
│   ├── requirements.txt
│   └── Dockerfile              # Cloud Run deployment
└── README.md
```

---

## Build Priority (Aligned with MVP Gate)

### P0 - Critical for MVP (Hours 0-24)

| Priority | Feature | Timeframe |
|----------|---------|-----------|
| P0 | Firebase setup + Auth + basic React app deployed | Hours 0-3 |
| P0 | Infinite canvas with pan/zoom (react-konva Stage) | Hours 3-6 |
| P0 | Sticky notes (create, edit, move) + Firestore sync | Hours 6-12 |
| P0 | Multiplayer cursors + presence | Hours 12-18 |
| P0 | Shape support + polish for MVP gate | Hours 18-24 |

### P1 - Full Feature Set (Day 2-4)

| Priority | Feature | Timeframe |
|----------|---------|-----------|
| P1 | Connectors, frames, text elements | Day 2-3 |
| P1 | Selection (single, multi, drag-to-select) | Day 2-3 |
| P1 | Transforms (resize, rotate) | Day 3 |
| P1 | AI agent (basic creation commands) | Day 3-4 |

### P2 - Polish & Completion (Day 4-7)

| Priority | Feature | Timeframe |
|----------|---------|-----------|
| P2 | AI agent (complex commands, SWOT, templates) | Day 4-5 |
| P2 | Polish, animations, UX improvements | Day 5-6 |
| P2 | Documentation, demo video, cost analysis | Day 6-7 |

---

## Security Considerations

### Firestore Security Rules

**Critical:** Must write rules that:
- Allow authenticated users to read/write their boards
- Prevent unauthorized access
- Restrict writes on the presence collection to prevent impersonation

### API Security

- **OpenAI API Key:** Never reaches client; FastAPI backend acts as proxy
- **Cloud Run IAM:** Restrict invocations to authenticated requests only
- **Firebase Auth Tokens:** FastAPI endpoint must verify tokens before processing

### XSS Prevention

- Konva.js renders text to canvas (inherently XSS-safe - canvas doesn't execute HTML/JS)

---

## Cost Projections

### Development Costs

| Category | Estimated Cost | Notes |
|----------|----------------|-------|
| Claude Pro/Max | $20-200/month | Depending on usage tier |
| Firebase (Blaze) | $0-5/month | Free tier covers project scale |
| Firebase Hosting | $0/month | Free tier: 10GB transfer/month |
| GCP Cloud Run | $0-5/month | Free tier: 2M requests/month |
| OpenAI API (dev) | $20-50/week | GPT-4 function calling during development |
| OpenAI API (production) | $5-20/month | User-facing AI commands |

**Total Expected:** $45-90/month on Claude Pro, $125-170/month with Claude Max 5x

### Production Cost Projections

Estimate monthly costs at scale:

| Users | Estimated Cost | Assumptions |
|-------|----------------|-------------|
| 100 | $___/month | TBD based on actual usage patterns |
| 1,000 | $___/month | Avg AI commands per user per session |
| 10,000 | $___/month | Avg sessions per user per month |
| 100,000 | $___/month | Token counts per command type |

---

## AI-First Development Requirements

### Required Tools

Use at least two of:
- Claude Code ✓
- Cursor ✓
- Codex
- MCP integrations

### AI Development Log (Required)

Submit a 1-page document covering:

| Section | Content |
|---------|---------|
| Tools & Workflow | Which AI coding tools used, how integrated |
| MCP Usage | Which MCPs used (if any), what they enabled |
| Effective Prompts | 3-5 prompts that worked well (include actual prompts) |
| Code Analysis | Rough % of AI-generated vs hand-written code |
| Strengths & Limitations | Where AI excelled, where it struggled |
| Key Learnings | Insights about working with coding agents |

---

## Submission Requirements

**Deadline:** Sunday 10:59 PM CT

| Deliverable | Requirements |
|-------------|--------------|
| GitHub Repository | Setup guide, architecture overview, deployed link |
| Demo Video (3-5 min) | Real-time collaboration, AI commands, architecture explanation |
| Pre-Search Document | Completed checklist from Phase 1-3 ✓ |
| AI Development Log | 1-page breakdown using template above |
| AI Cost Analysis | Dev spend + projections for 100/1K/10K/100K users |
| Deployed Application | Publicly accessible, supports 5+ users with auth |
| Social Post | Share on X or LinkedIn: description, features, demo/screenshots, tag @GauntletAI |

---

## Critical Guidance

### Development Strategy

1. **Multiplayer sync is the hardest part. Start here.**
2. **Build vertically:** finish one layer before starting the next
3. **Test with multiple browser windows continuously**
4. **Throttle network speed during testing**
5. **Test simultaneous AI commands from multiple users**

### Key Technical Decisions (From Pre-Search)

**Why Firebase?**
- Real-time listeners provide WebSocket-level sync without WebSocket code
- Eliminates server management, auth implementation, sync infrastructure
- Free tier covers project scale

**Why Konva.js + react-konva?**
- Declarative JSX approach maps to React mental model
- Gentlest learning curve for canvas beginners
- Performance ceiling (60fps with 500+ objects) matches requirements

**Why FastAPI on Cloud Run?**
- Python backend plays to ML Engineer strengths
- OpenAI function calling, prompt engineering feel natural
- Auto-scales, generous free tier, same GCP ecosystem as Firebase

**Why OpenAI GPT-4?**
- Function calling maps directly to tool schema
- ~$0.03-0.10 per AI command at scale
- Proven reliability for structured outputs

---

## Success Criteria

### MVP Success (24 Hours)
- All MVP checklist items complete ✓
- Real-time sync works reliably with 2+ users
- Deployed and publicly accessible
- Clean, simple UI

### Final Success (7 Days)
- All core whiteboard features implemented
- AI agent handles 6+ command types reliably
- Performance targets met
- Clean documentation
- Demo video showcases real-time collaboration
- Cost analysis complete

---

## Risk Mitigation

### Biggest Risks

1. **Firestore read costs with cursor listeners**
   - *Mitigation:* Throttle to 10-15/second, separate presence collection

2. **Canvas performance at 500+ objects**
   - *Mitigation:* Konva layer caching, dirty region rendering

3. **Cloud Run cold starts**
   - *Mitigation:* Accept 2-3s delay or set min instances to 1 ($36/month)

4. **Junior JS skills + no canvas experience**
   - *Mitigation:* Heavy reliance on AI coding tools for frontend

---

## Final Note

**A simple, solid, multiplayer whiteboard with a working AI agent beats any feature-rich board with broken collaboration.**

Focus on getting the real-time sync infrastructure bulletproof first. Everything else builds on that foundation.

**Project completion is required for Austin admission.**
