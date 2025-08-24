// Template utility functions
// Creates a global window.templateUtils object for use by template files

window.templateUtils = function() {
    function showIfVal(clone, name, val) {
        if (val) {
            const div = clone.querySelector(`div[name='${name}']`);
            if (div) {
                div.textContent = val;
                div.style.display = 'block';
            }
        }
    }
    
    function setInnerHtml(clone, name, html) {
        if (html) {
            const div = clone.querySelector(`div[name='${name}']`);
            if (div) {
                div.innerHTML = html;
                div.style.display = 'block';
            }
        }
    }
    
    return {
        showIfVal: showIfVal,
        setInnerHtml: setInnerHtml
    };
}();