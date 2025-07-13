function cloneElement(templateId) {
    const template = document.getElementById(templateId);
    if (!template) {
        console.error(`Template with id "${templateId}" not found`);
        return null;
    }
    return template.content.cloneNode(true);
}

const templateService = {
    templates: new Map(),

    async loadTemplateFile(filename) {
        try {
            const response = await fetch(`templates/${filename}`);
            const htmlText = await response.text();

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlText;

            // Process all children in document order
            Array.from(tempDiv.children).forEach(element => {
                if (element.tagName === 'TEMPLATE') {
                    // Add template to DOM for cloning
                    document.head.appendChild(element.cloneNode(true));
                } else if (element.tagName === 'SCRIPT') {
                    // Execute script in global context
                    eval(element.textContent);
                }
            });

        } catch (error) {
            console.error(`Failed to load template file ${filename}:`, error);
        }
    },

    getTemplate(id) {
        return this.templates.get(id);
    },

    newElement(id, data) {
        const templateFn = this.templates.get(id);
        if (!templateFn) {
            console.error(`Template "${id}" not found`);
            return null;
        }
        return templateFn(data);
    },

    register(id, templateFn) {
        this.templates.set(id, templateFn);
    }
};

window.templateService = templateService;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = templateService;
}