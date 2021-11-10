//TODO: Random Gates overlay?

//TODO: Get a nirnroot icon

//TODO: make it so that it zooms into middle of screen rather than top left corner?

//TODO: figure out how discovered locations are tracked and implement it.

let ctx;
let canvas;

/**
 * The element that contains the canvas. We can use this to query for how much of the canvas the user can see.
 */
let viewport;

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
let hoverLocation = "";
let nirnArr;

let debug = false; //makes iframe and guide small by default for map function testing.
let discovered = false;//to see how it looks when a place is discovered, change this to true.

async function initMap(){
    //load map cord data
    await fetch("data/locations.json").then(response => response.json()).then(response => locArr = response.elements);
    await fetch("data/nirnroots.json").then(response => response.json()).then(response => nirnArr = response.elements);
    
    

    //TODO: create window here
    //TODO: do hide n seek stuff

    canvas = document.getElementById("canvas_Map");
    viewport = document.getElementById("wrapper_Map");
    ctx = canvas.getContext("2d");
    
    await initImgs();
    initListeners();

    //center map on imp city
    mapX = 1700;
    mapY = 885;

    drawMap();
}

function drawMap(){
    //main map image.
    ctx.drawImage(img_Map, mapX, mapY, (img_Map.width * zoomLevel), (img_Map.height * zoomLevel), 
                                    0, 0, img_Map.width, img_Map.height);

    //Overlay Else if chain
    if(currentOverlay == "Locations"){
        let hloc = -1; //tracks hovered location index to redraw it last.
        for(let i = 0; i < locArr.length;i++){
            drawIcon(iconSwitch(locArr[i].icon), locArr[i]);

            if(hoverLocation && locArr[i].formid == hoverLocation){
                hloc = i;
            }
            
            //last icon in array was just drawn, so redraw hovered icon so it appears on top of everything else.
            if(i == locArr.length - 1 && hloc > 0){
                drawIcon(iconSwitch(locArr[hloc].icon), locArr[hloc]);
            }
        }
    }
    else if(currentOverlay == "NirnRoute"){
        for(let i = 0; i < nirnArr.length;i++){
            if(nirnArr[i].cell == "Outdoors"){ //some nirnroots are indoors, therefore we only draw outdoor nirnroots.
                //TODO: Get a nirnroot icon
                drawIcon(iconSwitch("Camp"),(nirnArr[i])); 
            }
        }
    }
    else if(currentOverlay == "Exploration"){
        //traveling salesmen overlay.
        var x = viewport.width;
        var y = viewport.height;

        ctx.beginPath();
        ctx.fillStyle = "#FBEFD5";
        ctx.rect(x/2 - 125, y/2 - 75, 250, 150);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "#E5D9B9";
        ctx.rect(x/2 - 100, y/2 - 50, 200, 100);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.font = "16px Arial";
        ctx.fillText("Not yet implemented. :(", x/2 , y/2);
        ctx.fill();
    }
    
    drawOverlay();
}

//give x/y as regular in game cords.
function drawIcon(icon, locObj){
    
    var canvasCords = worldSpaceToCanvasSpace(locObj.x, locObj.y);

    //draws the label for the map icon if hovered.
    if(hoverLocation == locObj.formid){
        ctx.beginPath();
        ctx.fillStyle = "#E5D9B9";
        ctx.rect(canvasCords.x, canvasCords.y, (locObj.name.length * 10) + canvasCords.iconH, canvasCords.iconH);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.font = "16px Monospace";
        ctx.fillText(locObj.name, canvasCords.x + canvasCords.iconH, canvasCords.y + canvasCords.iconH/2);
        ctx.fill();
    }

    ctx.drawImage(icon, canvasCords.x, canvasCords.y, canvasCords.iconH, canvasCords.iconH);
    
    if(discovered){
        ctx.drawImage(icons.Check, canvasCords.x, canvasCords.y, canvasCords.iconH, canvasCords.iconH);
    }
}

//this is the "topbar" on the map canvas.
function drawOverlay(){
    let wX = viewport.width;
    let wY = viewport.height;

    //overlay background
    ctx.beginPath();
    ctx.fillStyle = "#FBEFD5";
    ctx.rect(0,0, wX,32);
    ctx.fill();

    //drawing buttons should be refactored better if we need more overlay buttons.

    //overlay buttons
        //locations
    ctx.beginPath();
    if(hoverOverlayButton == 1) ctx.fillStyle = "#ccc";
    else ctx.fillStyle = "#E5D9B9";
    ctx.rect(8, 6, wX/3, 20);
    ctx.fill();

        //nirnroute
    ctx.beginPath();
    if(hoverOverlayButton == 2) ctx.fillStyle = "#ccc";
    else ctx.fillStyle = "#E5D9B9";
    ctx.rect(wX/3, 6, wX/3, 20);
    ctx.fill();

        //exploration
    ctx.beginPath();
    if(hoverOverlayButton == 3) ctx.fillStyle = "#ccc";
    else ctx.fillStyle = "#E5D9B9";
    ctx.rect(wX/3*2, 6, wX/3 - 8, 20);
    ctx.fill();

    //overlay button dividers.
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.rect(wX/3, 6, 1, 20);
    ctx.rect(wX/3*2, 6, 1, 20);
    ctx.fill();

    //overlay button text
    ctx.beginPath();
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = "16px Arial"
    ctx.fillText("Locations", wX/6 + 8, 22);
    ctx.fillText("NirnRoute", wX/2, 22);
    ctx.fillText("Exploration", wX/6*5 - 8, 22);
}

