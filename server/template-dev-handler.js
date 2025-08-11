const { chromium } = require('playwright');

class TemplateDevService {
    constructor() {
        this.browser = null;
        this.page = null;
        this.isInitialized = false;
    }

    async init() {
        // Only initialize in development mode
        if (process.env.NODE_ENV !== 'production') {
            console.log('Initializing template development service...');
            
            // Wait for frontend service to be ready with retries
            const maxRetries = 10;
            let retryCount = 0;
            let frontendReady = false;
            
            while (!frontendReady && retryCount < maxRetries) {
                try {
                    // Simple check if frontend is responding
                    const response = await fetch('http://localhost:8080');
                    if (response.ok) {
                        frontendReady = true;
                        console.log('Frontend service is ready');
                    }
                } catch (error) {
                    retryCount++;
                    if (retryCount < maxRetries) {
                        console.log(`Frontend not ready, waiting... (attempt ${retryCount}/${maxRetries})`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }
            
            if (!frontendReady) {
                console.log('Frontend service not available, template service will be limited');
                this.isInitialized = false;
                return;
            }
            
            try {
                this.browser = await chromium.launch({ 
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox'] // For WSL compatibility
                });
                this.page = await this.browser.newPage();
                
                // Point to the frontend service
                await this.page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
                
                // Wait for template service to be available
                await this.page.waitForFunction(() => window.templateService, { timeout: 5000 });
                
                this.isInitialized = true;
                console.log('Template development service initialized successfully');
            } catch (error) {
                console.error('Failed to initialize template development service:', error.message);
                console.log('Template development service will run in limited mode');
                this.isInitialized = false;
            }
        }
    }

    async testTemplate(appName, templateId, data) {
        if (!this.isInitialized || !this.page) {
            return { error: 'Template development service not initialized' };
        }

        try {
            const result = await this.page.evaluate(async ({appName, templateId, data}) => {
                try {
                    await window.templateService.loadTemplateFile(appName + "-templates.html");
                    const element = window.templateService.newElement(templateId, data);
                    if (!element) {
                        return {
                            success: false,
                            error: `Template "${templateId}" not found or returned null`
                        };
                    }
                    
                    // Handle DocumentFragment vs Element
                    let html;
                    if (element.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                        // For DocumentFragment, create a temporary div to get HTML
                        const tempDiv = document.createElement('div');
                        tempDiv.appendChild(element.cloneNode(true));
                        html = tempDiv.innerHTML;
                    } else if (element.outerHTML) {
                        // For regular elements
                        html = element.outerHTML;
                    } else {
                        // Fallback for other node types
                        const tempDiv = document.createElement('div');
                        tempDiv.appendChild(element.cloneNode(true));
                        html = tempDiv.innerHTML;
                    }
                    
                    return {
                        success: true,
                        html: html,
                        available: true
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: error.message
                    };
                }
            }, {appName, templateId, data});
            
            return result;
        } catch (error) {
            return {
                success: false,
                error: `Evaluation failed: ${error.message}`
            };
        }
    }

    async listTemplates(appName) {
        if (!this.isInitialized || !this.page) {
            return { error: 'Template development service not initialized' };
        }

        try {
            console.log("loading templates for app: " + appName);
            const templates = await this.page.evaluate(async (appName) => {
                await window.templateService.loadTemplateFile(appName + "-templates.html");
                return window.templateService.listTemplates();
            }, appName);
            
            return {
                success: true,
                templates: templates
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to list templates: ${error.message}`
            };
        }
    }

    async reloadTemplates() {
        if (!this.isInitialized || !this.page) {
            return { error: 'Template development service not initialized' };
        }

        try {
            // Reload the page to pick up template changes
            await this.page.reload({ waitUntil: 'networkidle' });
            await this.page.waitForFunction(() => window.templateService, { timeout: 5000 });
            
            return {
                success: true,
                message: 'Templates reloaded successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to reload templates: ${error.message}`
            };
        }
    }

    setupRoutes(app) {
        // Single handler for template requests
        const handleTemplateRequest = (req, res) => {
            // Extract endpoint name from the URL path (e.g., "test" from "/templates/test")
            const endpointName = req.path.split('/templates/')[1];
            const handler = templateHandlers[endpointName];
            
            if (!handler) {
                return res.status(404).json({
                    success: false,
                    error: `Unknown template endpoint: ${endpointName}`
                });
            }
            
            handler(req, res);
        };

        // Register single wildcard handlers for each HTTP method
        app.get('/templates/*', normalizeTemplateParams, handleTemplateRequest);
        app.post('/templates/*', normalizeTemplateParams, handleTemplateRequest);
        app.put('/templates/*', normalizeTemplateParams, handleTemplateRequest);
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
            this.isInitialized = false;
        }
    }
}

// Create singleton instance
const templateDevService = new TemplateDevService();

// Parameter normalization middleware for template routes
const normalizeTemplateParams = (req, res, next) => {
    const data = {};
    
    // Start with POST/PUT body data (if any)
    if (req.body && typeof req.body === 'object') {
        Object.assign(data, req.body);
    }
    
    // Add URL query parameters
    if (req.query && typeof req.query === 'object') {
        for (const [key, value] of Object.entries(req.query)) {
            if (key.includes('.')) {
                // Split key on '.' to create nested object structure
                const keys = key.split('.');
                let current = data;
                
                // Navigate/create nested structure for all but the last key
                for (let i = 0; i < keys.length - 1; i++) {
                    const nestedKey = keys[i];
                    if (!current[nestedKey] || typeof current[nestedKey] !== 'object') {
                        current[nestedKey] = {};
                    }
                    current = current[nestedKey];
                }
                
                // Set the final value
                current[keys[keys.length - 1]] = value;
            } else {
                data[key] = value;
            }
        }
    }
    
    // Add call-method parameter for troubleshooting
    data['call-method'] = req.method;
    
    req.data = data;
    next();
};

function getAppName(req) {
    if (req.query && typeof req.query === 'object') {
        for (const [key, value] of Object.entries(req.query)) {
            if (key === 'app') { return value; }
        }
    }
    return "default";
}

// Handler map for different template endpoints
const templateHandlers = {
    test: async (req, res) => {
        const appName = getAppName(req);
        const { templateId, data } = req.data;
        
        if (!templateId) {
            return res.status(400).json({ 
                success: false, 
                error: 'templateId is required' 
            });
        }

        console.log("templateHandlers:test - req.data:" + JSON.stringify(req.data));

        const result = await templateDevService.testTemplate(appName, templateId, data || {});
        
        // Add setup instructions if service isn't initialized
        if (result.error && result.error.includes('not initialized')) {
            result.setupInstructions = [
                'To enable template testing:',
                '1. Install system dependencies: sudo apt-get install libnspr4 libnss3 libasound2',
                '2. Or run: sudo npx playwright install-deps',
                '3. Restart the backend service'
            ];
        }
        
        res.json(result);
    },

    list: async (req, res) => {
        const appName = getAppName(req);
        const result = await templateDevService.listTemplates(appName);
        res.json(result);
    },

    reload: async (req, res) => {
        const result = await templateDevService.reloadTemplates();
        res.json(result);
    },

    status: (req, res) => {
        res.json({
            initialized: templateDevService.isInitialized,
            available: process.env.NODE_ENV !== 'production'
        });
    }
};

module.exports = templateDevService;