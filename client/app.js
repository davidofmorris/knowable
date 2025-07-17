// Application resources

// Configuration
const API_BASE_URL = 'https://knowable-api.up.railway.app'; // Will be updated when Railway is deployed
const LOCAL_API_URL = 'http://localhost:3000'; // For local development
const WS_BASE_URL = 'wss://knowable-api.up.railway.app'; // WebSocket production URL
const LOCAL_WS_URL = 'ws://localhost:3000'; // WebSocket local development

const INSTANCE = initInstance();

// Determine which API URL to use
const apiUrl = window.location.hostname === 'localhost' ? LOCAL_API_URL : API_BASE_URL;
const wsUrl = window.location.hostname === 'localhost' ? LOCAL_WS_URL : WS_BASE_URL;

// WebSocket connection state
let ws = null;
let wsConnected = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectDelay = 2000; // 2 seconds

// DOM elements
const connectionStatus = document.getElementById('connection-status');
const apiResponse = document.getElementById('api-response');

function initInstance() {
    // Try to get existing instance from localStorage
    let instance = sessionStorage.getItem('knowable-instance');
    
    if (!instance) {
        // Start new instance
        instance = `session-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('knowable-instance', instance);
        console.log(`New session created: ${instance}`);
    } else {
        console.log(`Restored session: ${instance}`);
    }
    
    return instance;
}

// Show App - send first action to server
// - called from ws.onopen event in connectWebSocket()
async function showApp() {
    // Send "show-app" action
    const success = sendWebSocketMessage('show-app');
    if (!success) {
        updateConnectionStatus('disconnected');
    }
}

// Load specific panel
async function selectPanel(id) {
    sendWebSocketMessage('select-panel', { id:id });
}
window.selectPanel = selectPanel;

// Register statusService
window.statusService = function() {
    var isOpen = false; // off
    const element = document.getElementById('top-status-panel');
    const button = document.getElementById('status-open-button');
    function applyState() {
        if (isOpen) {
            element.style.display='block';
            button.textContent=' - ';
        } else {
            element.style.display='none';
            button.textContent=' + ';
        }
    }
    function toggleOpen() {
        isOpen = !isOpen;
        applyState();
    }
    return {
        toggleOpen: toggleOpen
    }
}();

// Apply panel layout to dream-body container
function applyPanelLayout(layoutBody) {
    const contentElement = document.getElementById('dream-body');
    
    // Clear existing content
    contentElement.innerHTML = '';  // todo: is this making the [grid] button go away?
    
    // Add the layout body
    if (layoutBody) {
        contentElement.appendChild(layoutBody);
        contentElement.style.display = 'block';
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
    apiResponse.textContent = JSON.stringify(commandObj, null, 2);
}

function doLog(commandObj) {
    console.log("Server Info: " + commandObj.message);
    apiResponse.textContent = JSON.stringify(commandObj, null, 2);
}

function doShowStatus(commandObj) {
    updateConnectionStatus('websocket');
    apiResponse.textContent = JSON.stringify(commandObj, null, 2);
}

function doClearPanel(commandObj) {
    const contentElement = document.getElementById('dream-body');
    contentElement.style.display='none';
}

async function doShowPanel(commandObj) {
    const steps = commandObj.steps;

    // Get and apply the panel layout
    const layoutBody = await window.layoutService.getLayout();
    applyPanelLayout(layoutBody);

    for (const step of steps) {
        const templateElement = window.templateService.newElement(step.template, step.data);
        if (templateElement) {
            addElementToFlow(step.flow, templateElement);
        } else {
            console.warn(`Missing template: ${step.template}`);
            console.log("Test for echo!");
            console.log("Templates: " + window.templateService.listTemplates());

            addTextToFlow(step.flow, step.data.to);
            addTextToFlow(step.flow, step.data.kind);
        }
    }
    window.gridService.refreshGrid();
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

//
// process all the commands in a command array
//
function processCommands(arr) {
    for (const commandObj of arr) {
        console.log("Command:" + JSON.stringify(commandObj));
        const command = commandObj.command;
        if (!command) {
            console.log('command missing from ' + JSON.stringify(commandObj));
            continue;
        }
        const handler = commandHandlers[command];
        if (!handler) {
            console.log('No handler for command:' + command);
            continue;
        }
        handler(commandObj);
    }
}

// WebSocket connection management
function connectWebSocket() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        return; // Already connected
    }
    
    try {
        ws = new WebSocket(wsUrl + '?instance=' + INSTANCE);
        
        ws.onopen = () => {
            console.log('WebSocket connected');
            wsConnected = true;
            reconnectAttempts = 0;
            updateConnectionStatus('websocket');
            
            showApp(); // sends the first action: "show-app"
        };
        
        ws.onmessage = (event) => {
            try {
                const commands = JSON.parse(event.data);
                processCommands(commands);
            } catch (error) {
                console.error('WebSocket message parse error:', error);
            }
        };
        
        ws.onclose = () => {
            console.log('WebSocket disconnected');
            wsConnected = false;
            ws = null;
            
            // Attempt to reconnect
            if (reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++;
                console.log(`Reconnecting in ${reconnectDelay}ms (attempt ${reconnectAttempts})`);
                setTimeout(connectWebSocket, reconnectDelay);
            } else {
                console.log('Max reconnection attempts reached, falling back to HTTP');
                updateConnectionStatus('disconnected');
            }
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            wsConnected = false;
        };
        
    } catch (error) {
        console.error('WebSocket connection failed:', error);
        wsConnected = false;
        updateConnectionStatus('disconnected');
    }
}

// Send WebSocket message
function sendWebSocketMessage(action, data = {}) {
    try {
        if (ws && ws.readyState === WebSocket.OPEN) {
            const message = { action, ...data };
            console.log('sendWebSocketMessage' + JSON.stringify(message));
            ws.send(JSON.stringify(message));
            return true;
        }
    } catch (error) {
        console.error('sendWebSocketMessage failed:', error);
    }
    return false;
}

// Update connection status display
function updateConnectionStatus(type) {
    const statusMap = {
        'websocket': '<div class="success">🔗 Connected via WebSocket</div>',
        'disconnected': '<div class="error">❌ Disconnected</div>'
    };
    
    connectionStatus.innerHTML = statusMap[type] || statusMap['disconnected'];
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    window.resizeService.init();
    window.layoutService.init();

    // Initialize template service
    await window.templateService.loadTemplateFile('panel-templates.html');
    
    // Try WebSocket first, fallback to HTTP
    connectWebSocket();
 });
