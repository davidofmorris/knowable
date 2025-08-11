import templateService from './template-service.js';
import layoutService from './layout-service.js';
import gridService from './grid-service.js';

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

function warn(commandObj) {
    console.warn("Server Warning: " + commandObj.message);
    console.log("Details    : \n" + JSON.stringify(commandObj, null, 2));
}

function log(commandObj) {
    console.log("Server Info: " + commandObj.message);
    console.log("Details    : \n" + JSON.stringify(commandObj, null, 2));
}

function showStatus(commandObj) {
    console.log("show-status: " + JSON.stringify(commandObj, null, 2));
}

function clearPanel(commandObj) {
    const contentElement = document.getElementById('dream-body');
    contentElement.style.display='none';
}

async function showPanel(commandObj) {
    const steps = commandObj.steps;

    const layoutBody = await layoutService.getLayout();
    applyPanelLayout(layoutBody);

    for (const step of steps) {
        const templateElement = templateService.newElement(step.template, step.data);
        if (templateElement) {
            addElementToFlow(step.flow, templateElement);
        } else {
            console.warn(`Missing template: ${step.template}`);
            addTextToFlow(step.flow, step.data.arg || 'Missing template data');
        }
    }
    gridService.refreshGrid();
}

export default {
    getHandlers() {
        return {
            "warn": warn,
            "log": log,
            "show-status": showStatus,
            "clear-panel": clearPanel,
            "show-panel": showPanel
        };
    },
    
    applyPanelLayout,
    addElementToFlow,
    addTextToFlow
};