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
// generic command factories
//
function warn(message) {
  return {
    command: "warn",
    message: message,
  }
}

//
// server command factories
//
function showStatusCommand(instance) {
  return {
    command: "show-status",
    instance: instance
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
function onShowApp(req) {
  // on: show-app
  const commands = [];
  const state = req.sessionState;

  commands.push(showStatusCommand(state.instance));
  commands.push(showPerspectiveListCommand(samplePerspectives));

  const perspectiveId = state.activePerspectiveId;
  var perspective; 
  if (perspectiveId) {
    perspective = findPerspective(perspectiveId);
  }

  if (perspective) {
    commands.push(showPerspectiveCommand(perspective));
  } else {
    commands.push(clearPerspectiveCommand());
  }

  return commands;
}

function onRefreshPerspectiveList(_req) {
  // on: refresh-perspective-list
  const commands = [];
  commands.push(showPerspectiveListCommand(samplePerspectives));
  return commands;
}

function onSelectPerspective(req) {
  // on: select-perspective (id)
  const commands = [];
  const state = req.sessionState;
  const id = req.query.id || 0; // return top item if none is specified
  const perspective = findPerspective(id);

  if (!perspective) {
    state.activePerspectiveId = -1;
    commands.push(warn(`Perspective ${id} not found.`));
    commands.push(clearPerspectiveCommand());
    commands.push(showPerspectiveListCommand(samplePerspectives));
  } else {
    state.activePerspectiveId = id;
    commands.push(showPerspectiveCommand(perspective));
  }

  return commands;
}

function findPerspective(id) {
  return samplePerspectives.find(p => p.id === id);
}

module.exports = {
  handlers: handlers
};