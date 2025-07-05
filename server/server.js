const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Session state storage
const sessionStates = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Session middleware - extract instance header
app.use((req, res, next) => {
  const instanceId = req.headers['instance'] || 'default';
  req.instance = instanceId;
  
  // Initialize session state if it doesn't exist
  if (!sessionStates.has(instanceId)) {
    sessionStates.set(instanceId, {});
  }
  
  req.sessionState = sessionStates.get(instanceId);
  next();
});

// Routes
app.get('/api/hello', (req, res) => {
  res.json({ 
    message: 'Hello from your knowledge graph backend!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    instance: req.instance
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    instance: req.instance
  });
});

// Import routes
const perspectiveRoutes = require('./routes/perspectives');
app.use('/api/perspectives', perspectiveRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Knowable API',
    version: '1.0.0',
    description: 'Knowledge graph explorer backend',
    endpoints: {
      hello: '/api/hello',
      health: '/api/health',
      perspectives: '/api/perspectives'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});