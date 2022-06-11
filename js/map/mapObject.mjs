"use strict"
export {
    MapObject, 
    MapLocation,
    MapPOI,
    GateLocation as GateIcon
}

import {worldSpaceToMapSpace, mapSpaceToScreenSpace, getImageScale, icons, updateRandomGateCount, getRandomGateCount} from "../map.mjs"
import {Point} from "./point.mjs"
import {updateChecklistProgress} from "../progressCalculation.mjs"
import {iconSwitch} from "../map.mjs"
import { findCell } from "../obliviondata.mjs"

//need canvas for compositing
const imageBuffer = document.createElement("canvas");

/**
 * An object that will be displayed on the map canvas.
 */
function CanvasObject(){
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
}

/**
 * Does this object contain the specified point?
 * @param {Point} point point to check
 */
CanvasObject.prototype.contains = function(point){
    if(point == null){
        return false;
    }
    return (this.x < point.x &&
            this.y < point.y &&
              point.x < this.x+this.width &&
              point.y < this.y+this.height);
}
CanvasObject.prototype.maxX = function(){
    return this.x + this.width;
}
CanvasObject.prototype.maxY = function(){
    return this.y + this.height;
}

/**
 * Object with map coordinates, as opposed to just UI coords.
 * @param worldLoc 
 */
function MapObject(worldLoc)
{
    //we cache the mapX and mapY so we only have to recalculate those when we scale the entire map.
    this.mapLoc = null;
    this.worldLoc = worldLoc;
}

MapObject.prototype = Object.create(CanvasObject.prototype);

/**
 * Call on zoom.
 */
MapObject.prototype.recalculateBoundingBox = function(){
    this.mapLoc = worldSpaceToMapSpace(this.worldLoc);
}


MapObject.prototype.draw = function(_ctx){
    const uiCoords = mapSpaceToScreenSpace(this.mapLoc);
    this.x = uiCoords.x;
    this.y = uiCoords.y;
}

/**
 * Image that has map coords.
 * @param {string} iconName image name for iconSwitch.
 * @param {number} imageOffsetX fractional offset from top left of image to where the icon should be drawn. Use for centering, left justify, etc.
 * @param {number} imageOffsetY fractional offset from top left of image to where the icon should be drawn. Use for centering, left justify, etc.
 * @param {Point} worldLocation Where image should be drawn in world coordinates.
 */
function MapImage(iconName, imageOffsetX, imageOffsetY, worldLocation){
    MapObject.call(this, worldLocation);
    this.icon = iconSwitch(iconName);
    this.iconOffsetFractions = new Point(imageOffsetX, imageOffsetY);
    this.recalculateBoundingBox();
}

MapImage.prototype = Object.create(MapObject.prototype);

MapImage.prototype.draw = function(ctx){
    const screenSpaceOrigin = mapSpaceToScreenSpace(this.mapLoc).subtract(this.iconOffsetPx);
    this.x = screenSpaceOrigin.x;
    this.y = screenSpaceOrigin.y;
    ctx.drawImage(this.icon, screenSpaceOrigin.x, screenSpaceOrigin.y, this.width, this.height);
}

MapImage.prototype.recalculateBoundingBox = function(){
    MapObject.prototype.recalculateBoundingBox.call(this);
    this.width = this.icon.width * getImageScale();
    this.height = this.icon.height * getImageScale();
    this.iconOffsetPx = this.iconOffsetFractions.multiply(new Point(this.icon.width, this.icon.height)).multiply(getImageScale());
    const screenSpaceOrigin = mapSpaceToScreenSpace(this.mapLoc).subtract(this.iconOffsetPx);
    this.x = screenSpaceOrigin.x;
    this.y = screenSpaceOrigin.y;
}

function MapPOI(iconName,xOffset, yOffset, worldLocation){
    this.image = new MapImage(iconName, xOffset, yOffset, worldLocation);
    this.name = "aaaaa";
}

MapPOI.prototype = Object.create(MapObject.prototype);

