// Test Suite Configuration
const API_BASE_URL = 'https://knowable-api.up.railway.app';
const LOCAL_API_URL = 'http://localhost:3000';
const apiUrl = window.location.hostname === 'localhost' ? LOCAL_API_URL : API_BASE_URL;

// Test State Management
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    running: 0
};

let testCases = [];

// Test Suite Definition
const TEST_SUITES = {
    connection: [
        {
            name: 'Basic Connection',
            description: 'Test if the API server is accessible',
            endpoint: '/api/hello',
            method: 'GET',
            expectedStatus: 200,
            validateResponse: (data) => data.message && data.timestamp
        },
        {
            name: 'Health Check',
            description: 'Test server health endpoint',
            endpoint: '/api/health',
            method: 'GET',
            expectedStatus: 200,
            validateResponse: (data) => data.status === 'ok' && data.uptime
        }
    ],
    api: [
        {
            name: 'Root API Info',
            description: 'Test root API endpoint for service info',
            endpoint: '/',
            method: 'GET',
            expectedStatus: 200,
            validateResponse: (data) => data.name && data.version
        },
        {
            name: 'Get All Perspectives',
            description: 'Test retrieving all available perspectives',
            endpoint: '/api/perspectives',
            method: 'GET',
            expectedStatus: 200,
            validateResponse: (data) => data.perspectives && Array.isArray(data.perspectives) && data.count >= 0
        },
        {
            name: 'Get Specific Perspective',
            description: 'Test retrieving a specific perspective by ID',
            endpoint: '/api/perspectives/project-explorer',
            method: 'GET',
            expectedStatus: 200,
            validateResponse: (data) => data.id && data.name && data.map && data.map.aspirational
        }
    ],
    error: [
        {
            name: '404 Not Found',
            description: 'Test handling of non-existent endpoints',
            endpoint: '/api/nonexistent',
            method: 'GET',
            expectedStatus: 404,
            validateResponse: (data) => true // Any response is acceptable for 404
        },
        {
            name: 'Invalid Perspective ID',
            description: 'Test handling of invalid perspective ID',
            endpoint: '/api/perspectives/invalid-id',
            method: 'GET',
            expectedStatus: 404,
            validateResponse: (data) => data.error
        }
    ],
    validation: [
        {
            name: 'Perspective Data Structure',
            description: 'Validate complete perspective data structure',
            endpoint: '/api/perspectives/project-explorer',
            method: 'GET',
            expectedStatus: 200,
            validateResponse: (data) => {
                return data.id && data.name && data.description && data.map &&
                       data.map.aspirational && data.map.operational && data.map.foundational &&
                       data.map.aspirational.back && data.map.aspirational.center && data.map.aspirational.front &&
                       data.map.operational.back && data.map.operational.center && data.map.operational.front &&
                       data.map.foundational.back && data.map.foundational.center && data.map.foundational.front;
            }
        },
        {
            name: 'Perspectives Array Structure',
            description: 'Validate perspectives array contains properly structured data',
            endpoint: '/api/perspectives',
            method: 'GET',
            expectedStatus: 200,
            validateResponse: (data) => {
                return data.perspectives && data.perspectives.length > 0 &&
                       data.perspectives.every(p => p.id && p.name && p.description && p.map);
            }
        }
    ],
    performance: [
        {
            name: 'Response Time - Hello',
            description: 'Test API response time for hello endpoint',
            endpoint: '/api/hello',
            method: 'GET',
            expectedStatus: 200,
            maxResponseTime: 2000, // 2 seconds
            validateResponse: (data) => data.message
        },
        {
            name: 'Response Time - Perspectives',
            description: 'Test API response time for perspectives endpoint',
            endpoint: '/api/perspectives',
            method: 'GET',
            expectedStatus: 200,
            maxResponseTime: 3000, // 3 seconds
            validateResponse: (data) => data.perspectives
        }
    ]
};

