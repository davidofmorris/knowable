# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Server Development
```bash
# Backend server (port 3000)
cd server && npm run dev

# Start backend in production
cd server && npm start

# Test server (port 8081)
cd test && npm run dev
```

### Frontend Development
```bash
# Serve frontend static files (port 8080)
npx serve client -p 8080

# Or using global serve (if installed)
serve client -p 8080
```

### Service Management (Production)
```bash
# Install systemd services
./services/install-services.sh

# Manage all services
cd services/scripts/
./start-all.sh     # Start all services
./stop-all.sh      # Stop all services
./status-all.sh    # Check service status
./restart-all.sh   # Restart all services

# Individual service management
sudo systemctl start knowable-backend    # port 3000
sudo systemctl start knowable-frontend   # port 8080
sudo systemctl start knowable-test       # port 8081

# View logs
journalctl -u knowable-backend -f
```

## Architecture Overview

Knowable is a knowledge graph explorer with a client-server architecture using WebSocket communication.

### Core Components

**Server Side (`server/`)**
- `server.js` - Express server with WebSocket support, session management
- `action-handlers.js` - Generic action handlers and panel builders
- `apps/` - Application-specific handlers (dream.js, trek.js)
- Uses instance-based session state with format `instance:app`

**Client Side (`client/`)**
- `app.js` - Main application entry point with command handlers
- `server-connection.js` - WebSocket client with auto-reconnect
- `template-service.js` - HTML template loading and rendering
- `layout-service.js` - Panel layout management
- `common-command-handlers.js` - Shared command processing

### Communication Protocol

The system uses an asymmetric protocol:
- **Client → Server**: Actions (user interactions, navigation)
- **Server → Client**: Commands (display updates, panel changes)

Commands include: `show-panel`, `clear-panel`, `warn`, `log`, `show-status`
Actions include: `open-app`, `select-panel`, `open-panel`

### Template System

Templates are HTML files in `client/templates/` loaded dynamically:
- `dream-templates.html` - Dream app UI components
- `trek-templates.html` - Trek app components  
- `panel-templates.html` - Panel layout templates

Templates support data binding and click-actions for server communication.

### Session Management

- Instance-based sessions with format: `session-{random}:appname`
- Server maintains session state per instance
- WebSocket connections mapped to instances
- Apps can be dynamically loaded from `server/apps/`

### Development Notes

- Frontend connects to `localhost:3000` in development, Railway app in production
- Server supports CORS and handles multiple concurrent sessions
- Template development service available for live template testing
- Use browser dev tools to debug WebSocket communication