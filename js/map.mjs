//TODO: get topbar percentage working on map.js
//TODO: add in the gates to the fame section. Because we need the fame and the discovery separately.

"use strict";
export {
    initMap, 
    mapAdjust, 
    worldSpaceToMapSpace, 
    mapSpaceToWorldSpace, 
    mapSpaceToScreenSpace, 
    screenSpaceToMapSpace,
    worldSpaceToScreenSpace,
    getImageScale,
    ICON_NATIVE_HEIGHT, 
    iconSwitch, 
    icons, 
    getRandomGateCount,
    updateRandomGateCount,
    zoomToFormId,
    drawFrame as draw,
    setZoomLevel,
    getZoomLevel,
    //debugging variables
    getOverlay,
    getCtx
};

import { Point } from "./map/point.mjs";
import { MapPOI } from "./map/mapObject.mjs";
import { sumCompletionItems, updateProgressBar } from "./progressCalculation.mjs";
import { saveProgressToCookie, initAutoSettings } from "./userdata.mjs"
import { Overlay, OVERLAY_LAYER_NONE, OVERLAY_LAYER_LOCATIONS, OVERLAY_LAYER_NIRNROOTS, OVERLAY_LAYER_WAYSHRINES, OVERLAY_LAYER_NEARBYGATES } from "./map/overlay.mjs";
import { findCell } from "./obliviondata.mjs";
import { resetProgressForHive } from "./userdata.mjs";

/**
 * The element that contains the canvas. We can use this to query for how much of the canvas the user can see.
 */
let viewport;
let canvas;
let ctx;
function getCtx(){
    return ctx;
}

function getZoomLevel(){
    return zoomLevel;
}

