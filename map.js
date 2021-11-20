//TODO: Random Gates overlay? -> add random gates into locations.json, make their name "possible random gate."

//TODO: make it so that it zooms into middle of screen rather than top left corner? *Wishlist

//TODO: figure out how discovered locations are tracked and implement it.

function Point(x,y){
    this.x = x;
    this.y = y;
}
Point.prototype.toString = function(){
    return "("+this.x+","+this.y+")";
}
/**
 * Return a point that is the result of adding a scalar or point to this point.
 * @param {*} object scalar or point to add
 * @returns {Point} new point
 */
Point.prototype.add = function(object){
    if(typeof(object) == "number"){
        let asNum = parseFloat(object);
        return new Point(this.x + asNum, this.y + asNum);
    }
    else{
        //should this typecheck for point? IDK i'm not used to js development
        return new Point(this.x + object.x, this.y + object.y);
    }
}
/**
 * Return a point that is the result of subtracting a scalar or point from this point.
 * @param {*} object scalar or point to subtract
 * @returns {Point} new point
 */
Point.prototype.subtract = function(object){
    if(typeof(object) == "number"){
        let asNum = parseFloat(object);
        return new Point(this.x - asNum, this.y - asNum);
    }
    else{
        //should this typecheck for point? IDK i'm not used to js development
        return new Point(this.x - object.x, this.y - object.y);
    }
}
/**
 * Multiply this point by a scalar.
 * @param {number} number number to multiply by
 * @returns {Point} new point
 */
Point.prototype.multiply = function(number){
    let asNum = parseFloat(number);
    return new Point(this.x * asNum, this.y * asNum);
}
/**
 * divide this point by a scalar.
 * @param {number} number number to multiply by
 * @returns {Point} new point
 */
Point.prototype.divide = function(number){
    let asNum = parseFloat(number);
    return new Point(this.x / asNum, this.y / asNum);
}

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
let iconH = 1;
let currentOverlay = "Locations"; // Locations, NirnRoute, Exploration.
let hoverLocation = "";

//image objects
let topbar;
let overlay;

/**
 * Last position of the mouse. used for rendering mouseover stuff.
 */
var lastMouseLoc = new Point(0,0);
let mousedown = false;

let img_Map;
let icons = {};

/**
 * An object that will be displayed on the map canvas.
 */
function MapObject(){
    this.minX = 0;
    this.maxX = 0;
    this.minY = 0;
    this.maxY = 0;
}

MapObject.prototype.contains = function(point){
    return (this.minX < point.x && point.x < this.maxX && this.minY < point.y && point.y < this.maxY);
}
MapObject.prototype.width = function(){
    return this.maxX - this.minX;
}
MapObject.prototype.height = function(){
    return this.maxY - this.minY;
}

async function initMap(){
    //load map cord data

    viewport = document.getElementById("wrapper_Map");

    canvas = document.createElement("CANVAS");
    canvas.id = "canvas_Map";
    canvas.width = 3544;
    canvas.height = 2895;
    viewport.appendChild(canvas);
    ctx = canvas.getContext("2d");
    await initImgs();
    initTopbar();
    initOverlay();
    initListeners();

    //center map on imp city
    screenOriginInMapCoords = new Point(1700,885);

    drawFrame();
    console.log("map init'd");
}

function drawFrame(){
    drawBaseMap();
    drawMapOverlay();
    //TODO: don't have topbar overlay map. or move topbar or something aaa idk
    topbar.draw(ctx);
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
        nirnroots : [],
        lastZoomLevel : zoomLevel
    }

    runOnTree(jsondata.location, function(loc){
        overlay.locations.push(new MapIcon(loc));
    });

    runOnTree(jsondata.nirnroot, function(loc){
        if(loc.cell == "Outdoors"){
            overlay.nirnroots.push(new MapIcon(loc));
        }
    });
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
    }
    //Overlay Else if chain
    if(currentOverlay == "Locations"){
        let hloc = null; //tracks hovered location index to redraw it last.
        for(const locIcon of overlay.locations){
            locIcon.draw(ctx);
            if(locIcon.contains(lastMouseLoc)){
                hloc = locIcon;
            }
        }

        //last icon in array was just drawn, so redraw hovered icon so it appears on top of everything else.
        if(hloc != null){
            hloc.draw(ctx);
        }
    }
    else if(currentOverlay == "NirnRoute"){
        let hloc = null; //tracks hovered location index to redraw it last.
        for(const nirnIcon of overlay.nirnroots){
            nirnIcon.draw(ctx);
            if(nirnIcon.contains(lastMouseLoc)){
                hloc = nirnIcon;
            }
        }
    }
    else if(currentOverlay == "Exploration"){
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
                //click happened.
                return true;
            }
        }
    }
    else if(currentOverlay == "NirnRoute"){
        for(const icon of overlay.nirnroots){
            if(icon.contains(clickLocInMapSpace)){
                //TODO
                return true;
            }
        }
    }
    return false;
}

/**
 * Construct a map location object from a location json cell.
 * @param {*} cell 
 */
