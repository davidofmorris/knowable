// Configuration
const API_BASE_URL = 'https://knowable-api.up.railway.app'; // Will be updated when Railway is deployed
const LOCAL_API_URL = 'http://localhost:3000'; // For local development
const WS_BASE_URL = 'wss://knowable-api.up.railway.app'; // WebSocket production URL
const LOCAL_WS_URL = 'ws://localhost:3000'; // WebSocket local development

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

// Test API connection
async function testConnection() {
    try {
        const response = await fetch(`${apiUrl}/api/hello`);
        const data = await response.json();
        
        connectionStatus.innerHTML = '<div class="success">✓ Connected to backend successfully!</div>';
        apiResponse.textContent = JSON.stringify(data, null, 2);
        
        // Load perspectives
        loadPerspectives();
        
    } catch (error) {
        connectionStatus.innerHTML = `<div class="error">✗ Connection failed: ${error.message}</div>`;
        apiResponse.textContent = `Error: ${error.message}`;
        
        // Show fallback message
        perspectivesList.innerHTML = '<div class="error">Unable to load perspectives - backend not accessible</div>';
    }
}

// Load perspectives from API
async function loadPerspectives() {
    // Try WebSocket first, fallback to HTTP
    if (sendWebSocketMessage('refresh-perspective-list')) {
        return; // WebSocket message sent successfully
    }
    
    // Fallback to HTTP
    try {
        const response = await fetch(`${apiUrl}/api/server?action=refresh-perspective-list`);
        const data = await response.json();
        processCommands(data);
    } catch (error) {
        console.log("ERROR: " + error.message);
    }
}

// Load specific perspective
async function loadPerspective(id) {
    // Try WebSocket first, fallback to HTTP
    if (sendWebSocketMessage('select-perspective', { id })) {
        return; // WebSocket message sent successfully
    }
    
    // Fallback to HTTP
    try {
        const response = await fetch(`${apiUrl}/api/server?action=select-perspective&id=${id}`);
        const data = await response.json();
        processCommands(data);
    } catch (error) {
        console.log("ERROR: " + error.message);
    }
}

//
// command handlers
//
const commandHandlers = {
    "warn": doWarn,
    "show-perspective-list": doShowPerspectiveList,
    "show-perspective": doShowPerspective
}

function doWarn(commandObj) {
    console.log("Server Warning: " + commandObj.message);
}

function doShowPerspectiveList(commandObj) {
    let html = '<ul>';
    commandObj.perspectives.forEach(perspective => {
        html += `
            <li>
                <strong>${perspective.name}</strong> - ${perspective.description}
                <button onclick="loadPerspective('${perspective.id}')" style="margin-left: 10px;">Load</button>
            </li>
        `;
    });
    html += '</ul>';
    
    perspectivesList.innerHTML = html;
}

function doShowPerspective(commandObj) {
    // Update the perspective map
    const mapElement = document.getElementById('perspective-map');
    const cells = mapElement.querySelectorAll('.perspective-cell');
    
    // Map the perspective data to the 3x3 grid
    const perspective = commandObj.perspective;
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
        cell.style.backgroundColor = '#e3f2fd';
    });
    
    // Add title
    const container = document.getElementById('perspective-container');
    container.innerHTML = `
        <h4>Current Perspective: ${perspective.name}</h4>
        <p>${perspective.description}</p>
    ` + container.innerHTML;
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
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
            console.log('WebSocket connected');
            wsConnected = true;
            reconnectAttempts = 0;
            updateConnectionStatus('websocket');
            
            // Load initial data
            loadPerspectives();
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
                updateConnectionStatus('http');
            }
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            wsConnected = false;
        };
        
    } catch (error) {
        console.error('WebSocket connection failed:', error);
        wsConnected = false;
        updateConnectionStatus('http');
    }
}

// Send WebSocket message
function sendWebSocketMessage(action, data = {}) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        const message = { action, ...data };
        ws.send(JSON.stringify(message));
        return true;
    }
    return false;
}

// Update connection status display
function updateConnectionStatus(type) {
    const statusMap = {
        'websocket': '<div class="success">🔗 Connected via WebSocket</div>',
        'http': '<div class="warning">📡 Connected via HTTP (fallback)</div>',
        'disconnected': '<div class="error">❌ Disconnected</div>'
    };
    
    connectionStatus.innerHTML = statusMap[type] || statusMap['disconnected'];
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Try WebSocket first, fallback to HTTP
    connectWebSocket();
    
    // Also test HTTP connection as fallback
    setTimeout(() => {
        if (!wsConnected) {
            testConnection();
        }
    }, 3000);
});
