//TODO: get topbar percentage working on map.js
//TODO: add in the gates to the fame section. Because we need the fame and the discovery separately.

"use strict";
export {initMap, mapAdjust, worldSpaceToMapSpace, mapSpaceToWorldSpace, mapSpaceToScreenSpace, iconH, iconSwitch, icons, getOverlay, getCtx, updateRandomGateCount, getRandomGateCount};

import {Point} from "./map/point.mjs";
import {MapObject,MapIcon} from "./map/mapObject.mjs";
import { MapPOI } from "./map/mapObject.mjs";

/**
 * The element that contains the canvas. We can use this to query for how much of the canvas the user can see.
 */
let viewport;
let canvas;
let ctx;
function getCtx(){
    return ctx;
}

let zoomLevel = 1;
let minZoom = 0.2;
let maxZoom = 3.5;

let mapAdjust = {
    preX: -2437,
    preY: 2265,
    postX: 0,
    postY: 0,
    width: 0,
    height: 0
}

/**
 * Offset from map to screen coordinates.
 */
let screenOriginInMapCoords = new Point(0,0);
let _iconH = 20;
function iconH(){return _iconH;};
let currentOverlay = "Locations"; // Locations, NirnRoute
let showTSP = false;

let randomGateCount = 0;
function getRandomGateCount(){
    return randomGateCount;
}
function updateRandomGateCount(Found){
    if(Found){
        randomGateCount++;
    }
    else{
        randomGateCount--;
    }

    if(randomGateCount >= 40){
        document.getElementById("randomGateCount").innerText = getRandomGateCount() + "✔";
        document.getElementById("randomGateCount").style = "color:green";
    }
    else{
        document.getElementById("randomGateCount").innerText = getRandomGateCount();    
        document.getElementById("randomGateCount").style = "color:black";
    }
}
function initRandomGateCount(){
    //Init randomGateCount. 
    let root = window.findOnTree(window.jsondata.location, x=>x.name == "Random Gates", y=>y.name == "Random Gates" || y.elements == null)
    let completed = window.sumCompletionItems(root);
    randomGateCount = completed[0];

    if(randomGateCount >= 40){
        document.getElementById("randomGateCount").innerText = randomGateCount + "✔";
        document.getElementById("randomGateCount").style = "color:green";
    }
    else{
        document.getElementById("randomGateCount").innerText = randomGateCount;
    }
}

//image objects
let overlay;
function getOverlay(){
    return overlay;
}

/**
 * Last position of the mouse. used for rendering mouseover stuff.
 */
var lastMouseLoc = new Point(0,0);

let img_Map;
let icons = {};

async function initMap(){
    //load map cord data
    let windowParams = new URLSearchParams(window.location.search);
    if(windowParams.get("topbar") == "false"){
        //TODO: put this in css files
        document.getElementById("topbar").remove();
        let mapContainer = document.getElementById("mapContainer");
        if(mapContainer != null){
            mapContainer.style = "top:0;padding:2px;"
        }
    }

    viewport = document.getElementById("wrapper_Map");

    canvas = document.createElement("CANVAS");
    canvas.id = "canvas_Map";
    canvas.width = 3544;
    canvas.height = 2895;
    viewport.appendChild(canvas);
    ctx = canvas.getContext("2d");
    initImgs().then(()=>{
        initOverlay();
        initListeners();
        initRandomGateCount()

        screenOriginInMapCoords = new Point(0,0);
        zoomToInitialLocation();

        drawFrame();
        console.log("map init'd");
    });
}

function drawFrame(){
    drawBaseMap();
    drawMapOverlay();
}

/**
 * Draw base map image.
 */
function drawBaseMap(){
    //Background color behind map. //prevents map from ghosting.
    ctx.beginPath();
    ctx.fillStyle = "#FBEFD5";
    ctx.rect(0,0,viewport.clientWidth,viewport.clientHeight);
    ctx.fill();

    //main map image.
    ctx.drawImage(img_Map, screenOriginInMapCoords.x * zoomLevel, screenOriginInMapCoords.y * zoomLevel, (img_Map.width * zoomLevel), (img_Map.height * zoomLevel), 
                                    0, 0, img_Map.width, img_Map.height);
}

/**
 * Called on map load. Loads the map to the specified point.
 */
