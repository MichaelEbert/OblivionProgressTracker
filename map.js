let mapCanvasContext;
let canvas;
let wrapper;

let zoomLevel = 1;
let minZoom = 0.2;
let maxZoom = 3.5;
let mapX = 0;
let mapY = 0;

let mousedown = false;

let imgElem_Map;
let testIcon;

let debug = true; //makes iframe and guide small by default for map function testing.

function initMap(){
    canvas = document.getElementById("canvas_Map");
    mapCanvasContext = canvas.getContext("2d");
    
    imgElem_Map = document.createElement("img");
    imgElem_Map.width = 3544;
    imgElem_Map.height = 2895;
    imgElem_Map.src = "images/Cyrodil_Upscaled.png";

    testIcon = document.createElement("IMG");
    testIcon.width = 48;
    testIcon.height = 48;
    testIcon.src = "leyawiin_html_391c730c90a3a992.png";
    testIcon.onload = drawMap();

    //center map on imp city
    mapX = imgElem_Map.width/2.1;
    mapY = imgElem_Map.height/3.2;

    wrapper = document.getElementById("wrapper_Map");
    wrapper.onmousedown = function(){mousedown = true;};
    wrapper.onmouseup = function(){mousedown = false;};
    wrapper.onmouseout = function(){mousedown = false;};
    wrapper.onmousemove = function(e){
        if(mousedown){
            moveMap(e);
        }
    };
    wrapper.onwheel = function(e){zoomMap(e)};

    //attaches width to width of iframe
    window.addEventListener("mousemove", iFrameCheck);
}
 
//attaches width to width of iframe
function iFrameCheck(){
    if(document.getElementById("iframeContainer")){
        document.getElementById("iframeContainer").onclick = resizeMap;
        window.removeEventListener("mousemove", iFrameCheck); //trim listener, it's served it's purpose.
        resizeMap();
    }
}

//matches width of map to Iframe width
function resizeMap(){
    if(document.getElementById("iframeContainer")){
        var ifc = document.getElementById("iframeContainer");

        if(debug){
            ifc.style.width = "1000px";
            ifc.style.height = "25px";
            wrapper.style.height = "580px";
        }

        wrapper.style.width = ifc.clientWidth + "px";
        wrapper.style.top = (ifc.clientHeight + 48).toString() + "px";
    }
    drawMap();    
}

function drawMap(){
    //maybe useful for placing icons.
    var aspectw = 443;
    var aspecth = 362;

    mapCanvasContext.drawImage(imgElem_Map, mapX, mapY, (imgElem_Map.width * zoomLevel), (imgElem_Map.height * zoomLevel), 
                                    0, 0, imgElem_Map.width, imgElem_Map.height);
    //draw icons
    drawIcon(0.5, 0.5);
}

function moveMap(event){
    //increment based on mouse movement
    if(event){
        mapX -= event.movementX * zoomLevel;
        mapY -= event.movementY * zoomLevel;
    }
    
    //clamp values to prevent moving map off screen.
    if(mapX < 0) mapX = 0;
    if(mapY < 0) mapY = 0;
    var wStyle = document.getElementById("wrapper_Map").style;
    var wX = wStyle.width.slice(0,wStyle.width.length-2);
    var wY = wStyle.height.slice(0,wStyle.height.length-2);
    if(mapX >= imgElem_Map.width - (wX * zoomLevel)) mapX = imgElem_Map.width - (wX * zoomLevel);
    if(mapY >= imgElem_Map.height - (wY * zoomLevel)) mapY = imgElem_Map.height - (wY * zoomLevel);

    drawMap();
}

function zoomMap(event){
    event.preventDefault();
    if(event.deltaY > 0) zoomLevel += 0.2;
    else zoomLevel += -0.2;
    
    //TODO: make it so that it zooms into middle of screen rather than top left corner

    //clamp zoom
    if(zoomLevel > maxZoom) zoomLevel = maxZoom;
    if(zoomLevel < minZoom) zoomLevel = minZoom;
    console.log(zoomLevel);
    moveMap();
}

function drawIcon(iconX = 0, iconY = 0){

    var MapW = imgElem_Map.width;
    var MapH = imgElem_Map.height;

    mapCanvasContext.drawImage(testIcon, ((MapW * iconX) - mapX) / zoomLevel, ((MapH * iconY) - mapY) / zoomLevel, 24 / zoomLevel, 24 / zoomLevel);
}