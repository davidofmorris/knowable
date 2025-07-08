# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Knowable is a knowledge graph explorer built with a split-stack architecture:
- **Backend**: Node.js/Express/WebSocket server (Railway deployment)
- **Frontend**: Static HTML/JS (GitHub Pages)
- **Communication**: WebSocket-first with real-time bidirectional messaging
- **Philosophy**: Server-driven architecture with client as "display device"

## Architecture

### Backend Structure (`server/`)
- `server.js`: Main Express server with CORS, JSON middleware, session management, and action-command protocol routing
- `action-handlers.js`: Action-command protocol implementation with perspective data and business logic
- Session state management using instance headers for stateful client-server interactions

### Frontend Structure (`docs/`)
- `index.html`: Main UI with real-time API integration and testing
- `app.js`: Client-side logic with action-command protocol implementation
- Responsive design with status indicators and backend connection testing

### Session Management
- Server maintains separate state objects for each client session
- Sessions identified by instance headers sent from client
- Action-command protocol enables stateful interactions between client and server
- WebSocket connections maintain persistent session state with automatic reconnection

## Development Commands

### Recommended Development Setup
```bash
./start-dev.sh       # Start all development servers (backend, frontend, test)
```

This development script launches three servers simultaneously:
- **Backend server** (port 3000) - Main API server
- **Frontend server** (port 8080) - Static file server for the client  
- **Test server** (port 8081) - Automated API testing with JSON results

## API Endpoints

- `GET /` - API information and available endpoints
- `GET /help` - API information and available endpoints
- `GET /status` - Server status with uptime and instance support
- `GET /api/server` - Action-command protocol endpoint (WebSocket primary, HTTP fallback)

## Action-Command Protocol

The server implements an action-command protocol where:
- Client sends actions to the server via WebSocket messages
- Server processes actions in the context of the session state
- Server responds with an array of commands for the client to execute

### Available Actions
- `show-app` - Initialize application and load default perspective list
- `refresh-perspective-list` - Request updated perspective list
- `select-perspective` - Select a specific perspective by ID

### Command Types
- `show-status` - Display connection status and instance information
- `show-perspective-list` - Display available perspectives
- `show-perspective` - Display selected perspective details
- `clear-perspective` - Clear current perspective
- `warn` - Display warning message

## Frontend-Backend Integration

- **WebSocket-First Communication**: Primary communication via WebSocket with automatic reconnection
- **Environment Detection**: Automatically switches between local (`ws://localhost:3000`) and production (`wss://knowable-api.up.railway.app`) WebSocket URLs
- **Action-Command Protocol**: Client sends actions via WebSocket messages
- **Session Management**: Instance headers maintain separate server state for each client session
- **Connection Status Monitoring**: Real-time WebSocket connection status with error handling
- **Real-time Bidirectional Communication**: Server can push updates to client without request

## Deployment

- **Backend**: Railway auto-deployment from GitHub
- **Frontend**: GitHub Pages from `docs/` folder at https://davidofmorris.github.io/knowable/
- Environment variables: `NODE_ENV`, `PORT`
- Node.js version: >=18.0.0

## Key Files for Architecture Understanding

- `server/action-handlers.js:5-50` - Sample perspective data and action handlers
- `server/action-handlers.js:75-150` - Action handler implementations
- `server/server.js:15-27` - Session management middleware
- `server/server.js:35-55` - Action-command protocol routing
- `docs/app.js` - Client-side API integration and testing interface
- `docs/index.html` - Main UI with real-time backend integration