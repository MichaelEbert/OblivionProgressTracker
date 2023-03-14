"use strict"
export {
    MapLocation,
    GateLocation
}

import {worldSpaceToMapSpace, mapSpaceToScreenSpace, updateRandomGateCount, getRandomGateCount} from "../map.mjs"
import {Point} from "./point.mjs"
import {updateChecklistProgress} from "../progressCalculation.mjs"
import { findCell } from "../obliviondata.mjs"
import { recalculateProgress } from "../progressCalculation.mjs"
import { MapObject, LocationIcon, GateIcon} from "./mapObject.mjs"

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
        this.icon.checked=true;
    }
    else{
        this.prediscovered = false;
    }
    this.recalculateBoundingBox();
    this.width = this.icon.width;
    this.height = this.icon.height;

    // set checked/unchecked and hook in to change listeners.
    const m_icon = this.icon;
    function onValueUpdateFunc(cell, newCellValue){
        m_icon.checked = newCellValue;
    }
    if(this.cell.id != null){
        let currentValue = window.savedata[this.cell.hive.classname][this.cell.id]
        onValueUpdateFunc(null, currentValue);
        this.cell.onUpdate.push(onValueUpdateFunc);
    }
    else if(this.cell.ref != null){
        let refCell = findCell(this.cell.ref);
        if(refCell?.id != null){
            let currentValue = window.savedata[refCell.hive.classname][refCell.id];
            onValueUpdateFunc(null, currentValue);
            refCell.onUpdate.push(onValueUpdateFunc);
        }
    }
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
    //TODO: move this to correct function
    
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
        let formattedName = this.cell.name;
        if(this.cell.hive.classname == "nirnroot"){
            formattedName += " (#" + this.cell.tspId + ")";
        }
        let linesToRender = [formattedName];

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
        const bordersize = 2;
        ctx.beginPath();
        ctx.fillStyle = "#00DD00";
        ctx.rect(screenSpaceOrigin.x - bordersize, screenSpaceOrigin.y - bordersize, this.icon.width + (bordersize * 2), this.icon.height + (bordersize*2));
        ctx.fill();

    }
    this.icon.draw(ctx);
}

MapLocation.prototype.onClick = function(clickPos){
    if(window.settings.mapShowPrediscovered == false && this.prediscovered){
        return false;
    }
    if(window.debug){
        console.log(this.cell.name + " clicked (formId "+this.cell.formId+")");
    }

    let wasChanged = updateChecklistProgress(null, !this.icon.checked, null, this.cell);
    
    if(wasChanged){
        recalculateProgress();
    }
    return true;
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
    //we changed the icon, we need to update 
    // set checked/unchecked and hook in to change listeners.
    const m_icon = this.icon;
    function onValueUpdateFunc(cell, newCellValue){
        m_icon.checked = newCellValue;
    }
    if(this.cell.id != null){
        let currentValue = window.savedata[this.cell.hive.classname][this.cell.id]
        onValueUpdateFunc(null, currentValue);
        //replace prev onValueUpdateFunc with this one
        this.cell.onUpdate.pop();
        this.cell.onUpdate.push(onValueUpdateFunc);
    }
    else if(this.cell.ref != null){
        let refCell = findCell(this.cell.ref);
        if(refCell?.id != null){
            let currentValue = window.savedata[refCell.hive.classname][refCell.id];
            
            onValueUpdateFunc(null, currentValue);
            //replace prev onValueUpdateFunc with this one
            refCell.onUpdate.pop();
            refCell.onUpdate.push(onValueUpdateFunc);
        }
    }
    
    // in addition to found/notfound, gates have closed/notclosed.
    function onValueUpdateFuncClosed(cell, newCellValue){
        m_icon.closed = newCellValue;
    }
    let gateCloseCell = findCell(this.cell.gateCloseLink);
    if(gateCloseCell != null){
        let currentValue = window.savedata[gateCloseCell.hive.classname][gateCloseCell.id]
        onValueUpdateFuncClosed(null, currentValue);
        gateCloseCell.onUpdate.push(onValueUpdateFuncClosed);
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
    MapLocation.prototype.draw.call(this, ctx, mouseLoc, currentSelection);
}

GateLocation.prototype.onClick = function(clickPos){
    if(this.contains(clickPos)){
        if(window.debug){
            console.log(this.cell.name + " clicked (formId "+this.cell.formId+")");
        }
        let gateCloseCell = findCell(this.cell.gateCloseLink);
        const isDiscovered = window.savedata[this.cell.hive.classname][this.cell.id];
        const isClosed = window.savedata[gateCloseCell.hive.classname][gateCloseCell.id];

        let oldState = isDiscovered<<1|isClosed
        switch(oldState){
        case (0)://not discovered or closed
        case (1)://not discovered, closed(??!)
            updateChecklistProgress(null, true, null, this.cell);
            if(this.isRandom){
                updateRandomGateCount(true);
            }
            break;
        case (2)://discovered, not closed:
            updateChecklistProgress(null, true, null, gateCloseCell);
            break;
        case (3)://discovered and closed:  reset to default.
            updateChecklistProgress(null, false, null, gateCloseCell);
            updateChecklistProgress(null, false, null, this.cell);
            if(this.isRandom){
                updateRandomGateCount(false);
            }
            break;
        }
        recalculateProgress();
        return true;
    }
    return false;
}