function zoomToInitialLocation(){
    let windowParams = new URLSearchParams(window.location.search);
    //default to imperial city coords
    let coords = new Point(27223,65975);
    let maybeFormId = windowParams.get("formId");
    if(maybeFormId != null){
        //focus on formId
        let targetCell = findCell(maybeFormId);
        if(targetCell != null){
            coords = new Point(targetCell.x, targetCell.y);
        }
        overlay.currentLocation = overlay.locations.find(x=>x.cell == targetCell);
    }
    else 
    {
        let maybeX = windowParams.get("x");
        let maybeY = windowParams.get("y");
        if(maybeX != null && maybeY != null){
            coords = new Point(parseInt(maybeX), parseInt(maybeY));
            overlay.poi = new MapPOI("POI", -15,-36,coords);
        }
    }
    centerMap(worldSpaceToMapSpace(coords));
}


/*********************************
 * OVERLAY FUNCTIONS
 *  this is the icons n stuff on the map canvas.
 *********************************/
function initOverlay(){
    overlay = {
        locations : [],
        tsp_locations : [],
        nirnroots : [],
        tsp_nirnroots : [],
        lastZoomLevel : zoomLevel,
        currentLocation : null
    }

    runOnTree(jsondata.location, function(loc){
        let newIcon = new MapIcon(loc);
        overlay.locations.push(newIcon);
        
        if(loc.tspID != null){
            overlay.tsp_locations.push({x:loc.x, y:loc.y, tspID:loc.tspID, cell:newIcon.cell});
        }
    });

    runOnTree(jsondata.nirnroot, function(nirn){
        if(nirn.cell == "Outdoors"){
            let newIcon = new MapIcon(nirn)
            overlay.nirnroots.push(newIcon);

            if(nirn.tspID != null){
                overlay.tsp_nirnroots.push({x:nirn.x, y:nirn.y, tspID:nirn.tspID, cell:newIcon.cell});
            }
        }
    });

    //Sort and run intial world->map->screen space calculations for TSP arrays.
    overlay.tsp_locations.sort((a, b) => a.tspID - b.tspID);
    overlay.tsp_nirnroots.sort((a, b) => a.tspID - b.tspID);
    recalculateTSP();
}

/**
 * Draw icons on the map
 */
function drawMapOverlay(){
    if(zoomLevel != overlay.lastZoomLevel){
        overlay.lastZoomLevel = zoomLevel;
        for(const locIcon of overlay.locations){
            locIcon.recalculateBoundingBox();
        }
        for(const icon of overlay.nirnroots){
            icon.recalculateBoundingBox();
        }
        if(overlay.poi != null){
            overlay.poi.recalculateBoundingBox();
        }
        recalculateTSP();
    }
    const mouseLocInMapCoords = screenSpaceToMapSpace(lastMouseLoc);

    let hloc = null; //tracks hovered location index to redraw it last.
    //Overlay Else if chain
    if(currentOverlay == "Locations"){
        if(showTSP){
            drawTSP(overlay.tsp_locations);
        }
        
        for(const locIcon of overlay.locations){
            //this call we don't have to include mouseLoc because if mouseLoc is true, we will redraw later.
            locIcon.draw(ctx, null, overlay.currentLocation);
            if(locIcon.contains(mouseLocInMapCoords)){
                hloc = locIcon;
            }
        }
    }
    else if(currentOverlay == "NirnRoute"){
        if(showTSP){
            drawTSP(overlay.tsp_nirnroots);
        }

        let hloc = null; //tracks hovered location index to redraw it last.
        for(const nirnIcon of overlay.nirnroots){
            nirnIcon.draw(ctx);
            if(nirnIcon.contains(mouseLocInMapCoords)){
                hloc = nirnIcon;
            }
        }
    }

    if(overlay.poi != null){
        overlay.poi.draw(ctx);
    }

    //last icon in array was just drawn, so redraw hovered icon so it appears on top of everything else.
    if(hloc != null){
        hloc.draw(ctx, mouseLocInMapCoords, overlay.currentLocation);
    }
}

function overlayClick(clickLoc){
    const clickLocInMapSpace = screenSpaceToMapSpace(clickLoc);
    if(currentOverlay == "Locations"){
        for(const icon of overlay.locations){
            if(icon.contains(clickLocInMapSpace)){
                if(window.debug){
                    let name = icon.cell.name ?? icon.cell.formId;
                    console.log("selected "+name);
                }
                if(overlay.currentLocation == icon){
                    overlay.currentLocation = null;
                }
                else{
                    overlay.currentLocation = icon;
                }
                return true;
            }
        }
    }
    else if(currentOverlay == "NirnRoute"){
        for(const icon of overlay.nirnroots){
            if(icon.contains(clickLocInMapSpace)){
                if(window.debug){
                    let name = icon.cell.name ?? icon.cell.formId;
                    console.log("selected "+name);
                }
                if(overlay.currentLocation == icon){
                    overlay.currentLocation = null;
                }
                else{
                    overlay.currentLocation = icon;
                }
                return true;
            }
        }
    }
    return false;
}