MapPOI.prototype.draw = function(ctx){
    this.image.draw(ctx);
}

MapPOI.prototype.recalculateBoundingBox = function(){
    this.image.recalculateBoundingBox();
}

MapPOI.prototype.contains = function(point){
    return this.image.contains(point);
}

/**
 * Represents the icon of a location. Can render checked or unchecked.
 * @param iconName 
 * @param imageOffsetX 
 * @param imageOffsetY 
 * @param worldLocation 
 */
function LocationIcon(iconName, imageOffsetX, imageOffsetY, worldLocation){
    MapImage.call(this, iconName, imageOffsetX, imageOffsetY, worldLocation);
    this.checked = false;
}

LocationIcon.prototype = Object.create(MapImage.prototype);

LocationIcon.prototype.draw = function(ctx){
    //mapImage::draw sets x and y correctly
    // so we don't have to do it again
    MapImage.prototype.draw.call(this, ctx);
    if(this.checked){
        ctx.drawImage(icons.Check, this.x, this.y, this.width, this.height);
    }
}

/**
 * Construct a map location object from a location json cell.
 * @param {*} cell 
 */
function MapLocation(cell){
    const worldLoc = new Point(cell.x, cell.y)
    MapObject.call(this, worldLoc);

    this.cell = cell;
    if(cell.hive.classname == "nirnroot"){
        this.icon = new LocationIcon("Nirnroot", 0.5, 0.5, worldLoc);
    }
    else{
        this.icon = new LocationIcon(cell.icon, 0.5, 0.5, worldLoc);
    }

    if(this.cell.hive.classname=="locationPrediscovered"){
        this.prediscovered = true;
    }
    else{
        this.prediscovered = false;
    }
    this.recalculateBoundingBox();
    this.width = this.icon.width;
    this.height = this.icon.height;
}
MapLocation.prototype = Object.create(MapObject.prototype);

/**
 * whenever we zoom, we will need to call this.
 */
MapLocation.prototype.recalculateBoundingBox = function(){
    this.icon.recalculateBoundingBox();
    this.mapLoc = worldSpaceToMapSpace(this.worldLoc);
    const screenSpaceOrigin = mapSpaceToScreenSpace(this.mapLoc).subtract(this.icon.iconOffsetPx);
    this.x = screenSpaceOrigin.x;
    this.y = screenSpaceOrigin.y;
    this.width = this.icon.width;
    this.height = this.icon.height;
}

/**
 * Draw this icon on the canvas.
 * @param {CanvasRenderingContext2D} ctx 
 */
