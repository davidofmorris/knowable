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
├── docs/                  # GitHub Pages frontend
│   ├── index.html         # Main application interface
│   └── app.js             # Client-side logic
├── server/                # Node.js backend
│   ├── server.js          # Express server
│   ├── action-handlers.js # Maps actions to handlers
│   ├── package.json
├── test/                  # Test infrastructure
│   ├── test-server.js
│   └── package.json
├── services/              # Systemd service management
│   ├── systemd/           # Service definition files
│   ├── scripts/           # Management scripts
│   ├── install-services.sh
│   └── README.md
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
   cd docs
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
- **Frontend**: Enable GitHub Pages on the `docs/` folder

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
