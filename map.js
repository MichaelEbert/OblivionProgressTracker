//      Random Gates overlay?

//TODO: make it so that it zooms into middle of screen rather than top left corner?

//TODO: refactor some intialization.
// iframe
// canvas

//TODO: figure out how locations are tracked and implement it.

//CTODO: Add location name line 214


let mapCanvasContext;
let canvas;
let wrapper;

let zoomLevel = 1;
let minZoom = 0.2;
let maxZoom = 3.5;
let mapX = 0;
let mapY = 0;
let currentOverlay = "Locations"; // Locations, NirnRoute, Exploration.
let hoverOverlayButton = 0;

let mousedown = false;

let img_Map;
let icons = {};

let locArr;
let nirnArr;

let debug = true; //makes iframe and guide small by default for map function testing.
var discovered = false;//to see how it looks when a place is discovered, change this to true.

function initMap(){
    //load map cord data
    fetch("data/locations.json").then(response => response.json()).then(response => locArr = response.elements);
    fetch("data/nirnroots.json").then(response => response.json()).then(response => nirnArr = response.elements);

    canvas = document.getElementById("canvas_Map");
    mapCanvasContext = canvas.getContext("2d");
    
    initImgs();
        
    //center map on imp city
    mapX = img_Map.width/2.1;
    mapY = img_Map.height/3.2;

    //Input listeners
    wrapper = document.getElementById("wrapper_Map");
    wrapper.onmousedown = function(e){
        if(hoverOverlayButton != 0){
            if(hoverOverlayButton == 1) currentOverlay = "Locations";
            if(hoverOverlayButton == 2) currentOverlay = "NirnRoute";
            if(hoverOverlayButton == 3) currentOverlay = "Exploration";
            drawMap();
        }
        else mousedown = true;
    };
    wrapper.onmouseup = function(){mousedown = false;};
    wrapper.onmouseout = function(){mousedown = false;};
    wrapper.onmousemove = function(e){
        if(mousedown){moveMap(e);}
        
        //Overlay mouseover
        if(e.offsetY >= 10  && e.offsetY <= 20){
            var x = document.getElementById("wrapper_Map").style.width.slice(0,document.getElementById("wrapper_Map").style.width.length-2);
            if(e.offsetX >= 8 && e.offsetX <= x/3 - 1){
                hoverOverlayButton = 1;
                drawOverlay();
            }
            if(e.offsetX >= x/3 && e.offsetX <= x/3*2 - 1){
                hoverOverlayButton = 2;
                drawOverlay();
            }
            if(e.offsetX >= x/3*2 && e.offsetX <= x - 8){
                hoverOverlayButton = 3;
                drawOverlay();
            }
        } else{
            var redraw = false;//should prevent useless redraws of the overlay when just scrolling.
            if(hoverOverlayButton != 0){
                redraw = true;
            }

            hoverOverlayButton = 0;

            if(redraw){
                drawOverlay();
            }
            //End Overlay mouseover

            //mouseover icon
            

            if(locArr && !mousedown && currentOverlay == "Locations"){
                locArr.forEach(element => {
                    let cCords = worldSpaceToCanvasSpace(element.x, element.y);

                    if(cCords.x < e.offsetX &&
                        cCords.x + cCords.wh > e.offsetX &&
                        cCords.y < e.offsetY &&
                        cCords.y + cCords.wh > e.offsetY){
                        console.log("yes, " + element.name);
                        console.log(cCords.x + '' + cCords.y)
                    }

                });
            }
            //End mouseover icon
        }
    };
    wrapper.onwheel = function(e){    
        e.preventDefault();
        if(e.deltaY > 0) zoomLevel += 0.2;
        else zoomLevel += -0.2;
        
        //TODO: make it so that it zooms into middle of screen rather than top left corner?
    
        //clamp zoom
        if(zoomLevel > maxZoom) zoomLevel = maxZoom;
        if(zoomLevel < minZoom) zoomLevel = minZoom;
        moveMap();
    };

    //attaches width to width of iframe
    window.addEventListener("mousemove", iFrameCheck);
}

