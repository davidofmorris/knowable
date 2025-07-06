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
  const instance = req.headers['instance'] || req.query.instance || 'default';
  
  // Initialize session state if it doesn't exist
  if (!sessionStates.has(instance)) {
    sessionStates.set(instance, {"instance": instance});
  }
  
  req.sessionState = sessionStates.get(instance);
  next();
});

//
// generic command factories
//
function warn(message) {
  return {
    command: "warn",
    message: message,
  }
}

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
  const instance = req.headers['instance'] || req.query.instance || 'default';
  return {
    name: 'Knowable Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    instance: instance
  }
}

app.get('/status', (req, res) => { res.json(statusResponse(req)); });
app.get('/api/status', (req, res) => { res.json(statusResponse(req)); });

// Fallback handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).send('Sorry, the page you are looking for does not exist.');
});

//
// Server interface
//
const handlers = require('./action-handlers');

//
// http server interface
//
app.get('/api/server', (req, res) => {
  const action = req.query.action;
  if (!action) {
    res.json( [warn('No action parameter.')] );
    return;
  }

  const handler = handlers[action];
  if (!handler) {
    res.json( [warn(`No handler for action: ${action}.`)] );
    return;
  }

  res.json(handler(req, res));
});

//
// WebSocket server interface
//
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log('WebSocket connection established');
  
  // Extract instance ID from query params or headers
  const url = new URL(req.url, `http://${req.headers.host}`);
  const instance = url.searchParams.get('instance') || req.headers['instance'] || 'default';
  
  // Initialize session state if it doesn't exist
  if (!sessionStates.has(instance)) {
    sessionStates.set(instance, {"instance": instance});
  }
  
  // Store WebSocket connection
  wsConnections.set(instance, ws);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      const { action, ...actionData } = data;
      
      if (!action) {
        ws.send(JSON.stringify( [warn('No action parameter.')] ));
        return;
      }
      
      // Create mock req/res objects to reuse existing handlers
      const mockReq = {
        query: { action, ...actionData },
        sessionState: sessionStates.get(instance)
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
      ws.send(JSON.stringify( [warn('Invalid message format.')] ));
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    wsConnections.delete(instance);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    wsConnections.delete(instance);
  });
});

// Handle WebSocket actions using action handlers
function handleWebSocketAction(req, res, action) {
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