MapLocation.prototype.draw = function(ctx, mouseLoc, currentSelection){
    //draws the name for the map icon if hovered.
    //for drawing, we have to convert back to screen space.
    //offset by 1/2 width of icon.
    const screenSpaceOrigin = mapSpaceToScreenSpace(this.mapLoc).subtract(this.icon.iconOffsetPx);
    const TEXT_PADDING_PX = 2;
    
    this.x = screenSpaceOrigin.x;
    this.y = screenSpaceOrigin.y;

    if(window.settings.mapShowPrediscovered == false && this.prediscovered){
        return;
    }
    if(this.contains(mouseLoc)){
        //start with array with single element
        let linesToRender = [this.cell.name];

        if(window.settings.mapShowFormId == true){
            linesToRender.push("formId " + this.cell.formId.toString());
        }

        if(this.cell.notes){
            this.cell.notes.split(", ").forEach(note => {
                linesToRender.push(note);
            });
        }

        //calculate distance to display.
        if(currentSelection != null && window.settings.mapShowDistanceCheck){
            let dx = this.cell.x - currentSelection.cell.x;
            let dy = this.cell.y - currentSelection.cell.y;
            let dist = Math.round(Math.sqrt(Math.pow(dx, 2)+Math.pow(dy,2)));
            linesToRender.push("distance: "+dist)
            
            let tTime = Math.floor(dist/50000);
            //Use a switch to get correct grammar.
            switch(tTime){
                case 0: linesToRender.push("travel time: "+(Math.round(dist/50000*100)/100).toString()+"hr"); break;
                case 1: linesToRender.push("travel time: 1hr"); break;
                default: linesToRender.push("travel time: "+tTime+"hrs"); break;
            }
        }
        //create rect that contains text and the icon.

        //start by initializing font stuff
        const TEXT_HEIGHT = 16;
        ctx.font = "16px serif";

        //create background of popup window
        
        let maxTextWidth = 0;
        for(let i = 0; i < linesToRender.length; i++){
            let textMetrics = ctx.measureText(linesToRender[i]);
            if(textMetrics.width > maxTextWidth){
                maxTextWidth = textMetrics.width;
            }
        }

        let backgroundWidth = this.icon.width + maxTextWidth + TEXT_PADDING_PX * 2;
        let backgroundHeight = Math.max(this.icon.height, (TEXT_HEIGHT+TEXT_PADDING_PX) * linesToRender.length);
        ctx.beginPath();
        ctx.fillStyle = "#E5D9B9";
        ctx.fillRect(screenSpaceOrigin.x, screenSpaceOrigin.y, backgroundWidth, backgroundHeight);

        //draw all text
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";

        const startingOffset = TEXT_PADDING_PX + TEXT_HEIGHT / 2;
        for(let i = 0; i < linesToRender.length; i++){
            if(linesToRender.length == 1){
                ctx.fillText(linesToRender[i], screenSpaceOrigin.x + this.icon.width + TEXT_PADDING_PX, screenSpaceOrigin.y + this.icon.height / 2);
            }
            else{
                let currentLineY = screenSpaceOrigin.y + startingOffset + (TEXT_HEIGHT + TEXT_PADDING_PX) * i;
                ctx.fillText(linesToRender[i], screenSpaceOrigin.x + this.icon.width + TEXT_PADDING_PX, currentLineY);
            }
        }
        ctx.fill();
    }
    //green highlight
    if(currentSelection == this){
        ctx.beginPath();
        ctx.fillStyle = "#00DD00";
        ctx.rect(screenSpaceOrigin.x - 1, screenSpaceOrigin.y - 1, this.icon.width + 2, this.icon.height + 2);
        ctx.fill();

    }
    if(this.cell.id != null){
        if(window.savedata[this.cell.hive.classname][this.cell.id]){
            this.icon.checked = true;
        }
        else{
            this.icon.checked = false;
        }
    }
    this.icon.draw(ctx);
}

//actually happens on double click
MapLocation.prototype.onClick = function(clickPos){
    if(window.settings.mapShowPrediscovered == false && this.prediscovered){
        return false;
    }
    if(this.cell.id == null){
        //no id, so you can't click it.
        return false;
    }
    if(window.debug){
        console.log(this.cell.name + " clicked (formId "+this.cell.formId+")");
    }
    const classname = this.cell.hive.classname;
    let prevState = window.savedata[classname][this.cell.id];
    updateChecklistProgress(null, !prevState, null, this.cell);
    
    return true;
}


//like image/icon, but for gates specifically.
function GateIcon(iconName, imageOffsetX, imageOffsetY, worldLocation){
    LocationIcon.call(this, iconName, imageOffsetX, imageOffsetY, worldLocation);
    //additional properties for gate icons
    this.enabled = true;
    this.closed = false;

    //overlays
    this.fixed = false;
    this.noReroll = false;
    this.twoFame = false;
}

GateIcon.prototype = Object.create(LocationIcon.prototype);