/**
 * Handle click on the overlay layer.
 * @param {Point} lastMouseLoc screen space coordinates of mouse click
 * @returns if click was handled (ie, something was clicked on)
 */
function overlayDoubleClick(clickLoc){
    //overlay coordinates are all in map space, so we convert to that before checking.
    const clickLocInMapSpace = screenSpaceToMapSpace(clickLoc);
    if(currentOverlay == "Locations"){
        for(const icon of overlay.locations){
            if(icon.contains(clickLocInMapSpace)){
                return icon.onClick(clickLoc);
            }
        }
    }
    else if(currentOverlay == "NirnRoute"){
        for(const icon of overlay.nirnroots){
            if(icon.contains(clickLocInMapSpace)){
                return icon.onClick(clickLoc);
            }
        }
    }
    return false;
}

/*********************************
 * GENERAL FUNCTIONS
 *********************************/

/**
 * Center the map on the specified point.
 * @param {Point} mapPoint point in map coords to center on.
 */
function centerMap(mapPoint){
    let cornerOffset = new Point(viewport.clientWidth / 2, viewport.clientHeight / 2);
    let newCornerMapCoord = mapPoint.subtract(cornerOffset);

    //moveMap takes a delta, so we subtract new from old. 
    moveMap(screenOriginInMapCoords.subtract(newCornerMapCoord));
}

/**
 * Move the map by the specified amount
 * @param {Point} delta delta x and y to move the map, in screen space coords
 */
function moveMap(delta){
    //increment based on mouse movement
    if(delta){
        screenOriginInMapCoords.x -= delta.x;
        screenOriginInMapCoords.y -= delta.y;
    }
    
    //clamp values to prevent moving map off screen.
    if(screenOriginInMapCoords.x < 0) {
        screenOriginInMapCoords.x = 0;
    }
    if(screenOriginInMapCoords.y < 0) {
        screenOriginInMapCoords.y = 0;
    }

    const currentMapWidth = img_Map.width / zoomLevel;
    const currentMapHeight = img_Map.height / zoomLevel;
    const maxScreenOriginX = Math.max(0,currentMapWidth - viewport.clientWidth);
    const maxScreenOriginY = Math.max(0,currentMapHeight - viewport.clientHeight);
    screenOriginInMapCoords.x = Math.min(screenOriginInMapCoords.x, maxScreenOriginX);
    screenOriginInMapCoords.y = Math.min(screenOriginInMapCoords.y, maxScreenOriginY);
}

async function initImgs(){
    return new Promise((resolve, reject) =>{
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
            "Nirnroot",
            "Check",
            "X",
            "POI",
            "Overlay_Fixed",
            "Overlay_No_Reroll",
            "Overlay_Two_Fame"
        ];
    
        iconsToInit.forEach(function(i){
            icons[i] = document.createElement("IMG");
            icons[i].width = 48;
            icons[i].height = 48;
            icons[i].src = "images/Icon_" + i + ".png";
            }
        )

        img_Map = document.createElement("img");
        img_Map.width = 3544;
        img_Map.height = 2895;
        img_Map.src = "images/Cyrodil_Upscaled.webp";
        img_Map.onload = function(){
            resolve();
        };

        img_Map.onerror = function(){
            reject(this);
        };  
    });
}

function onMouseClick(mouseLoc){
    if(window.debug){
        let mapLoc = screenSpaceToMapSpace(mouseLoc);
        console.log("click at screen: " + mouseLoc+", map: "+mapLoc+" world: "+mapSpaceToWorldSpace(mapLoc));
    }
    let handled = overlayClick(mouseLoc); //do we keep this? idk what else we'd use it for.
    if(handled){
        drawFrame();
    }
}

function onMouseDoubleClick(mouseLoc){
    let handled = overlayDoubleClick(mouseLoc); //do we keep this? idk what else we'd use it for.
    if(handled){
        drawFrame();
    }
}

