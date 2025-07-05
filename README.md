# Knowable - Knowledge Graph Explorer

A fractal, hierarchical knowledge graph explorer built with Node.js and vanilla JavaScript, designed around the principles of structured identity and perspective mapping.

## Architecture

- **Backend**: Node.js + Express (Railway deployment)
- **Frontend**: Static HTML/JS (GitHub Pages)
- **Philosophy**: Server-driven architecture with client as "display device"

## Project Structure

```
knowable/
├── docs/           # GitHub Pages frontend
│   ├── index.html  # Main application interface
│   └── app.js      # Client-side logic
├── server/         # Node.js backend
│   ├── server.js   # Express server
│   ├── package.json
│   └── routes/     # API endpoints
│       └── server-router.js
├── test/           # Test infrastructure
│   ├── test-server.js
│   └── package.json
├── notes/          # Project documentation
│   ├── Phase2.md
│   └── A Normative Ontology.md
├── start-dev.sh    # Development script
├── LICENSE
└── README.md
```

## Quick Start

### Local Development

**Recommended**: Use the development script to start all servers:
```bash
./start-dev.sh
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

## Development Infrastructure

The project includes a comprehensive development setup with multi-server architecture:

### Development Script
```bash
./start-dev.sh
```
This script launches three servers simultaneously:
- **Backend server** (port 3000) - Main API server
- **Frontend server** (port 8080) - Static file server for the client
- **Test server** (port 8081) - Automated API testing with JSON results

### Session Management
The backend implements instance-based session management:
- Sessions are identified by instance headers
- Server maintains state objects for each active session
- Action-command protocol enables stateful interactions

### Testing
- Automated test suite runs on port 8081
- Tests cover the action-command protocol extensively
- JSON test results available at test server endpoints

## API Endpoints

- `GET /` - Server information and available endpoints
- `GET /api/hello` - Hello world with timestamp and instance support
- `GET /api/health` - Health check with uptime and instance support
- `GET /api/server` - Action-command protocol endpoint (accepts action query parameters)

## Features

- **Action-Command Protocol**: Stateful client-server interactions using query parameters
- **Instance-Based Sessions**: Server maintains separate state objects for each client session
- **Multi-Server Development**: Integrated backend, frontend, and test servers
- **Real-time API Integration**: Frontend dynamically communicates with backend
- **Comprehensive Testing**: Automated test suite with JSON results
- **Railway Ready**: Configured for one-click deployment

## Philosophy

Based on the normative ontology framework, this application explores:
- Structured identity (center, mind, boundary)
- Perspective mapping across aspirational, operational, and foundational levels
- Information substrate theory applied to knowledge representation

For comprehensive documentation of the philosophical foundations and project evolution, see the `notes/` directory:
- `A Normative Ontology.md` - Core philosophical framework
- `Phase2.md` - Project evolution and architectural design goals

## Next Steps

1. **WebSocket Implementation**: Add real-time bidirectional communication (see Phase2.md)
2. **Enhanced Action-Command Protocol**: Expand command types and client-side command processing
3. **Persistence Layer**: Add database integration for session state persistence
4. **Advanced Knowledge Graph Features**: Implement graph traversal and visualization
5. **User Authentication**: Add secure user sessions and data isolation
