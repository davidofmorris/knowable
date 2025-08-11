let ws = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectDelay = 2000; // 2 seconds
var wsConnected = false;

// Server
const WS_BASE_URL = 'wss://knowable-api.up.railway.app';
const LOCAL_WS_URL = 'ws://localhost:3000';
const wsUrl = window.location.hostname === 'localhost' ? LOCAL_WS_URL : WS_BASE_URL;

function initInstance(appName) {
    const storageKey = `${appName}-instance`;
    // Try to get existing instance from localStorage
    let instance = sessionStorage.getItem(storageKey);
    
    if (!instance) {
        // Start new instance
        instance = `session-${Math.random().toString(36).substr(2, 9)}:${appName}`;
        sessionStorage.setItem(storageKey, instance);
        console.log(`New session created: ${instance}`);
    } else {
        console.log(`Restored session: ${instance}`);
    }
    
    return instance;
}
const INSTANCE_MAP = {}; //initInstance();
function getInstance(appName) {
    if (!appName) { 
        appName = "default";
    }
    var instance = INSTANCE_MAP[appName];
    if (!instance) {
        instance = initInstance(appName);
        INSTANCE_MAP[appName] = instance;
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

var commandHandlers;

function connectWebSocket(handlers, appName) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        return; // Already connected
    }
    commandHandlers = handlers;

    try {
        ws = new WebSocket(wsUrl + '?instance=' + getInstance(appName));

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
        'websocket': '🔗 Connected via WebSocket',
        'disconnected': '❌ Disconnected'
    };

    console.log(statusMap[type] || statusMap['disconnected']);
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

export default {
    connectWebSocket,
    sendWebSocketMessage
}