function initListeners(){
    const CLICK_LIMIT_PIXELS = 8;
    const CLICK_LIMIT_DOWN_MS = 150;
    //a little more time than 2 clicks
    const DOUBLE_CLICK_LIMIT_MS = 350;

    /**
     * mouse down location
     */
    let mouseDownLoc = {x:null,y:null}
    let clickStartTime = 0;
    let isDown = false;
    let doubleClickStartTime = 0;
    let doubleClickMouseDownLoc = new Point(null,null);
    viewport.addEventListener("mousedown", function(event){
        //check double click stuff
        if(Date.now() - clickStartTime < DOUBLE_CLICK_LIMIT_MS){
            doubleClickMouseDownLoc = mouseDownLoc;
            doubleClickStartTime = clickStartTime;
        }
        mouseDownLoc = new Point(event.offsetX, event.offsetY);
        lastMouseLoc = new Point(event.offsetX, event.offsetY);
        clickStartTime = Date.now();
        isDown = true;
    });
    viewport.addEventListener("mousemove",function(event){
        //if mouse is down, we're dragging. probably.
        // if user moves mouse while clicking, map will drag slightly. oh well.
        lastMouseLoc = new Point(event.offsetX, event.offsetY);
        if(isDown){
            moveMap({x:event.movementX, y:event.movementY});
        }
        // regardless of whether we are down or not, we need to redraw the scene?
        // TODO: only redraw if we dragged or move on to or off of an icon?
        drawFrame();
    });
    viewport.addEventListener("mouseup", function(event){
        lastMouseLoc = new Point(event.offsetX, event.offsetY);
        isDown = false;
        //interpret double-clicks first.
        if(Math.abs(doubleClickMouseDownLoc.x - event.offsetX) < CLICK_LIMIT_PIXELS &&
            Math.abs(doubleClickMouseDownLoc.y - event.offsetY) < CLICK_LIMIT_PIXELS &&
            Date.now() - doubleClickStartTime < DOUBLE_CLICK_LIMIT_MS){
                //double click.
                onMouseDoubleClick(lastMouseLoc);
        }
        else{
            if(Math.abs(mouseDownLoc.x - event.offsetX) < CLICK_LIMIT_PIXELS &&
                Math.abs(mouseDownLoc.y - event.offsetY) < CLICK_LIMIT_PIXELS &&
                Date.now() - clickStartTime < CLICK_LIMIT_DOWN_MS){
                    onMouseClick(lastMouseLoc);
            }
        }
    });
    viewport.onmouseout = function(){isDown = false;};
    viewport.onwheel = function(e){    
        
        e.preventDefault();
        const zoomPoint = new Point(e.offsetX, e.offsetY);
        if(e.deltaY > 0){ 
        updateZoom(0.2, zoomPoint);
        }
        else {
            updateZoom(-0.2, zoomPoint);
        }
        
        drawFrame();
    };
    document.getElementById("button_Location").addEventListener("click", function(){
        currentOverlay = "Locations"; 
        drawFrame();
    });
    document.getElementById("button_Nirnroot").addEventListener("click", function(){
        currentOverlay = "NirnRoute"; 
        drawFrame();
    });
    document.getElementById("button_ToggleTSP").addEventListener("click", function(){
        showTSP = !showTSP; 
        drawFrame();
    });
}

function updateZoom(deltaZ, zoomPoint){
    const ICON_NATIVE_HEIGHT = 20;
    let oldZoom = zoomLevel;
    zoomLevel += deltaZ;
    //clamp zoom
    if(zoomLevel > maxZoom) zoomLevel = maxZoom;
    if(zoomLevel < minZoom) zoomLevel = minZoom;

    if(oldZoom == zoomLevel){
        return;
    }

    //adjust icon size
    var m_iconH = ICON_NATIVE_HEIGHT / zoomLevel;
    if(zoomLevel > 1.75)m_iconH = ICON_NATIVE_HEIGHT / zoomLevel * 2;
    else if(zoomLevel > 1.5)m_iconH = ICON_NATIVE_HEIGHT / zoomLevel * 1.5;
    else if(zoomLevel > 1.25)m_iconH = ICON_NATIVE_HEIGHT / zoomLevel * 1.25;
    _iconH = m_iconH;

    //make map zoom in to zoomPoint.
    //1: calculate current zoomPoint in map coords
    //2. calculate where that point is on the new map
    //3. calculate where the corner needs to be to set that point as the center
    let oldCenterMapCoord = screenSpaceToMapSpace(zoomPoint);
    let newCenterMapCoord = oldCenterMapCoord.multiply(oldZoom/zoomLevel);
    let newCornerMapCoord = newCenterMapCoord.subtract(zoomPoint);

    //moveMap takes a delta, so we subtract new from old. 
    moveMap(screenOriginInMapCoords.subtract(newCornerMapCoord));
}

