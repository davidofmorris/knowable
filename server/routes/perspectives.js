const express = require('express');
const router = express.Router();

// Sample perspective data based on your ontology
const samplePerspectives = [
  {
    id: 'project-explorer',
    name: 'Project Explorer',
    description: 'Visualize and explore project structure',
    map: {
      aspirational: {
        back: 'assumptions',
        center: 'purpose', 
        front: 'vision'
      },
      operational: {
        back: 'capabilities',
        center: 'activity',
        front: 'objective'
      },
      foundational: {
        back: 'architecture',
        center: 'platform',
        front: 'context'
      }
    }
  },
  {
    id: 'knowledge-graph',
    name: 'Knowledge Graph',
    description: 'Navigate semantic relationships',
    map: {
      aspirational: {
        back: 'understanding',
        center: 'connection',
        front: 'insight'
      },
      operational: {
        back: 'exploration',
        center: 'discovery',
        front: 'synthesis'
      },
      foundational: {
        back: 'information',
        center: 'structure',
        front: 'meaning'
      }
    }
  }
];

// Get all perspectives
router.get('/', (req, res) => {
  res.json({
    perspectives: samplePerspectives,
    count: samplePerspectives.length
  });
});

// Get specific perspective
router.get('/:id', (req, res) => {
  const perspective = samplePerspectives.find(p => p.id === req.params.id);
  if (!perspective) {
    return res.status(404).json({ error: 'Perspective not found' });
  }
  res.json(perspective);
});

module.exports = router;