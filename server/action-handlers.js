// Load sample panel data
const samplePanels = require('./sample-panels');

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
  const panelId = req.data['panel-id'] || req.data.id || samplePanels[0].id; // return first panel if none is specified
  const panel = findPanel(panelId);

  if (!panel) {
    state.activePanelId = -1;
    commands.push(warn(`Panel ${panelId} not found.`));
    commands.push(clearPanelCommand());
    commands.push(showPanelListCommand(samplePanels));
  } else {
    state.activePanelId = panelId;
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