function drawMap(){
    mapCanvasContext.drawImage(img_Map, mapX, mapY, (img_Map.width * zoomLevel), (img_Map.height * zoomLevel), 
                                    0, 0, img_Map.width, img_Map.height);

    if(currentOverlay == "Locations"){
        for(let i = 0; i < locArr.length;i++){
            if(locArr[i].icon == "Ayleid") drawIcon(icons.Ayleid, locArr[i].x, locArr[i].y, locArr[i].name);
            else if(locArr[i].icon == "Camp") drawIcon(icons.Camp, locArr[i].x, locArr[i].y, locArr[i].name);
            else if(locArr[i].icon == "Cave") drawIcon(icons.Cave, locArr[i].x, locArr[i].y, locArr[i].name);
            else if(locArr[i].icon == "Fort") drawIcon(icons.Fort, locArr[i].x, locArr[i].y, locArr[i].name);
            else if(locArr[i].icon == "Gate") drawIcon(icons.Gate, locArr[i].x, locArr[i].y, locArr[i].name);
            else if(locArr[i].icon == "Inn") drawIcon(icons.Inn, locArr[i].x, locArr[i].y, locArr[i].name);
            else if(locArr[i].icon == "Landmark") drawIcon(icons.Landmark, locArr[i].x, locArr[i].y, locArr[i].name);
            else if(locArr[i].icon == "Mine") drawIcon(icons.Mine, locArr[i].x, locArr[i].y, locArr[i].name);
            else if(locArr[i].icon == "Settlement") drawIcon(icons.Settlement, locArr[i].x, locArr[i].y, locArr[i].name);
            else if(locArr[i].icon == "Shrine") drawIcon(icons.Shrine, locArr[i].x, locArr[i].y, locArr[i].name);
            else console.warn("Element at " + i +" has no icon."); //catch all in case something changes.

            //figure out where to draw names or check for mouse over icon and draw it's name.
            mapCanvasContext.beginPath();
            mapCanvasContext.fillStyle = "black";
            mapCanvasContext.textAlign = "center";
            mapCanvasContext.font = "16px Arial";
            mapCanvasContext.fillText(locArr[i].name, locArr[i].x, locArr[i].y);
            mapCanvasContext.fill();
        }
    }
    if(currentOverlay == "NirnRoute"){
        for(let i = 0; i < nirnArr.length;i++){
            if(nirnArr[i].cell == "Outdoors"){
                drawIcon(icons.Camp, Math.round(nirnArr[i].x), Math.round(nirnArr[i].y));
            }
        }
    }
    if(currentOverlay == "Exploration"){
        var x = document.getElementById("wrapper_Map").style.width.slice(0,document.getElementById("wrapper_Map").style.width.length-2);
        var y = document.getElementById("wrapper_Map").style.height.slice(0,document.getElementById("wrapper_Map").style.height.length-2);

        mapCanvasContext.beginPath();
        mapCanvasContext.fillStyle = "#FBEFD5";
        mapCanvasContext.rect(x/2 - 125, y/2 - 75, 250, 150);
        mapCanvasContext.fill();

        mapCanvasContext.beginPath();
        mapCanvasContext.fillStyle = "#E5D9B9";
        mapCanvasContext.rect(x/2 - 100, y/2 - 50, 200, 100);
        mapCanvasContext.fill();

        mapCanvasContext.beginPath();
        mapCanvasContext.fillStyle = "black";
        mapCanvasContext.textAlign = "center";
        mapCanvasContext.font = "16px Arial";
        mapCanvasContext.fillText("Not yet implemented. :(", x/2 , y/2);
        mapCanvasContext.fill();
    }
    
    drawOverlay();
}

//give x/y as reg in game cords.
function drawIcon(icon, iconX = 0.5, iconY = 0.5){
    
    var canvasCords = worldSpaceToCanvasSpace(iconX, iconY);

    mapCanvasContext.drawImage(icon, canvasCords.x, canvasCords.y, canvasCords.wh, canvasCords.wh);
    
    if(discovered){
        mapCanvasContext.drawImage(icons.Check, canvasCords.x, canvasCords.y, canvasCords.wh, canvasCords.wh);
    }
}

