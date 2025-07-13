// Load sample panel data
const sampleGraph = require('./sample-graph.js');

// action -> handler map
const handlers = {
  "show-app": onShowApp,
  "select-panel": onSelectPanel
};

const panelBuilders = {
  "directory": buildDirectory,
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

function log(message) {
  return {
    command: "log",
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

  const panelId = state.activePanelId;
  var panel; 
  if (panelId) {
    panel = sampleGraph.getPanel(panelId);
  }
  if (!panel) {
    panel = sampleGraph.getRoot();
  }

  if (panel) {
    const builder = panelBuilders[panel.kind];
    builder(commands, panel);
  } else {
    commands.push(clearPanelCommand());
  }

  return commands;
}

function onSelectPanel(req) {
  // on: select-panel (id)
  const commands = [];
  const state = req.sessionState;
  const panelId = req.data['panel-id'] || req.data.id;
  const panel = sampleGraph.getPanel(panelId);

  if (!panel) {
    panelId = sampleGraph.rootId;
    panel - sampleGraph.getRoot();
  }

  state.activePanelId = panelId;

  // get builder for the selected panel
  const builder = panelBuilders[panel.kind];
  builder(commands, panel);

  return commands;
}

function buildDirectory(commands, panel) {
  commands.push(log('building showPanel command for ' + panel.kind + ": " + panel.name));
  const links = sampleGraph.getLinks(panel);

  const steps = [];
  steps.push({template:'directory', data:panel, flow:'inside-upper-left'});
  for (const link of links) {
    const flow = (link.kind === 'sub-directory') ? 'inside-lower-left' : 'outside-left-upper';
    steps.push({template:'link', data:link, flow:flow});
  }
  commands.push({command:'show-panel', steps:steps});
}

module.exports = {
  handlers: handlers
};