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
const perspectivesList = document.getElementById('perspectives-list');

function initInstance() {
    if (!window.windowId) {
        window.windowId = `session-${Math.random().toString(36).substr(2, 9)}`;
        console.log(`session: ${window.windowId}`);
    }
    return window.windowId;
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

// Load specific perspective
async function selectPerspective(id) {
    sendWebSocketMessage('select-perspective', { id });
}

//
// command handlers
//
const commandHandlers = {
    "warn": doWarn,
    "show-status": doShowStatus,
    "clear-perspective": doClearPerspective,
    "show-perspective-list": doShowPerspectiveList,
    "show-perspective": doShowPerspective
}

function doWarn(commandObj) {
    console.log("Server Warning: " + commandObj.message);
}

function doShowStatus(commandObj) {
    updateConnectionStatus('websocket');
    apiResponse.textContent = JSON.stringify(commandObj, null, 2);
}

function doClearPerspective(commandObj) {
    const headerElement = document.getElementById('perspective-header');
    const mapElement = document.getElementById('perspective-map');
    headerElement.innerHTML = `
        <h3>Current Perspective: none</h3>
        <p><i>Select a perspective to begin...</i></p>
    `;
    mapElement.style.display='none';
}

function doShowPerspectiveList(commandObj) {
    let html = '<ul>';
    commandObj.perspectives.forEach(perspective => {
        html += `
            <li>
                <strong>${perspective.name}</strong> - ${perspective.description}
                <button onclick="selectPerspective('${perspective.id}')" style="margin-left: 10px;">Load</button>
            </li>
        `;
    });
    html += '</ul>';
    
    perspectivesList.innerHTML = html;
}

function doShowPerspective(commandObj) {
    const perspective = commandObj.perspective;
    const headerElement = document.getElementById('perspective-header');

    // Add title
    headerElement.innerHTML = `
       <h3>Current Perspective: ${perspective.name}</h3>
        <p>${perspective.description}</p>
    `;

    // Update the perspective map
    const mapElement = document.getElementById('perspective-map');
    const cells = mapElement.querySelectorAll('.perspective-cell');
    
    // Map the perspective data to the 3x3 grid
    const mapData = [
        perspective.map.aspirational.back,
        perspective.map.aspirational.center,
        perspective.map.aspirational.front,
        perspective.map.operational.back,
        perspective.map.operational.center,
        perspective.map.operational.front,
        perspective.map.foundational.back,
        perspective.map.foundational.center,
        perspective.map.foundational.front
    ];
    
    cells.forEach((cell, index) => {
        cell.textContent = mapData[index];
        //cell.style.backgroundColor = '#e3f2fd';
    });

    mapElement.style.display='grid';
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
