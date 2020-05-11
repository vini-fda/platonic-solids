let sliderPos = window.innerWidth / 2;
let sliderMoved = false;
let img, img2;

function initComparisons() {

    var slider = document.querySelector( '.slider' );

    var clicked = false;

    function slideReady() {

        clicked = true;
        //controls.enabled = false;

    }

    function slideFinish() {

        clicked = false;
        //controls.enabled = true;

    }

    function slideMove( e ) {

        if ( ! clicked ) return false;

        sliderMoved = true;

        sliderPos = ( e.pageX === undefined ) ? e.touches[ 0 ].pageX : e.pageX;

        //prevent the slider from being positioned outside the window bounds
        if ( sliderPos < 0 ) sliderPos = 0;
        if ( sliderPos > window.innerWidth ) sliderPos = window.innerWidth;

        slider.style.left = sliderPos - ( slider.offsetWidth / 2 ) + "px";

        updateClipMask();

    }


    slider.addEventListener( 'mousedown', slideReady );
    slider.addEventListener( 'touchstart', slideReady );

    window.addEventListener( 'mouseup', slideFinish );
    window.addEventListener( 'touchend', slideFinish );

    window.addEventListener( 'mousemove', slideMove );
    window.addEventListener( 'touchmove', slideMove );

}

initComparisons()

let canvas = document.getElementById("logo");
let ctx = canvas.getContext("2d");
img = new Image();
img.src = "imgs/Depcult-fonte clara.png";
img.onload = function() {
    drawImageScaled(img, ctx);
}
img2 = new Image();
img2.src = "imgs/Depcult-BLK.png";


function updateClipMask() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    clipRect(0, 0, sliderPos, 5000);
    drawImageScaled(img, ctx);
    clipRect(sliderPos, 0, 50000, 50000);
    drawImageScaled(img2, ctx);
}


function drawImageScaled(img, ctx) {
    var canvas = ctx.canvas ;
    var hRatio = canvas.width  / img.width;
    var vRatio =  canvas.height / img.height;
    var ratio  = Math.max ( hRatio, vRatio );
    var centerShift_x = ( canvas.width - img.width*ratio ) / 2;
    var centerShift_y = ( canvas.height - img.height*ratio ) / 2;  
    //ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.drawImage(img, 0,0, img.width, img.height,
                       centerShift_x,centerShift_y,img.width*ratio, img.height*ratio); 
    //ctx.restore();
 }
function clipRect(x1, y1, x2, y2) {
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x1, y2);
    ctx.lineTo(x1, y1);
    ctx.closePath();

    /// define this Path as clipping mask
    ctx.clip();
}