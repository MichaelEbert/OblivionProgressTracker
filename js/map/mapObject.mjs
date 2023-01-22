"use strict"
export {
    MapObject, 
    MapImage,
    MapLocation,
    MapPOI,
    GateLocation as GateIcon,

}

import {worldSpaceToMapSpace, mapSpaceToScreenSpace, getImageScale, icons, updateRandomGateCount, getRandomGateCount} from "../map.mjs"
import {Point} from "./point.mjs"
import {updateChecklistProgress} from "../progressCalculation.mjs"
import {iconSwitch} from "../map.mjs"
import { findCell } from "../obliviondata.mjs"
import { recalculateProgress } from "../progressCalculation.mjs"

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
