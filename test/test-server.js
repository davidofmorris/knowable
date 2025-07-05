const http = require('http');
const fs = require('fs');

// Configuration
const API_BASE_URL = 'https://knowable-api.up.railway.app'; // Will be updated when Railway is deployed
const LOCAL_API_URL = 'http://localhost:3000'; // For local development

// Determine which API URL to use
const apiUrl = process.env.LOCAL ? LOCAL_API_URL : API_BASE_URL;

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

// Your actual tests - using the same fetch syntax as frontend
async function testHelloEndpoint() {
    const response = await fetch(`${apiUrl}/api/hello`);
    const data = await response.json();
    
    if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!data.message) {
        throw new Error('Response should contain a message field');
    }
}

async function testUsersEndpoint() {
    const response = await fetch(`${apiUrl}/api/users`);
    const data = await response.json();
    
    if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!Array.isArray(data)) {
        throw new Error('Response should be an array');
    }
}

async function testErrorHandling() {
    const response = await fetch(`${apiUrl}/api/nonexistent`);
    
    if (response.status !== 404) {
        throw new Error(`Expected status 404, got ${response.status}`);
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
    await runTest('Users Endpoint Test', testUsersEndpoint);
    await runTest('Error Handling Test', testErrorHandling);
    
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