//TODO: Figure out Random Gate tracking?
    //seperate counter for found random gates?

//some decorations from the guide that might be useful.
    //TODO: Add pink circle for fixed gates 
    //TODO: Add green plus for 2 fame gates
    //TODO: add blue star for no-reroll gates

//TODO: add a legend overlay button (probably can be put into the explnation/help button after UI migration)

//TODO: figure out how discovered locations are tracked and implement it.

//TODO: get topbar percentage working on map.js

"use strict";
export {initMap, worldSpaceToMapSpace, mapSpaceToScreenSpace, iconH, iconSwitch, icons};

import {Point} from "./map/point.mjs";
import {MapObject,MapIcon} from "./map/mapObject.mjs";

/**
 * The element that contains the canvas. We can use this to query for how much of the canvas the user can see.
 */
let viewport;
let canvas;
let ctx;

let zoomLevel = 1;
let minZoom = 0.2;
let maxZoom = 3.5;

/**
 * Offset from map to screen coordinates.
 */
let screenOriginInMapCoords = new Point(0,0);
let _iconH = 20;
function iconH(){return _iconH;};
let currentOverlay = "Locations"; // Locations, NirnRoute, Exploration.
let showTSP = false;

//image objects
let map_topbar;
let overlay;

/**
 * Last position of the mouse. used for rendering mouseover stuff.
 */
var lastMouseLoc = new Point(0,0);
let mousedown = false;

let img_Map;
let icons = {};

async function initMap(){
    //load map cord data

    viewport = document.getElementById("wrapper_Map");

    canvas = document.createElement("CANVAS");
    canvas.id = "canvas_Map";
    canvas.width = 3544;
    canvas.height = 2895;
    viewport.appendChild(canvas);
    ctx = canvas.getContext("2d");
    initImgs().then(()=>{
        initTopbar();
        initOverlay();
        initListeners();

        //center map on imp city
        screenOriginInMapCoords = new Point(1700,885);

        drawFrame();
        console.log("map init'd");
    });
}

function drawFrame(){
    drawBaseMap();
    drawMapOverlay();
    //TODO: don't have topbar overlay map. or move topbar or something aaa idk
    //map_topbar.draw(ctx);
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
        lastZoomLevel : zoomLevel
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
        recalculateTSP();
    }
    const mouseLocInMapCoords = screenSpaceToMapSpace(lastMouseLoc);
    //Overlay Else if chain
    if(currentOverlay == "Locations"){
        if(showTSP){
            drawTSP(overlay.tsp_locations);
        }
        
        let hloc = null; //tracks hovered location index to redraw it last.
        for(const locIcon of overlay.locations){
            //this call we don't have to include mouseLoc because if mouseLoc is true, we will redraw later.
            locIcon.draw(ctx);
            if(locIcon.contains(mouseLocInMapCoords)){
                hloc = locIcon;
            }
        }

        //last icon in array was just drawn, so redraw hovered icon so it appears on top of everything else.
        if(hloc != null){
            hloc.draw(ctx, mouseLocInMapCoords);
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
        if(hloc != null){
            hloc.draw(ctx, mouseLocInMapCoords);
        }
    }
    else if(currentOverlay == "Exploration"){//TODO: Remove this overlay when we migrate UI out of javascript
        //traveling salesmen overlay.
        var x = viewport.clientWidth;
        var y = viewport.clientHeight;

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
}

/**
 * Handle click on the overlay layer.
 * @param {Point} lastMouseLoc screen space coordinates of mouse click
 * @returns if click was handled (ie, something was clicked on)
 */
function overlayClick(clickLoc){
    //overlay coordinates are all in map space, so we convert to that before checking.
    const clickLocInMapSpace = screenSpaceToMapSpace(clickLoc);
    if(currentOverlay == "Locations"){
        for(const icon of overlay.locations){
            if(icon.contains(clickLocInMapSpace)){
                console.log("location "+icon.cell.formId+"("+icon.cell.name+") clicked");
                return true;
            }
        }
    }
    else if(currentOverlay == "NirnRoute"){
        for(const icon of overlay.nirnroots){
            if(icon.contains(clickLocInMapSpace)){
                console.log("nirnroot "+icon.cell.formId+" clicked");
                return true;
            }
        }
    }
    return false;
}

/*********************************
 * TOPBAR FUNCTIONS
 *  this is the "topbar" on the map canvas.
 *********************************/
function initTopbar(){
    function MapButton(ordinal,y,height,text){
        MapObject.call(this);
        this.ordinal = ordinal;
        //this.minX and this.maxX calculated by recalculateBoundingBox
        this.minY = y;
        this.maxY = y+height;
        this.name = text;
        this.recalculateBoundingBox();
        
    }
    MapButton.prototype = Object.create(MapObject.prototype);
    MapButton.prototype.draw = function(ctx){
        let width = this.width();
        let height = this.height();
        ctx.beginPath();
        if(currentOverlay == this.name){
            ctx.fillStyle = "#ccc";
        }
        else{
            ctx.fillStyle = "#E5D9B9";
        }
        ctx.fillRect(this.minX, this.minY, width, height);

        //and now text
        ctx.beginPath();
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.font = "16px Arial"
        ctx.fillText(this.name, this.minX + (width/2), this.minY + 16);
    }
    MapButton.prototype.recalculateBoundingBox = function(){
        this.minX = 8 + (map_topbar.width()/3)*this.ordinal;
        this.maxX = this.minX + (map_topbar.width() - 16)/3;
    }

    map_topbar = new MapObject();
    map_topbar.buttons = [];
    map_topbar.minX = 0;
    map_topbar.minY = 0;
    map_topbar.maxX = viewport.clientWidth;
    map_topbar.maxY = 32;

    map_topbar.buttons.push(new MapButton(0, 6, 20, "Locations"));
    map_topbar.buttons.push(new MapButton(1, 6, 20, "NirnRoute"));
    map_topbar.buttons.push(new MapButton(2, 6, 20, "Exploration"));

    map_topbar.draw = function(ctx){
        let wX = viewport.clientWidth;

        //update our width here for hit detection
        if(this.maxX != wX){
            this.maxX = wX;
            for(const btn of this.buttons){
                btn.recalculateBoundingBox();
            }
        }
        

        //overlay background
        ctx.beginPath();
        ctx.fillStyle = "#FBEFD5";
        ctx.rect(0,0, wX,32);
        ctx.fill();

        //overlay buttons
        for(const btn of this.buttons){
            btn.draw(ctx);
        }

        //overlay button dividers.
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.rect(wX/3, 6, 1, 20);
        ctx.rect(wX/3*2, 6, 1, 20);
        ctx.fill();
    }

    map_topbar.click = function topbarClick(coords){
        if(!this.contains(coords)){
            return false;
        }
        
        for(const btn of this.buttons){
            if(btn.contains(coords)){
                currentOverlay = btn.name;
                return true;
            }
        }
        return false;
    }
}

/*********************************
 * GENERAL FUNCTIONS
 *  this is the "topbar" on the map canvas.
 *********************************/
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
    if(screenOriginInMapCoords.x < 0) screenOriginInMapCoords.x = 0;
    if(screenOriginInMapCoords.y < 0) screenOriginInMapCoords.y = 0;

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
            "X"
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
        console.log("click at screen: " + mouseLoc+", map: "+screenSpaceToMapSpace(mouseLoc));
    }
    let handled = map_topbar.click(mouseLoc);
    if(!handled){
        handled = overlayClick(mouseLoc);
    }
    if(handled){
        drawFrame();
    }
}

