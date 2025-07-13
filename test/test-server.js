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
async function runTest(testFunction) {
    const startTime = Date.now();
    const testData = {};
    try {
        await testFunction(testData);
        const duration = Date.now() - startTime;
        testResults.push({
            ...testData,
            status: 'PASS',
            duration: duration,
            error: null
        });
        console.log(`✅ ${testData.name} - ${duration}ms`);
    } catch (error) {
        const duration = Date.now() - startTime;
        testResults.push({
            ...testData,
            status: 'FAIL',
            duration: duration,
            error: error.message
        });
        console.log(`❌ ${testData.name} - ${error.message}`);
    }
}

//
// Tests
//
async function testHelp(testData) {
    testData.name = 'Help Test';
    const URL = `${apiUrl}help`;
    testData.URL = URL;
    const response = await fetch(URL);
    const data = await response.json();
    testResponseStatus(response, 200);
    if (!data.name) {
        throw new Error('Response should contain a message field');
    }
}

async function testStatus(testData) {
    testData.name = 'Status Test';
    const URL = `${apiUrl}status?instance=test`;
    testData.URL = URL;
    const response = await fetch(URL);
    const data = await response.json();
    testResponseStatus(response, 200);
    if (data.instance != 'test') {
        throw new Error(`Wrong instance name in status response. Expected 'test', found '${data.instance}'.`)
    }
}

async function testErrorHandling(testData) {
    testData.name = 'Error Handling Test';
    const URL = `${apiUrl}nonexistent`;
    testData.URL = URL;
    const response = await fetch(URL);
    testResponseStatus(response, 404);
}

async function testShowApp(testData) {
    testData.name = 'Action: show-app';
    const URL = `${apiUrl}server?action=show-app&instance=test`;
    testData.URL = URL;
    const response = await fetch(URL);
    const data = await response.json(); 
    testResponseStatus(response, 200);
    testCommandArray(data);
    // verify instance value in 'show-status' command
    var commandsFound = "Found: ";
    var showStatusCommand;
    for (let i = 0; i < data.length; i++) {
        const commandObj = data[i];
        commandsFound += commandObj + ", ";
        if (commandObj.command === 'show-status') {
            showStatusCommand = commandObj;
            break;
        }
    }
    if (!showStatusCommand) {
       throw new Error(`Missing command in response: show-status: ` + commandsFound);
     }
    if (showStatusCommand.instance != 'test') {
       throw new Error(`Wrong instance name in show-status command. Expected 'test', found '${showStatusCommand.instance}'.`)
    }
}

async function testSelectPanel(testData) {
    testData.name = 'Action: select-panel';
    const URL = `${apiUrl}server?action=select-panel`;
    testData.URL = URL;
    const response = await fetch(URL);
    const data = await response.json();
    testResponseStatus(response, 200);
    testCommandArray(data);  
}

async function testMethodAgnosticAPI(testData) {
    testData.name = 'Method-Agnostic API Test';
    
    // Helper function to remove debug command from response
    function removeDebugCommand(data) {
        return data.filter(cmd => cmd.command !== 'debug');
    }
    
    // Test 1: GET request with id=knowledge-graph
    const getURL = `${apiUrl}server?action=select-panel&id=knowledge-graph`;
    const getResponse = await fetch(getURL);
    const getData = await getResponse.json();
    testResponseStatus(getResponse, 200);
    testCommandArray(getData);
    const getDataFiltered = removeDebugCommand(getData);
    
    // Test 2: POST request with id=knowledge-graph in body
    const postURL = `${apiUrl}server`;
    const postResponse = await fetch(postURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Instance': 'test'
        },
        body: JSON.stringify({
            action: 'select-panel',
            id: 'knowledge-graph'
        })
    });
    const postData = await postResponse.json();
    testResponseStatus(postResponse, 200);
    testCommandArray(postData);
    const postDataFiltered = removeDebugCommand(postData);
    
    // Test 3: POST request with id=knowledge-graph as URL parameter
    const postWithParamURL = `${apiUrl}server?id=knowledge-graph`;
    const postWithParamResponse = await fetch(postWithParamURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Instance': 'test'
        },
        body: JSON.stringify({
            action: 'select-panel'
        })
    });
    const postWithParamData = await postWithParamResponse.json();
    testResponseStatus(postWithParamResponse, 200);
    testCommandArray(postWithParamData);
    const postWithParamDataFiltered = removeDebugCommand(postWithParamData);
    
    // Verify all three responses are identical (excluding debug command)
    const getStr = JSON.stringify(getDataFiltered);
    const postStr = JSON.stringify(postDataFiltered);
    const postWithParamStr = JSON.stringify(postWithParamDataFiltered);
    
    if (getStr !== postStr) {
        throw new Error('GET and POST responses differ');
    }
    
    if (getStr !== postWithParamStr) {
        throw new Error('GET and POST-with-param responses differ');
    }
    
    if (postStr !== postWithParamStr) {
        throw new Error('POST and POST-with-param responses differ');
    }
    
    testData.URL = `${getURL} | ${postURL} | ${postWithParamURL}`;
    testData.details = `All three requests should return identical responses for knowledge-graph panel`;
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
    await runTest(testHelp);
    await runTest(testStatus);
    await runTest(testErrorHandling);

    await runTest(testShowApp);
    await runTest(testSelectPanel);
    await runTest(testMethodAgnosticAPI);
    
    console.log('\n📊 Test completed!');
    console.log(`Total: ${testResults.length} tests, ${testResults.filter(t => t.status === 'PASS').length} passed, ${testResults.filter(t => t.status === 'FAIL').length} failed`);
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    console.log("URL:" + req.url);
    if (req.url === '/favicon.ico' || req.url === 'favicon.ico') {
        try {
            const favicon = fs.readFileSync('./favicon.ico');
            res.writeHead(200, { 'Content-Type': 'image/x-icon' });
            res.end(favicon);
        } catch (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Favicon not found');
        }
    } else if (req.url === '/test-results' || req.url === '/') {
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