function setZoomLevel(level){
    updateZoom((level - zoomLevel), null);
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

const ICON_NATIVE_HEIGHT = 20;
let _image_scale = 20/48;
function getImageScale(){return _image_scale;};

let randomGateCount = 0;
function getRandomGateCount(){
    return randomGateCount;
}

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

const randomGateDisplay = document.getElementById("randomGateCount");

function updateRandomGateCount(Found){
    if(Found){
        randomGateCount++;
    }
    else{
        randomGateCount--;
    }
    if(randomGateDisplay){
        if(randomGateCount >= 40){
            randomGateDisplay.innerText = getRandomGateCount() + "✔";
            randomGateDisplay.style = "color:green";
        }
        else{
            randomGateDisplay.innerText = getRandomGateCount();    
            randomGateDisplay.style = "color:black";
        }
    }
}

function clearRandomGateCount(){
    randomGateCount = 0;
    if(randomGateDisplay){
        randomGateDisplay.innerText = getRandomGateCount();    
        randomGateDisplay.style = "color:black";
    }
}

function initRandomGateCount(){
    //Init randomGateCount. FFFF`FFC1 is random gates discovered
    let root = findCell("0xFFFFFFC1", "location");
    let completed = sumCompletionItems(root);
    randomGateCount = completed[0];
    
    if(randomGateDisplay != null){
        if(randomGateCount >= 40){
            randomGateDisplay.innerText = randomGateCount + "✔";
            randomGateDisplay.style = "color:green";
        }
        else{
            randomGateDisplay.innerText = randomGateCount;
        }
    }
}

async function initMap(){
    //load map cord data
    let windowParams = new URLSearchParams(window.location.search);
    if(windowParams.get("topbar") == "false"){
        document.getElementById("topbar").remove();
    }
    //Setting parameters
    let settingsArray = ["Location", "Nirnroot", "Wayshrine", "NearbyGates"];
    for(let para of settingsArray){
        if(windowParams.get(para.toLowerCase()) == "true"){
            document.getElementById("button_" + para).checked = true;
        }
        if(windowParams.get(para.toLowerCase()) == "false"){//can't do else for these since it would override user settings.
            document.getElementById("button_" + para).checked = false;
        }
    }
    //Prediscovered appears to be tied to settings, so I can't figure out how to make that one changable. Most people won't turn it off anyway.
    let tspSetting = windowParams.get("tsp")
    if(tspSetting == "none" || tspSetting == "location" || tspSetting == "nirnroot"){
        document.getElementById("button_tsp" + tspSetting.charAt(0).toUpperCase() + tspSetting.slice(1)).checked = true;
    }

    //start map loading here, we will wait for it later.
    let mapImgLoad = loadMapImage();
    initAutoSettings(drawFrame, drawFrame);

    viewport = document.getElementById("wrapper_Map");

    canvas = document.createElement("CANVAS");
    canvas.id = "canvas_Map";
    canvas.width = 3544;
    canvas.height = 2895;
    viewport.appendChild(canvas);
    ctx = canvas.getContext("2d");

    //icon images are needed for overlay
    loadIconImages();
    overlay = new Overlay();
    initListeners();
    initRandomGateCount();

    screenOriginInMapCoords = new Point(0,0);
    zoomToInitialLocation();

    await mapImgLoad;
    //previously, we may have called drawFrame() with a zoom of 1.
    //so force recalculation of bounding boxes after images have loaded.
    overlay.recalculateBoundingBox();
    drawFrame();
    console.log("map init'd");
}

function drawFrame(){
    drawBaseMap();
    overlay.draw(ctx, lastMouseLoc, zoomLevel);
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
    if(windowParams.get("zoom")){
        setZoomLevel(parseFloat(windowParams.get("zoom")));
    }

    if(maybeFormId != null){
        //focus on formId
        zoomToFormId(maybeFormId);
        if(window.debug){
            console.log("zooming to formid "+maybeFormId);
        }
    }
    else 
    {
        let maybeX = windowParams.get("x");
        let maybeY = windowParams.get("y");
        if(maybeX != null && maybeY != null){
            coords = new Point(parseInt(maybeX), parseInt(maybeY));
            overlay.poi = new MapPOI("POI", 0.5, 1.0,coords);
        }
        centerMap(worldSpaceToMapSpace(coords));
    }
}

function zoomToFormId(formid){
    let coords = new Point(0,0);
    let targetCell = findCell(formid);
    if(targetCell != null){
        coords = new Point(targetCell.x, targetCell.y);
    }
    if(targetCell.hive.classname == "nirnroot"){
        document.getElementById("button_Nirnroot").checked = true;
        overlay.setActiveLayer(OVERLAY_LAYER_NIRNROOTS, true); 
    }

    overlay.setCurrentLocationByFormId(formid);
    centerMap(worldSpaceToMapSpace(coords));
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

//synchronous becuase i don't want to async load all these individual images
function loadIconImages(){
    var iconsWithUndiscovered = [
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
        "City",
        "Nirnroot",
        "Wayshrine",
        "HeavenStone"
    ];
    var iconsToInit = [
        "Check",
        "X",
        "POI",
        "Overlay_Fixed",
        "Overlay_No_Reroll",
        "Overlay_Two_Fame"
    ];

    iconsWithUndiscovered.forEach(function(i){
        icons[i] = document.createElement("IMG");
        icons[i].src = "images/Icon_" + i + ".png";
        icons[i].width = 48;
        icons[i].height = 48;
        let undiscovered = i+"_Undiscovered";
        icons[undiscovered] = document.createElement("IMG");
        icons[undiscovered].src = "images/Icon_" + undiscovered + ".png";
        icons[undiscovered].width = 48;
        icons[undiscovered].height = 48;
    });
    iconsToInit.forEach(function(i){
        icons[i] = document.createElement("IMG");
        icons[i].src = "images/Icon_" + i + ".png";
        if(i != "POI"){
            //bad hack
            icons[i].width = 48;
            icons[i].height = 48;
        }
    });  
}

async function loadMapImage(){
    return new Promise((resolve, reject) =>{
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

function onMouseDoubleClick(mouseLoc){
     //todo: rename these methods to be accurate
    if(window.debug){
        let mapLoc = screenSpaceToMapSpace(mouseLoc);
        console.log("click at screen: " + mouseLoc+", map: "+mapLoc+" world: "+mapSpaceToWorldSpace(mapLoc));
    }
    if(overlay.click(mouseLoc)){
        drawFrame();
    }
}

function onMouseClick(mouseLoc){
    //todo: rename these methods to be accurate
    if(overlay.doubleClick(mouseLoc)){
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
    // prevent double click from highlighting
    viewport.addEventListener("mousedown",function(event){
        if(event.detail > 1){
            event.preventDefault();
        }
    });
    viewport.addEventListener("pointerdown", function(event){
        //check double click stuff
        if(event.buttons & 2){
            //right-click, ignore
            return;
        }
        if(Date.now() - clickStartTime < DOUBLE_CLICK_LIMIT_MS){
            doubleClickMouseDownLoc = mouseDownLoc;
            doubleClickStartTime = clickStartTime;
        }
        mouseDownLoc = new Point(event.offsetX, event.offsetY);
        lastMouseLoc = new Point(event.offsetX, event.offsetY);
        clickStartTime = Date.now();
        isDown = true;
        if(window.debugPointing){
            console.log("mousedown @ "+event.offsetX + ","+event.offsetY);
        }
    });
    viewport.addEventListener("pointermove",function(event){
        //if mouse is down, we're dragging. probably.
        // if user moves mouse while clicking, map will drag slightly. oh well.
        lastMouseLoc = new Point(event.offsetX, event.offsetY);
        if(isDown){
            moveMap({x:event.movementX, y:event.movementY});
            if(window.debugPointing){
                console.log("mousemove @ "+event.movementX + ","+event.movementY);
            }
        }
        // regardless of whether we are down or not, we need to redraw the scene?
        // TODO: only redraw if we dragged or move on to or off of an icon?
        drawFrame();
    });
    viewport.addEventListener("pointerup", function(event){
        lastMouseLoc = new Point(event.offsetX, event.offsetY);
        isDown = false;
        //interpret double-clicks first.
        if(Math.abs(doubleClickMouseDownLoc.x - event.offsetX) < CLICK_LIMIT_PIXELS &&
            Math.abs(doubleClickMouseDownLoc.y - event.offsetY) < CLICK_LIMIT_PIXELS &&
            Date.now() - doubleClickStartTime < DOUBLE_CLICK_LIMIT_MS){
                //double click.
                //onMouseDoubleClick(lastMouseLoc);
        }
        else{
            if(Math.abs(mouseDownLoc.x - event.offsetX) < CLICK_LIMIT_PIXELS &&
                Math.abs(mouseDownLoc.y - event.offsetY) < CLICK_LIMIT_PIXELS &&
                Date.now() - clickStartTime < CLICK_LIMIT_DOWN_MS){
                    onMouseClick(lastMouseLoc);
            }
        }
        if(window.debugPointing){
            console.log("mouseup @ "+event.offsetX + ","+event.offsetY);
        }
    });
    viewport.addEventListener("contextmenu", function(event){
        lastMouseLoc = new Point(event.offsetX, event.offsetY);
        onMouseDoubleClick(lastMouseLoc);
        event.preventDefault();
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

    const button_location = document.getElementById("button_Location");
    const button_nirnroot = document.getElementById("button_Nirnroot");
    const button_wayshrine = document.getElementById("button_Wayshrine");
    const button_nearbyGates = document.getElementById("button_NearbyGates");

    const button_tspNone = document.getElementById("button_tspNone");
    const button_tspLocation = document.getElementById("button_tspLocation");
    const button_tspNirnroot = document.getElementById("button_tspNirnroot");

    const showNonGates = document.getElementById("mapShowNonGates");
    const showGates = document.getElementById("mapShowGates");

    let settings = document.getElementsByClassName("autosetting");
    //create display settings function to keep all these captures.
    var displaySettingsFunc = function(){
        overlay.setActiveLayer(OVERLAY_LAYER_LOCATIONS, button_location.checked);
        overlay.setActiveLayer(OVERLAY_LAYER_NIRNROOTS, button_nirnroot.checked);
        overlay.setActiveLayer(OVERLAY_LAYER_WAYSHRINES, button_wayshrine.checked);
        //overlay.setActiveLayer(OVERLAY_LAYER_CITYNIRNS, button_cityNirns.checked);
        overlay.setActiveLayer(OVERLAY_LAYER_NEARBYGATES, button_nearbyGates.checked);

        if(button_tspNone.checked){
            overlay.setActiveTsp(OVERLAY_LAYER_NONE);
        }
        else if(button_tspLocation.checked){
            overlay.setActiveTsp(OVERLAY_LAYER_LOCATIONS);
        }
        else if(button_tspNirnroot.checked){
            overlay.setActiveTsp(OVERLAY_LAYER_NIRNROOTS);
        }

        overlay.layers.get(OVERLAY_LAYER_LOCATIONS).layers.get("nonGates").visible = showNonGates.checked;
        overlay.layers.get(OVERLAY_LAYER_LOCATIONS).layers.get("gates").visible = showGates.checked;
        
        drawFrame();
    }

    button_location.addEventListener("change", displaySettingsFunc);
    button_nirnroot.addEventListener("change", displaySettingsFunc);
    button_wayshrine.addEventListener("change", displaySettingsFunc);
    button_nearbyGates.addEventListener("change", displaySettingsFunc);

    button_tspNone.addEventListener("change", displaySettingsFunc);
    button_tspLocation.addEventListener("change", displaySettingsFunc);
    button_tspNirnroot.addEventListener("change", displaySettingsFunc);

    showNonGates.addEventListener("change", displaySettingsFunc);
    showGates.addEventListener("change", displaySettingsFunc);
    displaySettingsFunc();

    document.getElementById("resetMapButton")?.addEventListener('click', (e)=>{
        if(confirm("Delete saved map progress?")){
            resetProgressForHive(savedata, jsondata.location);
            resetProgressForHive(savedata, jsondata.nirnroot);
            clearRandomGateCount();
            saveProgressToCookie();
            location.reload();
        }
    });

    document.addEventListener("progressLoad",()=>{
        updateProgressBar();
        overlay.recalculateBoundingBox();
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
    var image_scale = 1 / zoomLevel;
    if(zoomLevel > 1.75)image_scale = 1 / zoomLevel * 2;
    else if(zoomLevel > 1.5)image_scale = 1 / zoomLevel * 1.5;
    else if(zoomLevel > 1.25)image_scale = 1 / zoomLevel * 1.25;
    else if(zoomLevel > 0.21)image_scale = 1 / zoomLevel ;
    //for super zoomed in, shrink the icons again, as user probably wants precision.
    else image_scale = 1 / zoomLevel * 0.5;
    _image_scale = 20/48 * image_scale;

    //make map zoom in to zoomPoint.
    //1: calculate current zoomPoint in map coords
    //2. calculate where that point is on the new map
    //3. calculate where the corner needs to be to set that point as the center
    if(zoomPoint){
        let oldCenterMapCoord = screenSpaceToMapSpace(zoomPoint);
        let newCenterMapCoord = oldCenterMapCoord.multiply(oldZoom/zoomLevel);
        let newCornerMapCoord = newCenterMapCoord.subtract(zoomPoint);

        //moveMap takes a delta, so we subtract new from old. 
        moveMap(screenOriginInMapCoords.subtract(newCornerMapCoord));
    }
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

/**
 * Convert a point in world space to a point in screen space.
 * @param {Point} worldSpacePoint 
 * @returns {Point} screen space point
 */
function worldSpaceToScreenSpace(worldSpacePoint){
    return mapSpaceToScreenSpace(worldSpaceToMapSpace(worldSpacePoint));
}

/**Returns appropriate icon from string input.*/
function iconSwitch(Input){
        let maybeIcon = icons[Input];
        if(maybeIcon == null){
            console.warn("Element has invalid iconname: " + Input + ".");
            return icons.X;
        }
        return maybeIcon;
}