function initListeners(){
    const CLICK_LIMIT_PIXELS = 8;
    const CLICK_LIMIT_DOWN_MS = 150;

    /**
     * mouse down location
     */
    let mouseDownLoc = {x:null,y:null}
    let clickStartTime;
    let isDown = false;
    viewport.addEventListener("mousedown", function(event){
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
        //yay we get to interpret clicks on our own! /s
        if(Math.abs(mouseDownLoc.x - event.offsetX) < CLICK_LIMIT_PIXELS &&
            Math.abs(mouseDownLoc.y - event.offsetY) < CLICK_LIMIT_PIXELS &&
            Date.now() - clickStartTime < CLICK_LIMIT_DOWN_MS){
                onMouseClick(lastMouseLoc);
        }
        //TODO: handle double clicks
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
    document.getElementById("button_Location").addEventListener("click", function(){currentOverlay = "Locations"; drawFrame();});
    document.getElementById("button_Nirnroot").addEventListener("click", function(){currentOverlay = "NirnRoute"; drawFrame();});
    document.getElementById("button_ToggleTSP").addEventListener("click", function(){showTSP = !showTSP; drawFrame();});
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
    const worldW = 480000;
    const worldH = 400000;
    
    //world coords are -240,000 to 240,000 in the x direction
    //and -200,000 to 200,000 in the y direction

    //for most things, we store the "map coords", and then that gets converted to viewport(aka canvas) coords with simple vector addition at draw time.

    //first, convert to positive number between 0 and 1.
    let fraction_x = (Math.round(point.x) + worldW / 2) / worldW;
    let fraction_y = (-Math.round(point.y) + worldH / 2) / worldH;

    //then adjust for the new map height/width.
    let map_x = (MapW * fraction_x) / zoomLevel;
    let map_y = (MapH * fraction_y) / zoomLevel;

    return new Point(map_x, map_y);
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
            ctx.lineWidth = 5; 
            ctx.moveTo(pp.x, pp.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
        }

        //draws the last connection from the last point to the first point.
        let a = mapSpaceToScreenSpace(new Point(arrTSP[0].x, arrTSP[0].y));
        let z = mapSpaceToScreenSpace(new Point(arrTSP[arrTSP.length - 1].x, arrTSP[arrTSP.length - 1].y));
        
        ctx.beginPath();
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