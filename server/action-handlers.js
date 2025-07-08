// Sample panel data
const samplePanels = [
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
  "refresh-panel-list": onRefreshPanelList,
  "select-panel": onSelectPanel
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

function showPanelListCommand(list) {
  return {
    command: "show-panel-list",
    panels: list,
    count: list.length
  }  
}

function clearPanelCommand() {
  return {
    command: "clear-panel"
  }
}

function showPanelCommand(panel) {
  return {
    command: "show-panel",
    panel: panel
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
  commands.push(showPanelListCommand(samplePanels));

  const panelId = state.activePanelId;
  var panel; 
  if (panelId) {
    panel = findPanel(panelId);
  }

  if (panel) {
    commands.push(showPanelCommand(panel));
  } else {
    commands.push(clearPanelCommand());
  }

  return commands;
}

function onRefreshPanelList(_req) {
  // on: refresh-panel-list
  const commands = [];
  commands.push(showPanelListCommand(samplePanels));
  return commands;
}

function onSelectPanel(req) {
  // on: select-panel (id)
  const commands = [];
  const state = req.sessionState;
  const id = req.query.id || 0; // return top item if none is specified
  const panel = findPanel(id);

  if (!panel) {
    state.activePanelId = -1;
    commands.push(warn(`Panel ${id} not found.`));
    commands.push(clearPanelCommand());
    commands.push(showPanelListCommand(samplePanels));
  } else {
    state.activePanelId = id;
    commands.push(showPanelCommand(panel));
  }

  return commands;
}

function findPanel(id) {
  return samplePanels.find(p => p.id === id);
}

module.exports = {
  handlers: handlers
};