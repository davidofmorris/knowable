// Dependencies
import templateService from './template-service.js';
import layoutService from './layout-service.js';
import resizeService from './resize-service.js';
import gridService from './grid-service.js';
import serverConnection from './server-connection.js';

// Load specific panel
async function selectPanel(id) {
    serverConnection.sendWebSocketMessage('select-panel', { id:id });
}
window.selectPanel = selectPanel;

// Apply panel layout to dream-body container
function applyPanelLayout(layoutBody) {
    const contentElement = document.getElementById('dream-body');
    for (var i = 0; i < contentElement.children.length; i++) {
        const child = contentElement.children[i];
        console.log(`child [${i}]: ${child.tagName}`);
    }

    const first = contentElement.firstElementChild;

    if (first && first.tagName === 'MAIN') {
        console.log('main found.');
        contentElement.replaceChild(layoutBody, first);
    } else {
        console.log('main not found.');
        contentElement.prepend(layoutBody);
    }
}

//
// command handlers
//
const commandHandlers = {
    "warn": doWarn,
    "log": doLog,
    "show-status": doShowStatus,
    "clear-panel": doClearPanel,
    "show-panel": doShowPanel
}

function doWarn(commandObj) {
    console.warn("Server Warning: " + commandObj.message);
    console.log("Details    : \n" + JSON.stringify(commandObj, null, 2));
}

function doLog(commandObj) {
    console.log("Server Info: " + commandObj.message);
    console.log("Details    : \n" + JSON.stringify(commandObj, null, 2));
}

function doShowStatus(commandObj) {
    //updateConnectionStatus('websocket');
    console.log("show-status: " + JSON.stringify(commandObj, null, 2));
}

function doClearPanel(commandObj) {
    const contentElement = document.getElementById('dream-body');
    contentElement.style.display='none';
}

async function doShowPanel(commandObj) {
    const steps = commandObj.steps;

    // Get and apply the panel layout
    const layoutBody = await layoutService.getLayout();
    applyPanelLayout(layoutBody);

    for (const step of steps) {
        const templateElement = templateService.newElement(step.template, step.data);
        if (templateElement) {
            addElementToFlow(step.flow, templateElement);
        } else {
            console.warn(`Missing template: ${step.template}`);
            console.log("Test for echo!");
            console.log("Templates: " + templateService.listTemplates());

            addTextToFlow(step.flow, step.data.to);
            addTextToFlow(step.flow, step.data.kind);
        }
    }
    gridService.refreshGrid();
}

// Helper function to add content to specific flow containers
function addElementToFlow(flowId, element) {
    const flowElement = document.getElementById(flowId);
    if (flowElement) {
        flowElement.appendChild(element);
    } else {
        console.warn(`flow not found: ${flowId}`);
    }
}

function addTextToFlow(flowId, content) {
    const flowElement = document.getElementById(flowId);
    if (flowElement) {
        const newDiv = document.createElement('div');
        newDiv.innerHTML = content;
        flowElement.appendChild(newDiv);
    } else {
        console.warn(`flow not found: ${flowId}`);
    }
}


// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    resizeService.init();
    layoutService.init();
    document.getElementById("grid-button").addEventListener("click", ()=>gridService.toggleGrid());

    // Initialize template service
    await templateService.loadTemplateFile('panel-templates.html');
    
    // Try WebSocket first, fallback to HTTP
    // connectWebSocket();
    serverConnection.connectWebSocket(commandHandlers);
 });
