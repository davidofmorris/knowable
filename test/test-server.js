const http = require('http');
const fs = require('fs');

// Configuration
const API_BASE_URL = 'https://knowable-api.up.railway.app'; // Will be updated when Railway is deployed
const LOCAL_API_URL = 'http://localhost:3000'; // For local development

// Determine which API URL to use
const apiUrl = (process.env.LOCAL ? LOCAL_API_URL : API_BASE_URL) + '/api/';

// Test results storage
const testResults = [];

// Helper function to run a test
async function runTest(testName, testFunction) {
    const startTime = Date.now();
    try {
        await testFunction();
        const duration = Date.now() - startTime;
        testResults.push({
            name: testName,
            status: 'PASS',
            duration: duration,
            error: null
        });
        console.log(`✅ ${testName} - ${duration}ms`);
    } catch (error) {
        const duration = Date.now() - startTime;
        testResults.push({
            name: testName,
            status: 'FAIL',
            duration: duration,
            error: error.message
        });
        console.log(`❌ ${testName} - ${error.message}`);
    }
}

//
// Tests
//
async function testHelloEndpoint() {
    const response = await fetch(`${apiUrl}hello`);
    const data = await response.json();
    testResponseStatus(response, 200);
    if (!data.message) {
        throw new Error('Response should contain a message field');
    }
}

async function testHealthEndpoint() {
    const response = await fetch(`${apiUrl}health`);
    const data = await response.json();
    testResponseStatus(response, 200);
}

async function testErrorHandling() {
    const response = await fetch(`${apiUrl}nonexistent`);
    testResponseStatus(response, 404);
}

async function testRefreshPerspectiveList() {
    const response = await fetch(`${apiUrl}server?action=refresh-perspective-list`);
    const data = await response.json(); 
    testResponseStatus(response, 200);
    testCommandArray(data);  
}

async function testSelectPerspective() {
    const response = await fetch(`${apiUrl}server?action=select-perspective`);
    const data = await response.json();
    testResponseStatus(response, 200);
    testCommandArray(data);  
}

function testResponseStatus(res, expect) {
    if (res.status !== expect) {
        throw new Error(`Expected status ${expect}, got ${res.status}`);
    }
}

function testCommandArray(data) {
    if (!data) {
        throw new Error(`Expected JSON response from server.`);
    }
    if (!Array.isArray(data)) {
        throw new Error('Response should be an array of commands');
    }
}

// Generate HTML report
function generateJSONResponse() {
    const totalTests = testResults.length;
    const passedTests = testResults.filter(t => t.status === 'PASS').length;
    const failedTests = totalTests - passedTests;
    const totalDuration = testResults.reduce((sum, t) => sum + t.duration, 0);
    
    const json = {
        summary: {
            total: totalTests, 
            passed: passedTests, 
            failed: failedTests, 
            duration: totalDuration
        },
        tests: testResults
    };
    
    return JSON.stringify(json,null,2);
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting API tests...\n');
    
    // Clear previous results
    testResults.length = 0;
    
    // Run all your tests
    await runTest('Hello Endpoint Test', testHelloEndpoint);
    await runTest('Health Endpoint Test', testHealthEndpoint);
    await runTest('Error Handling Test', testErrorHandling);

    await runTest('Refresh Perspective List', testRefreshPerspectiveList);
    await runTest('Select Perspective', testSelectPerspective);
    
    console.log('\n📊 Test completed!');
    console.log(`Total: ${testResults.length} tests, ${testResults.filter(t => t.status === 'PASS').length} passed, ${testResults.filter(t => t.status === 'FAIL').length} failed`);
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    if (req.url === '/test-results' || req.url === '/') {
        try {
            // Run tests fresh each time
            await runAllTests();
            
            // Generate HTML report
            const htmlReport = generateJSONResponse();
            
            // Send HTML response
            res.writeHead(200, { 'Content-Type': 'text/javascript' });
            res.end(htmlReport);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(`Error running tests: ${error.message}`);
        }
    } else {
        // 404 for other routes
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Start server
const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
    console.log(`🌐 Test server running on http://localhost:${PORT}`);
    console.log(`📊 View test results at: http://localhost:${PORT}/test-results`);
    console.log(`🔥 Or use curl: curl http://localhost:${PORT}/test-results`);
});