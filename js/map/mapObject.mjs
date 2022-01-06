"use strict"
export {MapObject, MapIcon, MapPOI}

import {worldSpaceToMapSpace, mapSpaceToScreenSpace, iconH, icons, updateRandomGateCount, getRandomGateCount} from "../map.mjs"
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

function MapPOI(iconName,xOffset, yOffset, worldLocation){
    this.icon = iconSwitch(iconName);
    this.iconOffset = new Point(xOffset,yOffset);
    this.name = "aaaaa";
    this.worldLoc = worldLocation;
    this.recalculateBoundingBox();
}

MapPOI.prototype = Object.create(MapObject.prototype);

MapPOI.prototype.draw = function(ctx, _mouseLoc, _currentSelection){
    const screenSpaceIconOrigin = mapSpaceToScreenSpace(new Point(this.minX, this.minY));
    ctx.drawImage(this.icon, screenSpaceIconOrigin.x, screenSpaceIconOrigin.y, this.width(), this.height());
}

MapPOI.prototype.recalculateBoundingBox = function(){
    let mapCoords = worldSpaceToMapSpace(this.worldLoc);
    const halfHeightDown = Math.floor(iconH() / 2);
    const halfHeightUp = Math.ceil(iconH() / 2);
    this.minX = mapCoords.x + this.iconOffset.x;
    this.minY = mapCoords.y + this.iconOffset.y;
    this.maxX = mapCoords.x + (30 + this.iconOffset.x);
    this.maxY = mapCoords.y + (37 + this.iconOffset.y);
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
            let linesToRender = [this.cell.name];

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
                    case 0: linesToRender.push("travel time: <1hr"); break;
                    case 1: linesToRender.push("travel time: 1hr"); break;
                    default: linesToRender.push("travel time: "+tTime+"hrs"); break;
                }
            }
            //create rect that contains text and the icon.

            //start by initializing font stuff
            const TEXT_HEIGHT = 16;
            ctx.font = "16px serif";

            //create background of popup window
            ctx.beginPath();
            ctx.fillStyle = "#E5D9B9";
            let maxTextWidth = 0;
            for(let i = 0; i < linesToRender.length; i++){
                let textMetrics = ctx.measureText(linesToRender[i]);
                if(textMetrics.width > maxTextWidth){
                    maxTextWidth = textMetrics.width;
                }
            }

            let backgroundWidth = this.width() + maxTextWidth + TEXT_PADDING_PX * 2;
            let backgroundHeight = Math.max(this.height(), (TEXT_HEIGHT+TEXT_PADDING_PX) * linesToRender.length);
            ctx.rect(screenSpaceIconOrigin.x, screenSpaceIconOrigin.y, backgroundWidth, backgroundHeight);
            ctx.fill();

            //draw all text
            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.textBaseline = "middle";
            ctx.textAlign = "left";

            const startingOffset = TEXT_PADDING_PX + TEXT_HEIGHT / 2;
            for(let i = 0; i < linesToRender.length; i++){
                if(linesToRender.length == 1){
                    ctx.fillText(linesToRender[i], screenSpaceIconOrigin.x + this.width() + TEXT_PADDING_PX, screenSpaceIconOrigin.y + this.height() / 2);
                }
                else{
                    let currentLineY = screenSpaceIconOrigin.y + startingOffset + (TEXT_HEIGHT + TEXT_PADDING_PX) * i;
                    ctx.fillText(linesToRender[i], screenSpaceIconOrigin.x + this.width() + TEXT_PADDING_PX, currentLineY);
                }
            }
            ctx.fill();
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

    //Draw extra gate icons
    if(this.cell.name.includes("Oblivion Gate")){
        let n = this.cell.notes;
        if(n.includes("Random") && getRandomGateCount() >= 40){
            ctx.drawImage(icons.Check, screenSpaceIconOrigin.x, screenSpaceIconOrigin.y, this.width(), this.height());
        }
        if(n.includes("Fixed")){
            ctx.drawImage(icons.Overlay_Fixed, screenSpaceIconOrigin.x, screenSpaceIconOrigin.y, this.width(), this.height());
        }
        if(n.includes("No Reroll")){    
            ctx.drawImage(icons.Overlay_No_Reroll, screenSpaceIconOrigin.x, screenSpaceIconOrigin.y, this.width(), this.height());
        }
        if(n.includes("2 Fame")){
            ctx.drawImage(icons.Overlay_Two_Fame, screenSpaceIconOrigin.x, screenSpaceIconOrigin.y, this.width(), this.height());
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
    
    if(this.cell.notes && this.cell.notes.includes("Random")){
        updateRandomGateCount(!prevState);
    }
    return true;
}