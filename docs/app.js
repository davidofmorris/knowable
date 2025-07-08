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
const panelsList = document.getElementById('panels-list');

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
    sendWebSocketMessage('select-panel', { id });
}

//
// command handlers
//
const commandHandlers = {
    "warn": doWarn,
    "show-status": doShowStatus,
    "clear-panel": doClearPanel,
    "show-panel-list": doShowPanelList,
    "show-panel": doShowPanel
}

function doWarn(commandObj) {
    console.log("Server Warning: " + commandObj.message);
}

function doShowStatus(commandObj) {
    updateConnectionStatus('websocket');
    apiResponse.textContent = JSON.stringify(commandObj, null, 2);
}

function doClearPanel(commandObj) {
    const headerElement = document.getElementById('panel-header');
    const contentElement = document.getElementById('panel-content');
    headerElement.innerHTML = `
        <h3>Current Panel: none</h3>
        <p><i>Select a panel to begin...</i></p>
    `;
    contentElement.style.display='none';
}

function doShowPanelList(commandObj) {
    let html = '<ul>';
    commandObj.panels.forEach(panel => {
        html += `
            <li>
                <strong>${panel.name}</strong> - ${panel.description}
                <button onclick="selectPanel('${panel.id}')" style="margin-left: 10px;">Load</button>
            </li>
        `;
    });
    html += '</ul>';
    
    panelsList.innerHTML = html;
}

function doShowPanel(commandObj) {
    const panel = commandObj.panel;
    const headerElement = document.getElementById('panel-header');
    const contentElement = document.getElementById('panel-content');

    // Add title
    headerElement.innerHTML = `
       <h3>Current Panel: ${panel.name}</h3>
        <p>${panel.description}</p>
    `;

    // Update the panel content
    contentElement.innerHTML = `<p>${panel.content}</p>`;
    contentElement.style.display='block';
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
document.addEventListener('DOMContentLoaded', () => {
    // Try WebSocket first, fallback to HTTP
    connectWebSocket();
 });
