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
- `server.js`: Main Express server with CORS, JSON middleware, and route mounting
- `routes/perspectives.js`: API endpoints for perspective data management
- Sample perspective data structure follows 3x3 grid pattern (aspirational/operational/foundational × back/center/front)

### Frontend Structure (`docs/`)
- `index.html`: Main UI with perspective map visualization (CSS Grid 3x3)
- `app.js`: Client-side logic with API integration and dynamic perspective loading
- Responsive design with status indicators and real-time backend connection testing

## Development Commands

### Backend Development
```bash
cd server
npm install          # Install dependencies
npm run dev          # Start with nodemon (development)
npm start           # Start production server
```

### Frontend Development
Open `docs/index.html` directly in browser or serve locally.

## API Endpoints

- `GET /` - API information and available endpoints
- `GET /api/hello` - Hello world with timestamp and environment
- `GET /api/health` - Server health check with uptime
- `GET /api/perspectives` - List all available perspectives
- `GET /api/perspectives/:id` - Get specific perspective by ID

## Perspective Data Structure

Each perspective follows this schema:
```javascript
{
  id: string,
  name: string,
  description: string,
  map: {
    aspirational: { back: string, center: string, front: string },
    operational: { back: string, center: string, front: string },
    foundational: { back: string, center: string, front: string }
  }
}
```

## Frontend-Backend Integration

- Client determines API URL based on hostname (localhost vs deployed)
- **API URL Configuration**: Production backend URL set to `https://knowable-api.up.railway.app`
- **Environment Detection**: Automatically switches between local (`http://localhost:3000`) and production URLs
- Dynamic perspective loading updates 3x3 CSS grid visualization
- Connection status monitoring with error handling
- Real-time API response display

## Deployment

- **Backend**: Railway auto-deployment from GitHub
- **Frontend**: GitHub Pages from `docs/` folder at https://davidofmorris.github.io/knowable/
- Environment variables: `NODE_ENV`, `PORT`
- Node.js version: >=18.0.0

## Key Files for Architecture Understanding

- `server/routes/perspectives.js:5-50` - Sample perspective data structure
- `docs/app.js:69-85` - Perspective map rendering logic
- `docs/index.html:40-55` - CSS Grid perspective visualization
- `server/server.js:29-31` - Route mounting pattern