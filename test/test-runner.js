#!/usr/bin/env node

// Simple synchronous test runner for curl/command line usage
const API_BASE_URL = 'https://knowable-api.up.railway.app';
const LOCAL_API_URL = 'http://localhost:3000';

// Use local API for testing
const apiUrl = LOCAL_API_URL;

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
            validateResponse: (data) => data.status === 'healthy' && data.uptime
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
    ]
};

// Test execution
async function runTest(testCase) {
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
            return {
                name: testCase.name,
                status: 'FAILED',
                error: `Expected status ${testCase.expectedStatus}, got ${response.status}`,
                responseTime
            };
        }
        
        // Validate response data
        if (testCase.validateResponse && !testCase.validateResponse(data)) {
            return {
                name: testCase.name,
                status: 'FAILED',
                error: 'Response data validation failed',
                responseTime,
                data: typeof data === 'string' ? data : JSON.stringify(data, null, 2)
            };
        }
        
        return {
            name: testCase.name,
            status: 'PASSED',
            responseTime,
            data: typeof data === 'string' ? data : JSON.stringify(data, null, 2)
        };
        
    } catch (error) {
        return {
            name: testCase.name,
            status: 'FAILED',
            error: error.message,
            responseTime: Date.now() - startTime
        };
    }
}

async function runAllTests() {
    console.log('🧪 Knowable API Test Suite');
    console.log('=' .repeat(50));
    console.log(`📡 Testing against: ${apiUrl}`);
    console.log('');
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    const results = [];
    
    for (const [suiteKey, tests] of Object.entries(TEST_SUITES)) {
        console.log(`\n🔧 ${suiteKey.toUpperCase()} TESTS`);
        console.log('-'.repeat(30));
        
        for (const test of tests) {
            totalTests++;
            const result = await runTest(test);
            results.push(result);
            
            if (result.status === 'PASSED') {
                passedTests++;
                console.log(`✅ ${result.name} - ${result.status} (${result.responseTime}ms)`);
            } else {
                failedTests++;
                console.log(`❌ ${result.name} - ${result.status} (${result.responseTime}ms)`);
                console.log(`   Error: ${result.error}`);
            }
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
        console.log('\n❌ FAILED TESTS:');
        results.filter(r => r.status === 'FAILED').forEach(r => {
            console.log(`  • ${r.name}: ${r.error}`);
        });
    }
    
    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
    console.error('❌ This script requires Node.js 18+ with built-in fetch support');
    process.exit(1);
}

// Run the tests
runAllTests().catch(console.error);