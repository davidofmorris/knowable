// Configuration
const API_BASE_URL = 'https://your-app.up.railway.app'; // Will be updated when Railway is deployed
const LOCAL_API_URL = 'http://localhost:3000'; // For local development

// Determine which API URL to use
const apiUrl = window.location.hostname === 'localhost' ? LOCAL_API_URL : API_BASE_URL;

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
    try {
        const response = await fetch(`${apiUrl}/api/perspectives`);
        const data = await response.json();
        
        let html = '<ul>';
        data.perspectives.forEach(perspective => {
            html += `
                <li>
                    <strong>${perspective.name}</strong> - ${perspective.description}
                    <button onclick="loadPerspective('${perspective.id}')" style="margin-left: 10px;">Load</button>
                </li>
            `;
        });
        html += '</ul>';
        
        perspectivesList.innerHTML = html;
        
    } catch (error) {
        perspectivesList.innerHTML = `<div class="error">Error loading perspectives: ${error.message}</div>`;
    }
}

// Load specific perspective
async function loadPerspective(id) {
    try {
        const response = await fetch(`${apiUrl}/api/perspectives/${id}`);
        const perspective = await response.json();
        
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
            cell.style.backgroundColor = '#e3f2fd';
        });
        
        // Add title
        const container = document.getElementById('perspective-container');
        container.innerHTML = `
            <h4>Current Perspective: ${perspective.name}</h4>
            <p>${perspective.description}</p>
        ` + container.innerHTML;
        
    } catch (error) {
        alert(`Error loading perspective: ${error.message}`);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    testConnection();
});