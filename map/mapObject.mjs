"use strict"
export {MapObject, MapIcon}

import {worldSpaceToMapSpace, mapSpaceToScreenSpace, iconH, icons} from "../map.js"
import {Point} from "./point.mjs"

/**
 * An object that will be displayed on the map canvas.
 */
function MapObject(){
    this.minX = 0;
    this.maxX = 0;
    this.minY = 0;
    this.maxY = 0;
}
/**
 * Does this object contain the specified point?
 * @param {Point} point point to check
 */
MapObject.prototype.contains = function(point){
    if(point == null){
        return false;
    }
    return (this.minX < point.x && point.x < this.maxX && this.minY < point.y && point.y < this.maxY);
}
MapObject.prototype.width = function(){
    return this.maxX - this.minX;
}
MapObject.prototype.height = function(){
    return this.maxY - this.minY;
}

/**
 * Construct a map location object from a location json cell.
 * @param {*} cell 
 */
function MapIcon(cell){
    MapObject.call(this);

    this.cell = cell;
    this.recalculateBoundingBox();
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
    let mapCoords = worldSpaceToMapSpace(new Point(this.cell.x, this.cell.y));
    const halfHeightDown = Math.floor(iconH() / 2);
    const halfHeightUp = Math.ceil(iconH() / 2);
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
MapIcon.prototype.draw = function(ctx, mouseLoc, currentSelection){
    //draws the name for the map icon if hovered.
    //for drawing, we have to convert back to screen space.
    const screenSpaceIconOrigin = mapSpaceToScreenSpace(new Point(this.minX, this.minY));
    const TEXT_PADDING_PX = 2;
    if(this.cell.hive.classname != "nirnroot"){
        if(this.contains(mouseLoc)){
            //create rect that contains text and the icon.

            //start by initializing font stuff
            ctx.font = "16px serif";
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
            ctx.fillText(this.cell.name, screenSpaceIconOrigin.x + this.width() + TEXT_PADDING_PX, screenSpaceIconOrigin.y + this.height() / 2);
            ctx.fill();

            //TODO: distance here.
        }
    }
    if(currentSelection == this){
        ctx.beginPath();
        ctx.fillStyle = "#00DD00";
        ctx.rect(screenSpaceIconOrigin.x - 1, screenSpaceIconOrigin.y - 1, this.width() + 2, this.height() + 2);
        ctx.fill();

    }
    ctx.drawImage(this.icon, screenSpaceIconOrigin.x, screenSpaceIconOrigin.y, this.width(), this.height());
    if(this.cell.id != null){
        if(window.savedata[this.cell.hive.classname][this.cell.id]){
            ctx.drawImage(icons.Check, screenSpaceIconOrigin.x, screenSpaceIconOrigin.y, this.width(), this.height());
        }
    }
}

MapIcon.prototype.onClick = function(clickPos){
    if(this.cell.id == null){
        //no id, so you can't click it.
        return false;
    }
    if(window.debug){
        console.log(this.cell.name + " clicked (formId "+this.cell.formId+")");
    }
    const classname = this.cell.hive.classname;
    let prevState = window.savedata[classname][this.cell.id];
    window.updateChecklistProgress(null, !prevState, null, this.cell);
    return true;
}