function drawOverlay(){
    var wStyle = document.getElementById("wrapper_Map").style;
    var wX = wStyle.width.slice(0,wStyle.width.length-2);
    var wY = wStyle.height.slice(0,wStyle.height.length-2);

    //overlay background
    mapCanvasContext.beginPath();
    mapCanvasContext.fillStyle = "#FBEFD5";
    mapCanvasContext.rect(0,0, wX,32);
    mapCanvasContext.fill();

    //drawing buttons could definatly be refactored better if we need more overlays.

    //overlay buttons
    mapCanvasContext.beginPath();
    if(hoverOverlayButton == 1) mapCanvasContext.fillStyle = "#ccc";
    else mapCanvasContext.fillStyle = "#E5D9B9";
    mapCanvasContext.rect(8, 6, wX/3, 20);
    mapCanvasContext.fill();

    mapCanvasContext.beginPath();
    if(hoverOverlayButton == 2) mapCanvasContext.fillStyle = "#ccc";
    else mapCanvasContext.fillStyle = "#E5D9B9";
    mapCanvasContext.rect(wX/3, 6, wX/3, 20);
    mapCanvasContext.fill();

    mapCanvasContext.beginPath();
    if(hoverOverlayButton == 3) mapCanvasContext.fillStyle = "#ccc";
    else mapCanvasContext.fillStyle = "#E5D9B9";
    mapCanvasContext.rect(wX/3*2, 6, wX/3 - 8, 20);
    mapCanvasContext.fill();

    //overlay button dividers.
    mapCanvasContext.beginPath();
    mapCanvasContext.fillStyle = "black";
    mapCanvasContext.rect(wX/3, 6, 1, 20);
    mapCanvasContext.rect(wX/3*2, 6, 1, 20);
    mapCanvasContext.fill();

    //overlay button text
    mapCanvasContext.beginPath();
    mapCanvasContext.textAlign = "center";
    mapCanvasContext.font = "16px Arial"
    mapCanvasContext.fillText("Locations", wX/6 + 8, 22);
    mapCanvasContext.fillText("NirnRoute", wX/2, 22);
    mapCanvasContext.fillText("Exploration", wX/6*5 - 8, 22);
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
    if(mapX >= img_Map.width - (wX * zoomLevel)) mapX = img_Map.width - (wX * zoomLevel);
    if(mapY >= img_Map.height - (wY * zoomLevel)) mapY = img_Map.height - (wY * zoomLevel);

    drawMap();
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

function initImgs(){
    
    img_Map = document.createElement("img");
    img_Map.width = 3544;
    img_Map.height = 2895;
    img_Map.src = "images/Cyrodil_Upscaled.png";

    
    var iconsToInit = [
        "Ayleid",
        "Camp",
        "Fort",
        "Gate",
        "Cave",
        "Inn",
        "Settlement",
        "Mine",
        "Landmark",
        "Shrine",
        "Check"
    ];

    iconsToInit.forEach(function(i){
        icons[i] = document.createElement("IMG");
        icons[i].width = 48;
        icons[i].height = 48;
        icons[i].src = "images/Icon_" + i + ".png";
        }
    )
}

//converts worldspace cords into relative canvas cords.
//returns object{x,y} for canvas space.
function worldSpaceToCanvasSpace(x = 0, y = 0){
    var MapW = img_Map.width;
    var MapH = img_Map.height;

    var worldW = 480000;
    var worldH = 400000;

    x = (x + worldW / 2) / worldW;
    y = (-y + worldH / 2) / worldH;

    var wh = 20 / zoomLevel;
    if(zoomLevel > 1.25){
        wh = 20 / zoomLevel * 1.25;
    }
    if(zoomLevel > 1.5){
        wh = 20 / zoomLevel * 1.5;
    }
    if(zoomLevel > 1.75){
        wh = 20 / zoomLevel * 2;
    }

    var x = ((MapW * x) - mapX) / zoomLevel - wh;
    var y = ((MapH * y) - mapY) / zoomLevel - wh;
    return {x:x, y:y, wh:wh}
}