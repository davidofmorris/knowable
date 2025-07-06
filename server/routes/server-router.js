const express = require('express');
const router = express.Router();

// Sample perspective data
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

// action -> handler map
const handlers = {
  "show-app": onShowApp,
  "refresh-perspective-list": onRefreshPerspectiveList,
  "select-perspective": onSelectPerspective
};

//
// command factories
//
function warn(message) {
  return {
    command: "warn",
    message: message,
  }
}

function showStatusCommand(instanceId) {
  return {
    command: "show-status",
    instanceId: instanceId
  }
}

function showPerspectiveListCommand(list) {
  return {
    command: "show-perspective-list",
    perspectives: list,
    count: list.length
  }  
}

function clearPerspectiveCommand() {
  return {
    command: "clear-perspective"
  }
}

function showPerspectiveCommand(perspective) {
  return {
    command: "show-perspective",
    perspective: perspective
  }
}

//
// action handlers
//
function onShowApp(req, res) {
  // on: show-app
  const commands = [];
  const state = req.sessionState;

  commands.push(showStatusCommand(state.instanceId));
  commands.push(clearPerspectiveCommand());
  commands.push(showPerspectiveListCommand(samplePerspectives));
  return commands;
}

function onRefreshPerspectiveList(req, res) {
  // on: refresh-perspective-list
  const commands = [];
  commands.push(showPerspectiveListCommand(samplePerspectives));
  return commands;
}

function onSelectPerspective(req, res) {
  // on: select-perspective (id)
  const commands = [];
  const id = req.query.id || 0; // return top item if none is specified
  const perspective = samplePerspectives.find(p => p.id === id);

  if (!perspective) {
    commands.push(warn(`Perspective ${id} not found.`));
    commands.push(clearPerspectiveCommand());
    commands.push(showPerspectiveListCommand(samplePerspectives));
  } else {
    commands.push(showPerspectiveCommand(perspective));
  }

  return commands;
}

//
// Handle action sent to the server endpoint
//
router.get('/', (req, res) => {
  const action = req.query.action;
  if (!action) {
    res.json( [warn('No action parameter.')] );
    return;
  }

  const handler = handlers[action];
  if (!handler) {
    res.json( [warn('No handler for action: ${action}.')] );
    return;
  }

  res.json(handler(req, res));
});

// Export handlers for WebSocket reuse
module.exports = router;
module.exports.onShowApp = onShowApp;
module.exports.onRefreshPerspectiveList = onRefreshPerspectiveList;
module.exports.onSelectPerspective = onSelectPerspective;