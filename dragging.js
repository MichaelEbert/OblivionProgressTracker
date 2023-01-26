/*
 *	Dragging guide divider stuff
 *  Source: https://htmldom.dev/create-resizable-split-views/
 */

// Query the element
const resizer = document.getElementById('dragMe');
const leftSide = resizer.previousElementSibling;
const rightSide = resizer.nextElementSibling;

// The current position of mouse
let x = 0;
let y = 0;

// Width of left side
let leftWidth = 0;
leftSide.style.width = optimizeWidth(); //Set a good looking default width each time the page loads.

// Handle the mousedown event
// that's triggered when user drags the resizer
const mouseDownHandler = function (e) {
    // Get the current mouse position
    x = e.clientX;
    y = e.clientY;
    leftWidth = leftSide.getBoundingClientRect().width;

    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
};

// Attach the handler
resizer.addEventListener('mousedown', mouseDownHandler);

const mouseMoveHandler = function (e) {
    // How far the mouse has been moved
    const dx = e.clientX - x;
    const dy = e.clientY - y;

    const newLeftWidth = ((leftWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
    leftSide.style.width = `${newLeftWidth}%`;

	resizer.style.cursor = 'col-resize';
	document.body.style.cursor = 'col-resize';

	leftSide.style.userSelect = 'none';
    leftSide.style.pointerEvents = 'none';

    rightSide.style.userSelect = 'none';
    rightSide.style.pointerEvents = 'none';
};

const mouseUpHandler = function () {
    resizer.style.removeProperty('cursor');
    document.body.style.removeProperty('cursor');

    leftSide.style.removeProperty('user-select');
    leftSide.style.removeProperty('pointer-events');

    rightSide.style.removeProperty('user-select');
    rightSide.style.removeProperty('pointer-events');

    // Remove the handlers of `mousemove` and `mouseup`
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
};

//takes the user's screen dimensions and type of page (guide or nirnroute currently) and generates the best starting width.
//NEEDS TO RETURN A STRING.
function optimizeWidth(){
    let page = location.pathname.split("/").slice(-1);
    let width = "";
    //We can add a check in here to skip the automatic optimizations if iframeWidth setting has a value now.

    //Automatic widths if no settings for iframeWidth exist.
    if(page == "nirnroute.html"){
        width = "67.5%"; //Currently only good for a 1920x1080 aspect ratio, will make better later.
    }
    else if(page == "speedrun-4.html" || page == "speedrun.html"){ //TODO: Get rid of speedrun-4 check when merged into the version with redirect pages.
        width = "55%"; //Currently only good for a 1920x1080 aspect ratio, will make better later.
    }
    else {
        width = "65%"; //a generally decent looking default.
    }
    return width;
}
