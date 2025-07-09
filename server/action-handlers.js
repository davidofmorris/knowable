// Load sample panel data
const sampleGraph = require('./sample-graph.js');

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

// depricated
function showPanelListCommand() {
  return {
    command: "show-panel-list",
    panels: [sampleGraph.root],
    count: 1
  }  
}

function clearPanelCommand() {
  return {
    command: "clear-panel"
  }
}

function showPanelCommand(panel, links) {
  return {
    command: "show-panel",
    panel: panel,
    links: links
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
  commands.push(showPanelListCommand());

  const panelId = state.activePanelId;
  var panel; 
  if (panelId) {
    panel = findPanel(panelId);
  }
  if (!panel) {
    panel = sampleGraph.root;
  }

  if (panel) {
    const links = sampleGraph.getLinks(panel);
    commands.push(showPanelCommand(panel, links));
  } else {
    commands.push(clearPanelCommand());
  }

  return commands;
}

function onRefreshPanelList(_req) {
  // on: refresh-panel-list
  const commands = [];
  commands.push(showPanelListCommand());
  return commands;
}

function onSelectPanel(req) {
  // on: select-panel (id)
  const commands = [];
  const state = req.sessionState;
  const panelId = req.data['panel-id'] || req.data.id || sampleGraph.root; // return root panel if none is specified
  const panel = findPanel(panelId);

  if (!panel) {
    state.activePanelId = -1;
    commands.push(warn(`Panel ${panelId} not found.`));
    commands.push(clearPanelCommand());
    commands.push(showPanelListCommand());
  } else {
    state.activePanelId = panelId;
    const links = sampleGraph.getLinks(panel);
    commands.push(showPanelCommand(panel, links));
  }

  return commands;
}

function findPanel(id) {
  return sampleGraph.getPanel(id);
}

module.exports = {
  handlers: handlers
};