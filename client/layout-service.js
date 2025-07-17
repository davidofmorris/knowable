//
// layout service
//
window.layoutService = function () {

    // Panel layout cache
    var cachedLayout = null;

    async function init() {
        await window.templateService.loadTemplateFile('panel-layout.html');
        cachedLayout = window.templateService.newElement('panel-layout');
    }

    function getLayout() {
        return cachedLayout.cloneNode(true);
    }

    return {
        init: init,
        getLayout: getLayout
    }
}();