GateIcon.prototype.draw = function(ctx){
    //override the default locationIcon draw because we do effects!
    const screenSpaceOrigin = mapSpaceToScreenSpace(this.mapLoc).subtract(this.iconOffsetPx);
    this.x = screenSpaceOrigin.x;
    this.y = screenSpaceOrigin.y;
    //draw icon to secondary buffer, then draw buffer to main window.
    const iWidth = this.width;
    const iHeight = this.height;
    let bufferCtx = imageBuffer.getContext("2d");

    //draw icon
    bufferCtx.globalCompositeOperation = "copy"
    bufferCtx.drawImage(this.icon, 0, 0, iWidth, iHeight);

    //effects.
    if(this.enabled == false){
        //desaturate
        bufferCtx.globalCompositeOperation = "color";
        bufferCtx.fillStyle = "#222222";
        bufferCtx.fillRect(0,0,iWidth, iHeight);
    }
    else if(this.closed){
        bufferCtx.globalCompositeOperation = "color";
        bufferCtx.fillStyle = "#FF0000";
        bufferCtx.fillRect(0,0,iWidth, iHeight);
    }

    bufferCtx.globalCompositeOperation = "source-over";
    if(this.checked){
        bufferCtx.drawImage(icons.Check, 0, 0, iWidth, iHeight);
    }

    //draw gate icons
    if(this.fixed){
        bufferCtx.drawImage(icons.Overlay_Fixed, 0, 0, iWidth, iHeight);
    }
    if(this.noReroll){
        bufferCtx.drawImage(icons.Overlay_No_Reroll, 0, 0, iWidth, iHeight);
    }
    if(this.twoFame){
        bufferCtx.drawImage(icons.Overlay_Two_Fame, 0, 0, iWidth, iHeight);
    }

    //finally, draw the buffer image to main.
    ctx.drawImage(imageBuffer,0,0,iWidth,iHeight, this.x, this.y, iWidth, iHeight);
}

//Gate icons are special, so they get their own class.
function GateLocation(cell){
    MapLocation.call(this, cell);
    const worldLoc = new Point(cell.x, cell.y)
    this.icon = new GateIcon(cell.icon, 0.5, 0.5, worldLoc);
    //initialize additional properties from notes
    this.isRandom = cell.notes?.includes("Random") ?? false;
    let notes = this.cell.notes.split(", ");
    if(notes.find((x=>x == "Fixed"))){
        this.icon.fixed = true;
    }
    if(notes.find((x=>x == "Two_Fame"))){
        this.icon.twoFame = true;
    }
    if(notes.find((x=>x == "No_Reroll"))){
        this.icon.noReroll = true;
    }
}

GateLocation.prototype = Object.create(MapLocation.prototype);

GateLocation.prototype.draw = function(ctx, mouseLoc, currentSelection){
    if(this.isRandom && getRandomGateCount() >= 40 && !this.icon.checked){
        this.icon.enabled = false;
    }
    else{
        this.icon.enabled = true;
    }

    let gateCloseCell = findCell(this.cell.gateCloseLink);
    if(gateCloseCell != null && window.savedata[gateCloseCell.hive.classname][gateCloseCell.id]){
        this.icon.closed = true;
    }
    else{
        this.icon.closed = false;
    }
    MapLocation.prototype.draw.call(this, ctx, mouseLoc, currentSelection);
}

GateLocation.prototype.onClick = function(clickPos){
    if(this.contains(clickPos)){
        if(window.debug){
            console.log(this.cell.name + " clicked (formId "+this.cell.formId+")");
        }
        const isDiscovered = window.savedata[this.cell.hive.classname][this.cell.id];
        let gateCloseCell = findCell(this.cell.gateCloseLink);
        const isClosed = window.savedata[gateCloseCell.hive.classname][gateCloseCell.id];
        if(!isDiscovered){
            updateChecklistProgress(null, true, null, this.cell);
            if(this.isRandom){
                updateRandomGateCount(true);
            }
        }
        else{
            //discovered == true
            if(!isClosed){
                updateChecklistProgress(null, true, null, gateCloseCell);
            }
            else{
                //discovered and closed. reset to default.
                updateChecklistProgress(null, false, null, gateCloseCell);
                updateChecklistProgress(null, false, null, this.cell);
                if(this.isRandom){
                    updateRandomGateCount(false);
                }
            }
        }
        
        return true;
    }
    return false;
}