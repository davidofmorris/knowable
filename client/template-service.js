const templates = new Map();

const util = {
    parseHtml: parseHtml
}

const api = {
    loadTemplateFile:loadTemplateFile,
    listTemplates:listTemplates,
    getTemplate:getTemplate,
    newElement:newElement,
    register:register,
    util:util
};

async function loadTemplateFile(filename) {
    window.templateService = api;
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
}

function listTemplates() {
    var out = "";
    for (const [k,v] of templates) {
        out += k + ', ';
    }
    return out;
}

function getTemplate(id) {
    return templates.get(id);
}

function newElement(id, data) {
    const templateFn = templates.get(id);
    if (!templateFn) {
        console.error(`Template "${id}" not found`);
        return null;
    }
    return templateFn(data);
}

function register(id, templateFn) {
    console.log("*** REGISTER: " + id);
    templates.set(id, templateFn);
    console.log("templates.get(id): " + templates.get(id));
}

function parseHtml(html) {
    const bench = document.createElement("div");
    bench.innerHTML = html;
    return bench.children[0];
}

export default api;

