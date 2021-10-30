let mapCanvasContext;
let img;
let canvas;

let zoomLevel = 1;
let minZoom = 0.1;
let maxZoom = 2;
let mapX = 0;
let mapY = 0;

let mousedown = false;

let debug = true; //makes iframe and guide small by default for map function testing.

function initMap(){
    canvas = document.getElementById("canvas_Map");
    mapCanvasContext = canvas.getContext("2d");
    
    img = document.createElement("img");
    img.width = 3544;
    img.height = 2895;
    img.src = "images/Cyrodil_Upscaled.png";
    img.onload = drawMap();

    //center map on imp city
    mapX = img.width/2.1;
    mapY = img.height/3.2;

    var wrpr = document.getElementById("wrapper_Map");
    wrpr.onmousedown = function(){mousedown = true;};
    wrpr.onmouseup = function(){mousedown = false;};
    wrpr.onmouseout = function(){mousedown = false;};
    wrpr.onmousemove = function(e){
        if(mousedown){
            moveMap(e);
        }
    };
    wrpr.onwheel = function(e){zoomMap(e)};

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
        var wrpr = document.getElementById("wrapper_Map");    
        var ifc = document.getElementById("iframeContainer");

        if(debug){
            ifc.style.width = "1000px";
            ifc.style.height = "25px";
            wrpr.style.height = "580px";
        }

        wrpr.style.width = ifc.clientWidth + "px";
        wrpr.style.top = (ifc.clientHeight + 48).toString() + "px";
    }
    drawMap();    
}

function drawMap(){
    //maybe useful for placing icons.
    var aspectw = 443;
    var aspecth = 362;

    mapCanvasContext.drawImage(img, mapX, mapY, (img.width * zoomLevel), (img.height * zoomLevel), 
                                    0, 0, img.width, img.height);
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
    if(mapX >= img.width - (wX * zoomLevel)) mapX = img.width - (wX * zoomLevel);
    if(mapY >= img.height - (wY * zoomLevel)) mapY = img.height - (wY * zoomLevel);

    drawMap();
}

function zoomMap(event){
    if(event.deltaY > 0) zoomLevel += 0.2;
    else zoomLevel -= 0.2;

    //clamp zoom
    if(zoomLevel > maxZoom) zoomLevel = maxZoom;
    if(zoomLevel < minZoom) zoomLevel = minZoom;
    moveMap();
}