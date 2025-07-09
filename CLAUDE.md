# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Server (Backend)
```bash
cd server
npm install
npm run dev     # Development with nodemon
npm start       # Production
```

### Frontend (Static Files)
```bash
cd client
serve -p 8080   # Serves static files
```

### Test Server
```bash
cd test
npm install
npm start       # Starts test server on port 8081
npm run dev     # Development with nodemon
```

### Systemd Services (Recommended)
```bash
# One-time setup
cd services
./install-services.sh

# Service management
cd services/scripts
./start-all.sh     # Start all services
./stop-all.sh      # Stop all services
./status-all.sh    # Check status
./restart-all.sh   # Restart all services
```

## Architecture Overview

Knowable is a real-time graph explorer with a server-driven architecture:

- **Backend**: Node.js Express server with WebSocket support (port 3000)
- **Frontend**: Static HTML/JS client served from client/ (port 8080)
- **Test Server**: Automated testing with JSON results (port 8081)
- **Communication**: WebSocket-first with HTTP fallback
- **Session Management**: Instance-based sessions with persistent state

### Key Components

**Server (`server/`)**:
- `server.js`: Main Express server with WebSocket handling and session middleware
- `action-handlers.js`: Action-to-handler mapping with command factories
- `sample-graph.js`: Sample data

**Frontend (`client/`)**:
- `index.html`: Main application interface
- `app.js`: Client-side WebSocket logic with automatic reconnection

**Session Architecture**:
- Sessions identified by instance headers (`req.headers['instance']`)
- Server maintains `sessionStates` Map for each active session
- WebSocket connections tracked in `wsConnections` Map
- Action-command protocol enables stateful interactions

### Action-Command Protocol

1. Client sends actions via WebSocket: `{action: "action-name", ...params}`
2. Server routes actions through handlers in `action-handlers.js`
3. Handlers return commands: `{command: "command-name", ...data}`
4. Commands are sent back to client for execution

### Development Workflow

The project uses three coordinated services:
1. **Backend service**: API server with WebSocket support
2. **Frontend service**: Static file server for client
3. **Test service**: Automated API testing with results

Use systemd services for managed development - they handle service coordination, logging, and automatic restarts.

### Testing

- Test server runs comprehensive action-command protocol tests
- JSON results available at test server endpoints
- Tests verify WebSocket and HTTP communication paths
- Service status monitoring included in test suite

### Deployment

- **Backend**: Railway auto-deployment from GitHub
- **Frontend**: GitHub Pages from client/ folder
- Production URLs configured in `client/app.js`