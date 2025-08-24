// gridService
/*
    Depends on the following CSS in `panel-layout.html`
        td.show-grid {
            border: 1px solid lightgrey !important;
        }

*/

var showGrid = false; // off
function isShowGrid() { return showGrid; }
function refreshGrid() {
    const elementsToClean = document.querySelectorAll('td.flow');
    elementsToClean.forEach(element => {
        if (showGrid) {
            element.classList.add('show-grid');
        } else {
            element.classList.remove('show-grid');
        }
    });
}

function toggleGrid() {
    showGrid = !showGrid;
    refreshGrid();
}

export default {
    isShowGrid,
    refreshGrid,
    toggleGrid
}
