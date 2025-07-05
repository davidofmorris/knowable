# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Knowable is a knowledge graph explorer built with a split-stack architecture:
- **Backend**: Node.js/Express server (Railway deployment)
- **Frontend**: Static HTML/JS (GitHub Pages)
- **Philosophy**: Server-driven architecture with client as "display device"

The application is based on a normative ontology framework exploring structured identity (center, mind, boundary) and perspective mapping across aspirational, operational, and foundational levels.

## Architecture

### Backend Structure (`server/`)
- `server.js`: Main Express server with CORS, JSON middleware, session management, and route mounting
- `routes/server-router.js`: Action-command protocol implementation with perspective data
- Session state management using instance headers for stateful client-server interactions

### Frontend Structure (`docs/`)
- `index.html`: Main UI with real-time API integration and testing
- `app.js`: Client-side logic with action-command protocol implementation
- Responsive design with status indicators and backend connection testing

### Session Management
- Server maintains separate state objects for each client session
- Sessions identified by instance headers sent from client
- Action-command protocol enables stateful interactions between client and server

## Development Commands

### Recommended Development Setup
```bash
./start-dev.sh       # Start all development servers (backend, frontend, test)
```

This development script launches three servers simultaneously:
- **Backend server** (port 3000) - Main API server
- **Frontend server** (port 8080) - Static file server for the client  
- **Test server** (port 8081) - Automated API testing with JSON results

### Manual Development Setup

#### Backend Development
```bash
cd server
npm install          # Install dependencies
npm run dev          # Start with nodemon (development)
npm start           # Start production server
```

#### Frontend Development
```bash
cd docs
serve -p 8080        # Serve static files locally
```

#### Test Server
```bash
cd test
npm install          # Install dependencies
npm start           # Start test server
```

## API Endpoints

- `GET /` - API information and available endpoints
- `GET /api/hello` - Hello world with timestamp and instance support
- `GET /api/health` - Server health check with uptime and instance support
- `GET /api/server` - Action-command protocol endpoint (accepts action query parameters)

## Action-Command Protocol

The server implements an action-command protocol where:
- Client sends actions via query parameters to `/api/server?action=<action-name>`
- Server processes actions in the context of the session state
- Server responds with an array of commands for the client to execute

### Available Actions
- `refresh-perspective-list` - Request updated perspective list
- `select-perspective` - Select a specific perspective by ID

### Command Types
- `show-perspective-list` - Display available perspectives
- `show-perspective` - Display selected perspective details
- `clear-perspective` - Clear current perspective
- `warn` - Display warning message

## Frontend-Backend Integration

- Client determines API URL based on hostname (localhost vs deployed)
- **API URL Configuration**: Production backend URL set to `https://knowable-api.up.railway.app`
- **Environment Detection**: Automatically switches between local (`http://localhost:3000`) and production URLs
- **Action-Command Protocol**: Client sends actions via query parameters, server responds with command arrays
- **Session Management**: Instance headers maintain separate server state for each client session
- Connection status monitoring with error handling
- Real-time API response display and testing interface

## Deployment

- **Backend**: Railway auto-deployment from GitHub
- **Frontend**: GitHub Pages from `docs/` folder at https://davidofmorris.github.io/knowable/
- Environment variables: `NODE_ENV`, `PORT`
- Node.js version: >=18.0.0

## Key Files for Architecture Understanding

- `server/routes/server-router.js:5-50` - Sample perspective data and action handlers
- `server/routes/server-router.js:119-133` - Action-command protocol implementation
- `server/server.js:15-27` - Session management middleware
- `server/server.js:50-52` - Route mounting pattern
- `docs/app.js` - Client-side API integration and testing interface
- `docs/index.html` - Main UI with real-time backend integration