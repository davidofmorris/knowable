window.resizeService = function () {

    //
    // resizeBody() adjusts the panel's percent share of the screen
    //              based on the size of a <div id='dream' ...>.
    //
    // The panel body is sized based on the dimensions of the #dream element,
    // to wit: <div id="dream" style="font-size:larger;">d r e a m<br>d r e a m</div>
    //
    // The panel should be 11 wide by 8 high in terms of #dream's dimensions.
    // 

    function resizeBody() {
        const sizer = document.getElementById('sizer-table');
        const dream = document.getElementById('dream');
        const dreamBody = document.getElementById('dream-body');
        //
        // set max-width and max-height based on the dimentions of the #dream element
        // 
        sizer.style.display = 'block';
        const idealWidth = dream.offsetWidth * 11;
        const idealHeight = dream.offsetHeight * 8;
        const percentOfBodyWidth = 100 * idealWidth / window.innerWidth;
        const percentOfBodyHeight = 100 * idealHeight / window.innerHeight;
        dreamBody.style.width = `${percentOfBodyWidth}%`;
        dreamBody.style.height = `${percentOfBodyHeight}%`;
        sizer.style.display = 'none';
    }

    function init() {
        
        resizeBody();

        window.addEventListener('resize', function () {
            resizeBody();
        });
    }

    return {
        init: init
    }
}();
