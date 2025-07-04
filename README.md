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
│       └── perspectives.js
└── README.md
```

## Quick Start

### Local Development

1. **Backend**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Frontend**:
   Open `docs/index.html` in your browser or serve locally

### Deployment

- **Backend**: Connect your GitHub repo to Railway for auto-deployment
- **Frontend**: Enable GitHub Pages on the `docs/` folder

## API Endpoints

- `GET /` - API information
- `GET /api/hello` - Hello world endpoint
- `GET /api/health` - Health check
- `GET /api/perspectives` - List all perspectives
- `GET /api/perspectives/:id` - Get specific perspective

## Features

- **Perspective Maps**: 3x3 grid visualization of conceptual frameworks
- **Real-time API Integration**: Frontend dynamically loads data from backend
- **Responsive Design**: Works on desktop and mobile
- **Railway Ready**: Configured for one-click deployment

## Philosophy

Based on the normative ontology framework, this application explores:
- Structured identity (center, mind, boundary)
- Perspective mapping across aspirational, operational, and foundational levels
- Information substrate theory applied to knowledge representation

## Next Steps

1. Deploy backend to Railway
2. Enable GitHub Pages
3. Add more sophisticated perspective visualization
4. Implement graph traversal features
5. Add user authentication and data persistence