//converts worldspace cords into map coords.
//this is a pixel measurement from upper left of map image.
function worldSpaceToMapSpace(point){
    //first, we convert world space into map space.
    var MapW = img_Map.width;
    var MapH = img_Map.height;
    const worldW = 485000 + mapAdjust.width;
    const worldH = 398000 + mapAdjust.height;
    
    //world coords are -240,000 to 240,000 in the x direction
    //and -200,000 to 200,000 in the y direction

    //for most things, we store the "map coords", and then that gets converted to viewport(aka canvas) coords with simple vector addition at draw time.

    //first, convert to positive number between 0 and 1.
    let fraction_x = (Math.round(point.x+ mapAdjust.preX) + worldW / 2 ) / worldW;
    let fraction_y = (-Math.round(point.y+ mapAdjust.preY) + worldH / 2 ) / worldH;

    //then adjust for the new map height/width.
    let map_x = (MapW * fraction_x) / zoomLevel + mapAdjust.postX;
    let map_y = (MapH * fraction_y) / zoomLevel + mapAdjust.postY;

    return new Point(map_x, map_y);
}

//really only useful for debugging
/**
 * 
 * @param {Point} point 
 */
function mapSpaceToWorldSpace(point){
    var mapW = img_Map.width;
    var mapH = img_Map.height;
    const worldW = 485000 + mapAdjust.width;
    const worldH = 398000 + mapAdjust.height;

    //convert back to float
    point = point.multiply(zoomLevel);
    let fractionX = (point.x - mapAdjust.postX)/ mapW;
    let fractionY = (point.y - mapAdjust.postY)/ mapH;

    //and multiply
    let pointX = fractionX * worldW - worldW / 2;
    let pointY = -1 * (fractionY * worldH - worldH / 2);

    return new Point(pointX - mapAdjust.preX, pointY - mapAdjust.preY);
}

/**
 * Convert a point in map space to a point in screen space.
 * @param {Point} mapSpacePoint 
 * @returns {Point} screen space point
 */
function mapSpaceToScreenSpace(mapSpacePoint){
    return mapSpacePoint.subtract(screenOriginInMapCoords);
}

/**
 * Convert a point in screen space to a point in map space.
 * @param {Point} screenSpacePoint 
 * @returns {Point} map space point
 */
function screenSpaceToMapSpace(screenSpacePoint){
    return screenSpacePoint.add(screenOriginInMapCoords);
}

/**Returns appropriate icon from string input.*/
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
        case "Nirnroot": return icons.Nirnroot;
        case "POI": return icons.POI;
            
        default: 
            console.warn("Element has invalid iconname: " + Input + ".");
            return icons.X;
    }
}

/**draws the Traveling salesman path*/
function drawTSP(arrTSP){
    if(showTSP){
        //draw from prev point to current point
        for(let i = 1; i < arrTSP.length; i++){
            let pp = mapSpaceToScreenSpace(new Point(arrTSP[i].x, arrTSP[i].y));
            let p = mapSpaceToScreenSpace(new Point(arrTSP[i - 1].x, arrTSP[i - 1].y));
            
            //TODO: add in custom color/line width selection.
            //TODO: add in secondary line outline to make line "pop" on map better.
            ctx.beginPath();
            ctx.strokeStyle="#FF0000";
            ctx.lineWidth = 5; 
            ctx.moveTo(pp.x, pp.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
        }

        //draws the last connection from the last point to the first point.
        let a = mapSpaceToScreenSpace(new Point(arrTSP[0].x, arrTSP[0].y));
        let z = mapSpaceToScreenSpace(new Point(arrTSP[arrTSP.length - 1].x, arrTSP[arrTSP.length - 1].y));
        
        ctx.beginPath();
        ctx.strokeStyle="#FF0000";
        ctx.lineWidth = 5;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(z.x, z.y);
        ctx.stroke();
    }
}

function recalculateTSP(){
    for(const loc of overlay.tsp_locations){
        let p = worldSpaceToMapSpace(new Point(loc.cell.x, loc.cell.y));
        loc.x = p.x;
        loc.y = p.y;
    }
    for(const nirn of overlay.tsp_nirnroots){
        let p = worldSpaceToMapSpace(new Point(nirn.cell.x, nirn.cell.y));
        nirn.x = p.x;
        nirn.y = p.y;
    }
}
