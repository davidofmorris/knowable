// Load sample panel data
const sampleGraph = require('./sample-graph-2.js');

// action -> handler map
const handlers = {
  "show-app": onShowApp,
  "select-panel": onSelectPanel
};

const panelBuilders = {
  "card": buildCard,
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
  if (!builder) {
    const message = "No panel builder registered: " + panel.kind;
    console.warn(message);
    commands.push({command:'warn', message:message});
  } else {
    builder(commands, panel);
  }

  return commands;
}

function buildCard(commands, panel) {
  commands.push(log('building showPanel command for ' + panel.kind + ": " + panel.name));
  const steps = [];
  
  // focus flow
//  steps.push({template:'card-focus', data:panel, flow:'inside-top-center'});
  steps.push({template:'title-1', data:{title:panel.name}, flow:'inside-top-center'});
  steps.push({template:'content-html', data:panel, flow:'inside-focus'});
  steps.push({template:'centered-text-1', data:{text:panel.description}, flow:'inside-bottom-center'});

  // child-card
  const subDirLinks = sampleGraph.getLinks(panel.id, 'child-card');
  for (const link of subDirLinks) {
    steps.push({template:'link', data:link, flow:'inside-right-middle'});
  }

  // parent-card
  followLinks(panel.id,'parent-card','outside-left-upper',steps);

  // directory
  followLinks(panel.id,'directory','outside-right-lower',steps);
  commands.push(showPanelCommand(steps));
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
  followLinks(panel.id,'parent-directory','outside-left-upper',steps);

  // cards
  followLinks(panel.id,'parent-card','outside-left-lower',steps);

  // files (mock)
  for (var i = 0; i < 7; i++) {
    steps.push({template:'file-link', data:{filename:`file_${i}.txt`}, flow:'inside-focus'});
  }
  commands.push(showPanelCommand(steps));
}

function followLinks(from,linkType,flow,steps) {
  const stack = [];
  let pLink = sampleGraph.getLink(from, linkType);
  while (pLink) {
    stack.push({template:'link', data:pLink, flow:flow});
    pLink = sampleGraph.getLink(pLink.to, linkType);
  }
  while (stack.length > 0) {
    steps.push(stack.pop());
  }
}

module.exports = {
  handlers: handlers
};