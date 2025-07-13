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

function showPanelCommand(steps) {
  return {command:'show-panel', steps:steps};
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
  const steps = [];
  
  // focus flow
  steps.push({template:'directory-focus-left', data:panel, flow:'inside-top-left'});
  steps.push({template:'directory-focus-right', data:panel, flow:'inside-top-right'});

  // sub-directories
  const subDirLinks = sampleGraph.getLinks(panel.id, 'sub-directory');
  for (const link of subDirLinks) {
    steps.push({template:'link', data:link, flow:'inside-left-lower'});
  }

  // parent directories
  const ancestors = [];
  let pLink = sampleGraph.getLink(panel.id, 'parent-directory');
  while (pLink) {
    ancestors.push({template:'link', data:pLink, flow:'outside-left-upper'});
    pLink = sampleGraph.getLink(pLink.to, 'parent-directory');
  }
  while (ancestors.length > 0) {
    steps.push(ancestors.pop());
  }

  // files (mock)
  for (var i = 0; i < 7; i++) {
    steps.push({template:'file-link', data:{filename:`file_${i}.txt`}, flow:'inside-focus'});
  }
  commands.push(showPanelCommand(steps));
}

module.exports = {
  handlers: handlers
};