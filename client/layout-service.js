//
// layout service
//
import templateService from './template-service.js';

// Panel layout cache
var cachedLayout = null;

async function init() {
    await templateService.loadTemplateFile('panel-layout.html');
    cachedLayout = templateService.newElement('panel-layout');
}

function getLayout() {
    return cachedLayout.cloneNode(true);
}

export default {
    init,
    getLayout
}