function moveMap(event){
    //increment based on mouse movement
    if(event){
        mapX -= event.movementX * zoomLevel;
        mapY -= event.movementY * zoomLevel;
    }
    
    //clamp values to prevent moving map off screen. //bottom clamp isn't perfect :\
    if(mapX < 0) mapX = 0;
    if(mapY < 0) mapY = 0;
    if(mapX >= img_Map.width - (viewport.width * zoomLevel)) mapX = img_Map.width - (viewport.width * zoomLevel);
    if(mapY >= img_Map.height - (viewport.height * zoomLevel)) mapY = img_Map.height - (viewport.height * zoomLevel);

    drawMap();
}

async function initImgs(){
    return new Promise((resolve, reject) =>{
        img_Map = document.createElement("img");
        img_Map.width = 3544;
        img_Map.height = 2895;
        img_Map.src = "images/Cyrodil_Upscaled.png";
        img_Map.onload = function(){
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
                "Check",
                "X"
            ];
        
            iconsToInit.forEach(function(i){
                icons[i] = document.createElement("IMG");
                icons[i].width = 48;
                icons[i].height = 48;
                icons[i].src = "images/Icon_" + i + ".png";
                }
            )
            resolve();
        };

        img_Map.onerror = function(){
            reject(this);
        };  
    });
}

function initListeners(){
    //Input listeners
    viewport.onmousedown = function(){
        if(hoverOverlayButton != 0){
            if(hoverOverlayButton == 1) currentOverlay = "Locations";
            if(hoverOverlayButton == 2) currentOverlay = "NirnRoute";
            if(hoverOverlayButton == 3) currentOverlay = "Exploration";
            drawMap();
        }
        else mousedown = true;
    };
    viewport.onmouseup = function(){
        mousedown = false;
        resizeMap()
    };
    viewport.onmouseout = function(){mousedown = false;};
    viewport.onmousemove = function(e){
        if(mousedown){moveMap(e);}
        
        //Overlay mouseover
        if(e.offsetY >= 10  && e.offsetY <= 20){
            var x = viewport.width;
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
                for(let i = 0; i < locArr.length;i++){
                    
                    let cCords = worldSpaceToCanvasSpace(locArr[i].x, locArr[i].y);

                    if(cCords.x < e.offsetX &&
                        cCords.x + cCords.iconH > e.offsetX &&
                        cCords.y < e.offsetY &&
                        cCords.y + cCords.iconH > e.offsetY){
                            hoverLocation = locArr[i].formid;
                            drawMap();
                            break;
                    }
                    if(i == locArr.length - 1){
                        hoverLocation= "";
                        drawMap();
                    }
                }
            }
            //End mouseover icon
        }
    };
    viewport.onwheel = function(e){    
        e.preventDefault();
        if(e.deltaY > 0) zoomLevel += 0.2;
        else zoomLevel += -0.2;
        
        //TODO: make it so that it zooms into middle of screen rather than top left corner?

        //clamp zoom
        if(zoomLevel > maxZoom) zoomLevel = maxZoom;
        if(zoomLevel < minZoom) zoomLevel = minZoom;
        moveMap();
    };
}

//converts worldspace cords into relative canvas cords.
//returns object{x,y} for canvas space.
function worldSpaceToCanvasSpace(x = 0, y = 0){
    var MapW = img_Map.width;
    var MapH = img_Map.height;
    var worldW = 480000;
    var worldH = 400000;

    x = (Math.round(x) + worldW / 2) / worldW;
    y = (-Math.round(y) + worldH / 2) / worldH;

    var iconH = 20 / zoomLevel;
    if(zoomLevel > 1.75)iconH = 20 / zoomLevel * 2;
    else if(zoomLevel > 1.5)iconH = 20 / zoomLevel * 1.5;
    else if(zoomLevel > 1.25)iconH = 20 / zoomLevel * 1.25;

    var x = ((MapW * x) - mapX) / zoomLevel - iconH;
    var y = ((MapH * y) - mapY) / zoomLevel - iconH;
    return {x:x, y:y, iconH:iconH}
}

function iconSwitch(Input){
    switch (Input) {
        case "Ayleid":return icons.Ayleid;
        case "Camp": return icons.Camp;
        case "Cave": return icons.Cave;
        case "Fort": return icons.Fort;
        case "Gate": return icons.Gate;
        case "Inn": return icons.Inn;
        case "Landmark": return icons.Landmark;
        case "Mine": return icons.Mine;
        case "Settlement": return icons.Settlement;
        case "Shrine": return icons.Shrine;
            
        default: 
            console.warn("Element has invalid iconname: " + Input + ".");
            return icons.X;
    }
}