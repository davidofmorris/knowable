# Knowable - Graph Explorer

A visual graph explorer.

## Architecture

- **Backend**: Node.js + Express + WebSocket (Railway deployment)
- **Frontend**: Static HTML/JS (GitHub Pages)
- **Communication**: WebSocket-first with real-time bidirectional messaging
- **Philosophy**: Server-driven architecture with client as "display device"

## Project Structure

```
knowable/
├── client/                  # GitHub Pages frontend
│   ├── index.html         # Main application interface
│   └── app.js             # Client-side logic
├── server/                # Node.js backend
│   ├── server.js          # Express server
│   ├── action-handlers.js # Maps actions to handlers
│   ├── sample-graph.js    # Sample data
│   ├── package.json
├── test/                  # Test infrastructure
│   ├── test-server.js
│   └── package.json
├── services/              # Systemd service management
│   ├── systemd/           # Service definition files
│   ├── scripts/           # Management scripts
│   ├── install-services.sh
│   └── README.md
├── .github/workflows/     
│   ├── static.yml         # Publishes to GitHub Pages
├── LICENSE
└── README.md
```

## Quick Start

### Local Development

**Recommended**: Use systemd user services for managed service operation:
```bash
# Install services (one-time setup)
cd services
./install-services.sh

# Start all services
cd scripts
./start-all.sh
```

**Manual setup**:
1. **Backend**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd client
   serve -p 8080
   ```

3. **Test server** (optional):
   ```bash
   cd test
   npm install
   npm start
   ```

### Deployment

- **Backend**: Connect your GitHub repo to Railway for auto-deployment
- **Frontend**: Enable GitHub Pages on the `client/` folder

## Service Management

The project includes systemd user services for robust development infrastructure:

### Service Management
```bash
# Install services (one-time)
cd services && ./install-services.sh

# Manage all services
cd services/scripts
./start-all.sh    # Start all services
./stop-all.sh     # Stop all services
./status-all.sh   # Check service status
./restart-all.sh  # Restart all services
```

### Services
- **Backend service** (port 3000) - Main API server with WebSocket support
- **Frontend service** (port 8080) - Static file server for the client  
- **Test service** (port 8081) - Automated API testing with JSON results

### Session Management
The backend implements instance-based session management:
- Sessions are identified by instance headers
- Server maintains state objects for each active session
- Action-command protocol enables stateful interactions
- WebSocket connections maintain persistent session state with automatic reconnection

### Testing
- Automated test suite runs on port 8081
- Tests cover the action-command protocol extensively
- JSON test results available at test server endpoints

## API Endpoints

- `GET /` - Server information and available endpoints
- `GET /help` - Server information and available endpoints
- `GET /status` - Server status with uptime and instance support
- `GET /api/server` - Action-command protocol endpoint (WebSocket and HTTP support)

## Features

- **WebSocket Real-time Communication**: Primary communication protocol with automatic reconnection
- **Action-Command Protocol**: Stateful client-server interactions using WebSocket and HTTP
- **Instance-Based Sessions**: Server maintains separate state objects for each client session
- **Multi-Server Development**: Integrated backend, frontend, and test servers
- **Real-time API Integration**: Frontend dynamically communicates with backend via WebSocket
- **Comprehensive Testing**: Automated test suite with JSON results
- **Railway Ready**: Configured for one-click deployment

## Roadmap - View Model and Layout Strategy
The goal is a server-driven rendering system that will handle both textual state maps and visual layouts.
Key components include:

Core Architecture:
- Server maintains state objects for each session, expanding from static resources
- Application state includes a model of the client's active view (currently just panel ID)
- View objects emit client update commands when modified
- Multiple renderers for different formats: text (.md), data (.json), and HTML for web client

Client Model Concept:
- Server maintains a client model as a proxy for browser clients and other state change consumers
- Tree structure representing nested view components
- Panel-based organization where content is spatially arranged (inside/outside relationships)

View Layout System:
- Commands ordered by semantic relevance and coherence
- Focus elements arrive first, related clusters arrive together
- HTML client uses templates loaded as static resources with content data
- Detailed grid-based layout structure with outside/inside positioning flows in vertical and horizontal arrangements

The system aims to create a familiar tableau interface with dynamic content organization using spatial metaphors.

The general layout will be:
table:view-frame
   col:
      row:
         col: outside-left
            flow: outside,left,upper (vertical)
            flow: outside,left,lower (vertical)

         col: middle-stack
            row: outside-top
               flow: outside,top,left (horizontal)
               flow: outside,top,middle (horizontal)
               flow: outside,top,right (horizontal)
            row: inside-panel
               row:
                  flow: inside,left (vertical)
                  flow: inside,middle (vertical)
                  flow: inside,right (vertical)
               row:
                  flow: inside,bottom,left (horizontal)
                  flow: inside,bottom,middle (horizontal)
                  flow: inside,bottom,bottom (horizontal)

         col: outside-right
            flow: outside,right,upper
            flow: outside,right,lower
      row:
         flow: outside,bottom,left
         flow: outside,bottom,middle
         flow: outside,bottom,right
