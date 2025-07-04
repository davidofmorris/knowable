const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/hello', (req, res) => {
  res.json({ 
    message: 'Hello from your knowledge graph backend!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
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