function MapIcon(cell){
    MapObject.call(this);

    this.cell = cell;

    this.recalculateBoundingBox();
    this.draw = drawIcon2;

    if(cell.hive.classname == "nirnroot"){
        this.icon = iconSwitch("Nirnroot");
    }
    else{
        this.icon = iconSwitch(cell.icon);
    }
}
MapIcon.prototype = Object.create(MapObject.prototype);

/**
 * whenever we zoom, we will need to call this.
 */
MapIcon.prototype.recalculateBoundingBox = function(){
    let mapCoords = worldSpaceToMapSpace(this.cell.x, this.cell.y);
    const halfHeightDown = Math.floor(iconH / 2);
    const halfHeightUp = Math.ceil(iconH / 2);
    this.minX = mapCoords.x - halfHeightDown;
    this.minY = mapCoords.y - halfHeightDown;
    //default state is only icon, so its easy
    this.maxX = mapCoords.x + halfHeightUp;
    this.maxY = mapCoords.y + halfHeightUp;
}

/**
 * Draw this icon on the canvas.
 * @param {CanvasRenderingContext2D} ctx 
 */
function drawIcon2(ctx){
    //draws the name for the map icon if hovered.
    //for drawing, we have to convert back to screen space.
    const screenSpaceIconOrigin = mapSpaceToScreenSpace(new Point(this.minX, this.minY));
    const TEXT_PADDING_PX = 2;
    if(this.cell.hive.classname != "nirnroot"){
        if(this.contains(lastMouseLoc)){
            //create rect that contains text and the icon.

            //start by initializing font stuff
            ctx.font = "16px";
            let textMetrics = ctx.measureText(this.cell.name);

            //create background of popup window
            ctx.beginPath();
            ctx.fillStyle = "#E5D9B9";
            ctx.rect(screenSpaceIconOrigin.x, screenSpaceIconOrigin.y, textMetrics.width + this.width() + TEXT_PADDING_PX * 2, this.height());
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.textBaseline = "middle";
            ctx.textAlign = "left";
            ctx.fillText(textMetrics.text, screenSpaceIconOrigin.x + this.width() + TEXT_PADDING_PX, screenSpaceIconOrigin.y + this.height() / 2);
            ctx.fill();
        }
    }
    ctx.drawImage(this.icon, screenSpaceIconOrigin.x, screenSpaceIconOrigin.y, this.width(), this.height());
    if(this.cell.id != null){
        if(savedata[this.cell.hive.classname][this.cell.id]){
            ctx.drawImage(icons.Check, screenSpaceIconOrigin.x, screenSpaceIconOrigin.y, this.width(), this.height());
        }
    }
}

/*********************************
 * TOPBAR FUNCTIONS
 *  this is the "topbar" on the map canvas.
 *********************************/

function initTopbar(){
    function MapButton(x,y,width,height,text){
        MapObject.call(this);
        this.minX = x;
        this.minY = y;
        this.maxX = x+width;
        this.maxY = y+height;
        this.name = text;
        this.draw = function(ctx){
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
    }
    MapButton.prototype = Object.create(MapObject.prototype);

    topbar = new MapObject();
    topbar.buttons = [];
    topbar.minX = 0;
    topbar.minY = 0;
    topbar.maxX = viewport.clientWidth;
    topbar.maxY = 32;

    topbar.buttons.push(new MapButton(8,6, topbar.width()/3, 20,"Locations"));
    topbar.buttons.push(new MapButton(topbar.width()/3,6, topbar.width()/3, 20,"NirnRoute"));
    topbar.buttons.push(new MapButton(topbar.width()/3*2, 6, topbar.width()/3 - 8, 20, "Exploration"));

    topbar.draw = function(ctx){
        let wX = viewport.clientWidth;

        //update our width here for hit detection
        this.maxX = wX;

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

    topbar.click = function topbarClick(coords){
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
        img_Map = document.createElement("img");
        img_Map.width = 3544;
        img_Map.height = 2895;
        img_Map.src = "images/Cyrodil_Upscaled.webp";
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
            resolve();
        };

        img_Map.onerror = function(){
            reject(this);
        };  
    });
}

function onMouseClick(mouseLoc){
    console.log("click at screen: " + mouseLoc+", map: "+screenSpaceToMapSpace(mouseLoc));
    let handled = topbar.click(mouseLoc);
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
}

function updateZoom(deltaZ, zoomCenterScreenCoords){
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
    iconH = m_iconH;

    //make map zoom in to center.
    //1: calculate current map center
    //screencoord is basically offset from upper left corner.
    let oldCenterMapCoord = screenSpaceToMapSpace(zoomCenterScreenCoords);
    let newCenterMapCoord = oldCenterMapCoord.multiply(oldZoom/zoomLevel);
    let newCenterScreenCoord = mapSpaceToScreenSpace(newCenterMapCoord);
    let newCornerMapCoord = newCenterMapCoord.subtract(zoomCenterScreenCoords);
    //we need to get the coords un-zoomed to determine where it is.
    //or just multiply by the zoom factor?

    //2. update screen origin to make new map center the same.
    //to get new upper left, 
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