const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Session state storage
const sessionStates = new Map();
const wsConnections = new Map(); // Map instance IDs to WebSocket connections

// Middleware
app.use(cors());
app.use(express.json());

// Session middleware - extract instance header
app.use((req, res, next) => {
  const instanceId = req.headers['instance'] || 'default';
  
  // Initialize session state if it doesn't exist
  if (!sessionStates.has(instanceId)) {
    sessionStates.set(instanceId, {"instanceId": instanceId});
  }
  
  req.sessionState = sessionStates.get(instanceId);
  next();
});

//
// Server interface
//
const serverRouter = require('./routes/server-router');
app.use('/api/server', serverRouter);

// 
// help
//
function helpResponse() {
  return {
    name: 'Knowable Server',
    version: '1.0.0',
    description: 'Knowable graph explorer backend',
    endpoints: {
      about: '/',
      help: '/help',
      about: '/status',
      server: '/api/server'
    }
  }
}

app.get('/', (req, res) => { res.json(helpResponse()); });
app.get('/help', (req, res) => { res.json(helpResponse()); });
app.get('/api', (req, res) => { res.json(helpResponse()); });
app.get('/api/help', (req, res) => { res.json(helpResponse()); });

//
// status
//
function statusResponse(req) {
  const instanceId = req.headers['instance'] || 'default';
  return {
    name: 'Knowable Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    instance: instanceId
  }
}

app.get('/status', (req, res) => { res.json(statusResponse(req)); });
app.get('/api/status', (req, res) => { res.json(statusResponse(req)); });

// Fallback handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).send('Sorry, the page you are looking for does not exist.');
});


// WebSocket server setup
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log('WebSocket connection established');
  
  // Extract instance ID from query params or headers
  const url = new URL(req.url, `http://${req.headers.host}`);
  const instanceId = url.searchParams.get('instance') || req.headers['instance'] || 'default';
  
  // Initialize session state if it doesn't exist
  if (!sessionStates.has(instanceId)) {
    sessionStates.set(instanceId, {});
  }
  
  // Store WebSocket connection
  wsConnections.set(instanceId, ws);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      const { action, ...actionData } = data;
      
      if (!action) {
        ws.send(JSON.stringify([{ command: 'warn', message: 'No action parameter.' }]));
        return;
      }
      
      // Create mock req/res objects to reuse existing handlers
      const mockReq = {
        query: { action, ...actionData },
        instance: instanceId,
        sessionState: sessionStates.get(instanceId)
      };
      
      const mockRes = {
        json: (commands) => {
          ws.send(JSON.stringify(commands));
        }
      };
      
      // Handle the WebSocket action using existing handlers
      handleWebSocketAction(mockReq, mockRes, action);
      
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify([{ command: 'warn', message: 'Invalid message format.' }]));
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    wsConnections.delete(instanceId);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    wsConnections.delete(instanceId);
  });
});

// Handle WebSocket actions by reusing server router logic
function handleWebSocketAction(req, res, action) {
  // Import and call the action handlers directly
  const serverRouterHandlers = require('./routes/server-router');
  
  // Create handlers map that mirrors server-router.js
  const handlers = {
    "show-app": serverRouterHandlers.onShowApp,
    "refresh-perspective-list": serverRouterHandlers.onRefreshPerspectiveList,
    "select-perspective": serverRouterHandlers.onSelectPerspective
  };
  
  const handler = handlers[action];
  if (!handler) {
    res.json([{ command: 'warn', message: `No handler for action: ${action}.` }]);
    return;
  }
  
  const commands = handler(req, res);
  res.json(commands);
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});