//TODO: add in different overlay options/buttons.
//      Locations overlay
//      Nirnroots
//      Overlay for traveling salesmen result

//TODO: make it so that it zooms into middle of screen rather than top left corner?
//TODO: initImgs() can probably be refactored better.
let mapCanvasContext;
let canvas;
let wrapper;

let zoomLevel = 1;
let minZoom = 0.2;
let maxZoom = 3.5;
let mapX = 0;
let mapY = 0;

let mousedown = false;

let img_Map;

let icon_Ayleid;
let icon_Camp;
let icon_Cave;
let icon_Fort;
let icon_Gate;
let icon_Inn;
let icon_Settlement;
let icon_Mine; //still needs image
let icon_Landmark; //still needs image
let icon_Shrine; //still needs image

let locArr;

let debug = true; //makes iframe and guide small by default for map function testing.

function initMap(){
    //load map cord data
    fetch("data/locations.json").then(response => response.json()).then(response => locArr = response.elements);

    canvas = document.getElementById("canvas_Map");
    mapCanvasContext = canvas.getContext("2d");
    
    initImgs();
        
    //center map on imp city
    mapX = img_Map.width/2.1;
    mapY = img_Map.height/3.2;

    //Input listeners
    wrapper = document.getElementById("wrapper_Map");
    wrapper.onmousedown = function(){mousedown = true;};
    wrapper.onmouseup = function(){mousedown = false;};
    wrapper.onmouseout = function(){mousedown = false;};
    wrapper.onmousemove = function(e){if(mousedown){moveMap(e);}};
    wrapper.onwheel = function(e){zoomMap(e)};

    //attaches width to width of iframe
    window.addEventListener("mousemove", iFrameCheck);
}

function drawMap(){
    //maybe useful for placing icons.
    var aspectw = 443;
    var aspecth = 362;

    mapCanvasContext.drawImage(img_Map, mapX, mapY, (img_Map.width * zoomLevel), (img_Map.height * zoomLevel), 
                                    0, 0, img_Map.width, img_Map.height);
    //draw all map icons //TODO: add in overlay options
    for(let i = 0; i < locArr.length;i++){
        if(locArr[i].icon == "Ayleid") drawIcon(icon_Ayleid, locArr[i].approxX, locArr[i].approxY);
        else if(locArr[i].icon == "Camp") drawIcon(icon_Camp, locArr[i].approxX, locArr[i].approxY);
        else if(locArr[i].icon == "Cave") drawIcon(icon_Cave, locArr[i].approxX, locArr[i].approxY);
        else if(locArr[i].icon == "Fort") drawIcon(icon_Fort, locArr[i].approxX, locArr[i].approxY);
        else if(locArr[i].icon == "Gate") drawIcon(icon_Gate, locArr[i].approxX, locArr[i].approxY);
        else if(locArr[i].icon == "Inn") drawIcon(icon_Inn, locArr[i].approxX, locArr[i].approxY);
        else if(locArr[i].icon == "Landmark") drawIcon(icon_Landmark, locArr[i].approxX, locArr[i].approxY);
        else if(locArr[i].icon == "Mine") drawIcon(icon_Mine, locArr[i].approxX, locArr[i].approxY);
        else if(locArr[i].icon == "Settlement") drawIcon(icon_Settlement, locArr[i].approxX, locArr[i].approxY);
        else if(locArr[i].icon == "Shrine") drawIcon(icon_Shrine, locArr[i].approxX, locArr[i].approxY);
        else console.warn("Element at " + i +" has no icon.");
    }
}

//give x/y as reg in game cords.
function drawIcon(icon, iconX = 0.5, iconY = 0.5){
    var MapW = img_Map.width;
    var MapH = img_Map.height;
    var iconWH = 36 / zoomLevel;
    var worldW = 480000;
    var worldH = 400000;

    //convert worldspace loc to % loc
    iconX = (iconX + worldW / 2) / worldW;
    iconY = (-iconY + worldH / 2) / worldH;

    //apply % loc to map x/y
    mapCanvasContext.drawImage(icon, ((MapW * iconX) - mapX) / zoomLevel - iconWH, 
                                     ((MapH * iconY) - mapY) / zoomLevel - iconWH, iconWH, iconWH);
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

function zoomMap(event){
    event.preventDefault();
    if(event.deltaY > 0) zoomLevel += 0.2;
    else zoomLevel += -0.2;
    
    //TODO: make it so that it zooms into middle of screen rather than top left corner?

    //clamp zoom
    if(zoomLevel > maxZoom) zoomLevel = maxZoom;
    if(zoomLevel < minZoom) zoomLevel = minZoom;
    moveMap();
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
    
    //TODO: initImgs can probably be refactored better
    img_Map = document.createElement("img");
    img_Map.width = 3544;
    img_Map.height = 2895;
    img_Map.src = "images/Cyrodil_Upscaled.png";

    icon_Ayleid = document.createElement("IMG");
    icon_Ayleid.width = 48;
    icon_Ayleid.height = 48;
    icon_Ayleid.src = "images/Icon_Ayleid.png";

    icon_Camp = document.createElement("IMG");
    icon_Camp.width = 48;
    icon_Camp.height = 48;
    icon_Camp.src = "images/Icon_Camp.png";

    icon_Fort = document.createElement("IMG");
    icon_Fort.width = 48;
    icon_Fort.height = 48;
    icon_Fort.src = "images/Icon_Fort.png";

    icon_Gate = document.createElement("IMG");
    icon_Gate.width = 48;
    icon_Gate.height = 48;
    icon_Gate.src = "images/Icon_Gate.png";
    
    icon_Cave = document.createElement("IMG");
    icon_Cave.width = 48;
    icon_Cave.height = 48;
    icon_Cave.src = "images/Icon_Cave.png";

    icon_Inn = document.createElement("IMG");
    icon_Inn.width = 48;
    icon_Inn.height = 48;
    icon_Inn.src = "images/Icon_Inn.png";

    icon_Settlement = document.createElement("IMG");
    icon_Settlement.width = 48;
    icon_Settlement.height = 48;
    icon_Settlement.src = "images/Icon_Settlement.png";

    icon_Mine = document.createElement("IMG");
    icon_Mine.width = 48;
    icon_Mine.height = 48;
    icon_Mine.src = "images/Icon_Mine.png";

    icon_Landmark = document.createElement("IMG");
    icon_Landmark.width = 48;
    icon_Landmark.height = 48;
    icon_Landmark.src = "images/Icon_Landmark.png";

    icon_Shrine = document.createElement("IMG");
    icon_Shrine.width = 48;
    icon_Shrine.height = 48;
    icon_Shrine.src = "images/Icon_Shrine.png";
}