// Test Execution Functions
async function runTest(testCase) {
    const testId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    testCase.id = testId;
    
    updateTestStatus(testId, 'running');
    updateSummary();
    
    const startTime = Date.now();
    
    try {
        const response = await fetch(`${apiUrl}${testCase.endpoint}`, {
            method: testCase.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }
        
        // Check status code
        if (response.status !== testCase.expectedStatus) {
            throw new Error(`Expected status ${testCase.expectedStatus}, got ${response.status}`);
        }
        
        // Check response time if specified
        if (testCase.maxResponseTime && responseTime > testCase.maxResponseTime) {
            throw new Error(`Response time ${responseTime}ms exceeded maximum ${testCase.maxResponseTime}ms`);
        }
        
        // Validate response data
        if (testCase.validateResponse && !testCase.validateResponse(data)) {
            throw new Error('Response data validation failed');
        }
        
        updateTestStatus(testId, 'passed', {
            responseTime,
            status: response.status,
            data: typeof data === 'string' ? data : JSON.stringify(data, null, 2)
        });
        
    } catch (error) {
        updateTestStatus(testId, 'failed', {
            error: error.message,
            responseTime: Date.now() - startTime
        });
    }
    
    updateSummary();
}

function updateTestStatus(testId, status, details = {}) {
    const testCase = testCases.find(tc => tc.id === testId);
    if (!testCase) return;
    
    // Update counts
    if (testCase.status === 'running') testResults.running--;
    if (testCase.status === 'passed') testResults.passed--;
    if (testCase.status === 'failed') testResults.failed--;
    
    testCase.status = status;
    testCase.details = details;
    
    if (status === 'running') testResults.running++;
    if (status === 'passed') testResults.passed++;
    if (status === 'failed') testResults.failed++;
    
    // Update DOM
    const testElement = document.getElementById(testId);
    if (testElement) {
        testElement.className = `test-case ${status}`;
        
        const statusElement = testElement.querySelector('.test-status');
        if (statusElement) {
            statusElement.className = `test-status ${status}`;
            statusElement.textContent = status.toUpperCase();
            
            if (status === 'running') {
                statusElement.innerHTML = '<span class="spinner"></span> RUNNING';
            }
        }
        
        const detailsElement = testElement.querySelector('.test-details');
        if (detailsElement) {
            if (status === 'passed') {
                detailsElement.innerHTML = `
                    <div>✅ Test passed</div>
                    ${details.responseTime ? `<div>Response time: ${details.responseTime}ms</div>` : ''}
                    ${details.status ? `<div>Status: ${details.status}</div>` : ''}
                    ${details.data ? `<div class="test-response">${details.data}</div>` : ''}
                `;
            } else if (status === 'failed') {
                detailsElement.innerHTML = `
                    <div>❌ Test failed</div>
                    ${details.responseTime ? `<div>Response time: ${details.responseTime}ms</div>` : ''}
                    ${details.error ? `<div class="test-error">Error: ${details.error}</div>` : ''}
                `;
            } else if (status === 'running') {
                detailsElement.innerHTML = '<div>⏳ Test in progress...</div>';
            }
        }
    }
}

function updateSummary() {
    document.getElementById('total-count').textContent = testResults.total;
    document.getElementById('passed-count').textContent = testResults.passed;
    document.getElementById('failed-count').textContent = testResults.failed;
    document.getElementById('running-count').textContent = testResults.running;
    
    // Update summary card styles
    const summaryCards = document.querySelectorAll('.summary-card');
    summaryCards.forEach(card => {
        card.classList.remove('passed', 'failed', 'running');
    });
    
    if (testResults.running > 0) {
        document.getElementById('summary-running').classList.add('running');
    } else if (testResults.failed > 0) {
        document.getElementById('summary-failed').classList.add('failed');
    } else if (testResults.passed > 0) {
        document.getElementById('summary-passed').classList.add('passed');
    }
}

function renderTestCase(testCase, sectionId) {
    const section = document.getElementById(sectionId);
    const testElement = document.createElement('div');
    testElement.className = 'test-case';
    testElement.id = testCase.id;
    
    testElement.innerHTML = `
        <h4>
            ${testCase.name}
            <span class="test-status pending">PENDING</span>
        </h4>
        <div class="test-details">
            <div><strong>Description:</strong> ${testCase.description}</div>
            <div><strong>Endpoint:</strong> ${testCase.method || 'GET'} ${testCase.endpoint}</div>
            <div><strong>Expected Status:</strong> ${testCase.expectedStatus}</div>
            ${testCase.maxResponseTime ? `<div><strong>Max Response Time:</strong> ${testCase.maxResponseTime}ms</div>` : ''}
        </div>
    `;
    
    section.appendChild(testElement);
}

function clearResults() {
    testResults = { total: 0, passed: 0, failed: 0, running: 0 };
    testCases = [];
    
    // Clear all test sections
    ['connection-tests', 'api-tests', 'error-tests', 'validation-tests', 'performance-tests'].forEach(sectionId => {
        document.getElementById(sectionId).innerHTML = '';
    });
    
    updateSummary();
}

// Test Runner Functions
async function runAllTests() {
    clearResults();
    
    // Initialize all test cases
    Object.entries(TEST_SUITES).forEach(([suiteKey, tests]) => {
        const sectionId = `${suiteKey}-tests`;
        tests.forEach(test => {
            test.status = 'pending';
            testCases.push(test);
            testResults.total++;
            renderTestCase(test, sectionId);
        });
    });
    
    updateSummary();
    
    // Run tests with some delay between them
    for (const testCase of testCases) {
        await runTest(testCase);
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between tests
    }
}

async function runBasicTests() {
    clearResults();
    
    const basicTests = [...TEST_SUITES.connection];
    basicTests.forEach(test => {
        test.status = 'pending';
        testCases.push(test);
        testResults.total++;
        renderTestCase(test, 'connection-tests');
    });
    
    updateSummary();
    
    for (const testCase of testCases) {
        await runTest(testCase);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

async function runApiTests() {
    clearResults();
    
    const apiTests = [...TEST_SUITES.api, ...TEST_SUITES.validation];
    apiTests.forEach(test => {
        test.status = 'pending';
        testCases.push(test);
        testResults.total++;
        const sectionId = TEST_SUITES.api.includes(test) ? 'api-tests' : 'validation-tests';
        renderTestCase(test, sectionId);
    });
    
    updateSummary();
    
    for (const testCase of testCases) {
        await runTest(testCase);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// Initialize the test suite
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧪 Knowable API Test Suite initialized');
    console.log(`📡 Testing against: ${apiUrl}`);
    
    // Add some helpful info
    const container = document.querySelector('.container');
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = 'background: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: center;';
    infoDiv.innerHTML = `
        <strong>🎯 Testing Target:</strong> ${apiUrl}<br>
        <small>Click "Run All Tests" to start comprehensive testing or use specific test buttons for focused testing.</small>
    `;
    container.insertBefore(infoDiv, container.children[1]);
    
    // Auto-run tests if URL parameter is present
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autorun') === 'true') {
        setTimeout(() => {
            runAllTests();
        }, 1000);
    }
});