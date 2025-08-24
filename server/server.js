const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

// Import template development service
const templateDevService = require('./template-dev-handler');

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Session state storage
const sessionStates = new Map();
const wsConnections = new Map(); // Map instance IDs to WebSocket connections
const appHandlers = new Map(); // Cache for dynamically loaded app handlers

// Middleware
app.use(cors());
app.use(express.json());

// Parse instance:app format
function parseInstanceApp(instanceString) {
  const parts = instanceString.split(':');
  return {
    instance: parts[0] || 'default',
    app: parts[1] || 'default'
  };
}

// Session middleware - extract instance header and parse app
app.use((req, res, next) => {
  const instanceString = req.headers['instance'] || req.query.instance || 'default';
  const { instance, app } = parseInstanceApp(instanceString);
  
  // Initialize session state if it doesn't exist
  if (!sessionStates.has(instance)) {
    sessionStates.set(instance, {
      "instance": instance,
      "apps": new Map()
    });
  }
  
  const sessionState = sessionStates.get(instance);
  
  // Initialize app state if it doesn't exist
  if (!sessionState.apps.has(app)) {
    sessionState.apps.set(app, {
      "app": app,
      "state": {}
    });
  }
  
  req.sessionState = sessionState;
  req.appState = sessionState.apps.get(app);
  req.instance = instance;
  req.app = app;
  next();
});

// Parameter normalization middleware - merge query params and body into req.data
app.use((req, res, next) => {
  const data = {};
  
  // Start with POST body data (if any)
  if (req.body && typeof req.body === 'object') {
    Object.assign(data, req.body);
  }
  
  // Add URL query parameters
  if (req.query && typeof req.query === 'object') {
    for (const [key, value] of Object.entries(req.query)) {
      if (key.includes('.')) {
        // Split key on '.' to create nested object structure
        const keys = key.split('.');
        let current = data;
        
        // Navigate/create nested structure for all but the last key
        for (let i = 0; i < keys.length - 1; i++) {
          const nestedKey = keys[i];
          if (!current[nestedKey] || typeof current[nestedKey] !== 'object') {
            current[nestedKey] = {};
          }
          current = current[nestedKey];
        }
        
        // Set the final value
        current[keys[keys.length - 1]] = value;
      } else {
        data[key] = value;
      }
    }
  }
  
  // Add call-method parameter for troubleshooting
  data['call-method'] = req.method;
  
  req.data = data;
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

function debug(data) {
  return {
    command: "debug",
    data: data,
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

// template-dev-service
templateDevService.setupRoutes(app);

//
// Server interface
//
const defaultHandlers = require('./action-handlers').handlers;

// Dynamic app handler loading
function loadAppHandlers(appName) {
  if (appHandlers.has(appName) || appName === 'default') {
    return appHandlers.get(appName);
  }
  
  try {
    const appModule = require(`./apps/${appName}.js`);
    const handlers = appModule.handlers || {};
    appHandlers.set(appName, handlers);
    console.log(`Loaded handlers for app: ${appName}`);
    return handlers;
  } catch (error) {
    console.warn("Unexpected error: " + error);
    console.log(`No custom handlers found for app: ${appName}, using defaults`);
    return {};
  }
}

// Get handlers for a specific app (with fallback to default)
function getHandlersForApp(appName) {
  const appSpecificHandlers = loadAppHandlers(appName);
  return { ...defaultHandlers, ...appSpecificHandlers };
}

//
// http server interface
//
// Helper function to handle server requests (GET/POST agnostic)
function handleServerRequest(req, res) {
  const action = req.data.action;
  if (!action) {
    res.json( [warn('No action parameter.')] );
    return;
  }

  const handlers = getHandlersForApp(req.app);
  const handler = handlers[action];
  if (!handler) {
    res.json( [warn(`No handler for action: ${action} in app: ${req.app}.`)] );
    return;
  }

  const commands = handler(req);
  // Add debug information about the normalized data
  if ('debug' in req.data) {
      commands.push(debug(req.data));
  }
  res.json(commands);
}

app.get('/api/server', handleServerRequest);
app.post('/api/server', handleServerRequest);
app.put('/api/server', handleServerRequest);

// Serve client static files for app routes (CSS, JS, templates, etc.)
app.use('/apps', express.static('../client'));

// Serve unified index.html for app routes (after static files)
app.get('/apps/*', (req, res) => {
  res.sendFile(__dirname + '/apps/index.html');
});

// Serve static files from public directory
app.use(express.static('public'));

// Fallback handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).send('Sorry, the page you are looking for does not exist.');
});

//
// WebSocket server interface
//
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log('WebSocket connection established');
  
  // Extract instance ID from query params or headers
  const url = new URL(req.url, `http://${req.headers.host}`);
  const instanceString = url.searchParams.get('instance') || req.headers['instance'] || 'default';
  const { instance, app } = parseInstanceApp(instanceString);
  
  // Initialize session state if it doesn't exist
  if (!sessionStates.has(instance)) {
    sessionStates.set(instance, {
      "instance": instance,
      "apps": new Map()
    });
  }
  
  const sessionState = sessionStates.get(instance);
  
  // Initialize app state if it doesn't exist
  if (!sessionState.apps.has(app)) {
    sessionState.apps.set(app, {
      "app": app,
      "state": {}
    });
  }
  
  // Store WebSocket connection
  wsConnections.set(instanceString, ws);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      const action = data.action;
      
      if (!action) {
        ws.send(JSON.stringify( [warn('No action parameter.')] ));
        return;
      }
      
      // Create mock req/res objects to reuse existing handlers
      const mockReq = {
        data: data,
        sessionState: sessionState,
        appState: sessionState.apps.get(app),
        instance: instance,
        app: app
      };
      
      const mockRes = {
        json: (commands) => {
          ws.send(JSON.stringify(commands));
        }
      };
      
      // Handle the WebSocket action using existing handlers
      handleWebSocketAction(mockReq, mockRes, action, app);
      
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify( [warn('Invalid message format.')] ));
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    wsConnections.delete(instanceString);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    wsConnections.delete(instanceString);
  });
});

// Handle WebSocket actions using action handlers
function handleWebSocketAction(req, res, action, appName) {
  const handlers = getHandlersForApp(appName);
  const handler = handlers[action];
  if (!handler) {
    res.json([{ command: 'warn', message: `No handler for action: ${action} in app: ${appName}.` }]);
    console.log(`No handler for action: ${action} in app: ${appName}. ` + JSON.stringify(req.data));
    return;
  }
  
  const commands = handler(req);
  res.json(commands);
}

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);

  // Initialize template development service
  console.log("Initializing templateDevService...");
  await templateDevService.init();
});

// Graceful shutdown handling
let isShuttingDown = false;

function gracefulShutdown(signal) {
  if (isShuttingDown) {
    console.log('Force shutdown');
    process.exit(1);
  }

  isShuttingDown = true;
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  // Close HTTP server (stops accepting new connections)
  server.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }

    console.log('HTTP server closed');

    // Close all WebSocket connections
    console.log(`Closing ${wsConnections.size} WebSocket connections...`);
    wsConnections.forEach((ws, instanceString) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1001, 'Server shutting down');
      }
    });
    wsConnections.clear();

    // Cleanup template dev service if needed
    if (templateDevService.cleanup) {
      templateDevService.cleanup();
    }

    console.log('Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after timeout
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

// Listen for shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});
