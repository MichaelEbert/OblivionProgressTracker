"use strict"

export { Overlay, OVERLAY_LAYER_NONE, OVERLAY_LAYER_LOCATIONS, OVERLAY_LAYER_NIRNROOTS, OVERLAY_LAYER_WAYSHRINES };

import { MapLocation, GateIcon } from "./mapObject.mjs";
import { Point } from "./point.mjs";
import { getZoomLevel, screenSpaceToMapSpace } from "../map.mjs"
import { TSPLocation, TSPPath, TSP_STYLE_SOLID, TSP_STYLE_DASHED } from "./tspPath.mjs";
import { OverlayLayer } from "./overlayLayer.mjs"
import { runOnTree, jsondata } from "../obliviondata.mjs";
import { findCell } from "../obliviondata.mjs";

const OVERLAY_LAYER_NONE = 0x0;
const OVERLAY_LAYER_LOCATIONS = 0x1;
const OVERLAY_LAYER_NIRNROOTS = 0x2;
const OVERLAY_LAYER_WAYSHRINES = 0x4;

/*********************************
 * OVERLAY FUNCTIONS
 *  this is the icons n stuff on the map canvas.
 *********************************/
function Overlay(){
    this.layers = new Map();
    this.lastZoomLevel = undefined;
    this.currentLocation = null;
    this.activeLayers = OVERLAY_LAYER_NONE;
    this.activeTsp = OVERLAY_LAYER_NONE;

    //the following funcitons need a captured this variable
    let locTspArr = [];
    let locationArr = [];
    let nirnTspArr = [];
    let nirnrootArr = [];
    let wayshrineArr = [];
    runOnTree(jsondata.location, function(loc){
        let newIcon = null;
        if(loc.name.includes("Oblivion Gate")){
            newIcon = new GateIcon(loc);
        }
        else{
            newIcon = new MapLocation(loc);
        }
        locationArr.push(newIcon);
        
        if(loc.tspId != null){
            locTspArr.push(new TSPLocation(loc.x, loc.y, loc.tspId));
        }
    });

    runOnTree(jsondata.locationPrediscovered, function(loc){
        let newIcon = null;
        if(loc.name.includes("Oblivion Gate")){
            newIcon = new GateIcon(loc);
        }
        else{
            newIcon = new MapLocation(loc);
        }
        locationArr.push(newIcon);
        
        if(loc.tspId != null){
            locTspArr.push(new TSPLocation(loc.x, loc.y, loc.tspId));
        }
    });

    runOnTree(jsondata.nirnroot, function(nirn){
        if(nirn.cell == "Outdoors" && nirn.parent.name != "City"){
            let newIcon = new MapLocation(nirn)
            nirnrootArr.push(newIcon);

            if(nirn.tspId != null){
                if(nirn.fastTravelId != null){
                    let maybeFastTravelLoc = findCell(nirn.fastTravelId, "location");
                    if(maybeFastTravelLoc != null){
                        nirnTspArr.push(new TSPLocation(maybeFastTravelLoc.x, maybeFastTravelLoc.y, nirn.tspId - 0.1, TSP_STYLE_DASHED));
                    }
                }
                nirnTspArr.push(new TSPLocation(nirn.x, nirn.y, nirn.tspId, TSP_STYLE_SOLID));
            }
        }
    });

    let cityNirnArr = [];
    runOnTree(jsondata.nirnroot, function(nirn){
        if(nirn.cell == "Outdoors" && nirn.parent.name == "City"){
            let newIcon = new MapLocation(nirn)
            cityNirnArr.push(newIcon);

            if(nirn.tspId != null){
                if(nirn.fastTravelId != null){
                    let maybeFastTravelLoc = findCell(nirn.fastTravelId, "location");
                    if(maybeFastTravelLoc != null){
                        nirnTspArr.push(new TSPLocation(maybeFastTravelLoc.x, maybeFastTravelLoc.y, nirn.tspId - 0.1, TSP_STYLE_DASHED));
                    }
                }
                nirnTspArr.push(new TSPLocation(nirn.x, nirn.y, nirn.tspId, TSP_STYLE_SOLID));
            }
        }
    });

    runOnTree(jsondata.wayshrine, function(loc){
        let newIcon = new MapLocation(loc);
        wayshrineArr.push(newIcon);
    });

    //Sort and run intial world->map->screen space calculations for TSP arrays.
    this.layers.set("locations",new OverlayLayer(locationArr, locTspArr));
    this.layers.set("nirnroots",new OverlayLayer(nirnrootArr, nirnTspArr));
    this.layers.set("wayshrines",new OverlayLayer(wayshrineArr));
    this.layers.set("cityNirns",new OverlayLayer(cityNirnArr));
    this.layers.get("cityNirns").visible = false;

    this.setActiveLayers(OVERLAY_LAYER_LOCATIONS);
}

Overlay.prototype.recalculateBoundingBox = function(){
    for(const layer of this.layers.values()){
        layer.recalculateBoundingBox();
    }
}
/**
 * location currently hovered over
 */
var hloc = null;

/**
 * Draw icons on the map
 */
Overlay.prototype.draw = function(ctx, mouseLoc, zoomLevel){
    if(zoomLevel != this.lastZoomLevel){
        this.lastZoomLevel = zoomLevel;
        this.recalculateBoundingBox();
    }

    if(!hloc?.contains(mouseLoc)){
        hloc = null;
    }

    let hlocRef = {value:hloc};
    for(const layer of this.layers.values()){
        layer.draw(ctx, mouseLoc, this.currentLocation, hlocRef);
    }
    hloc = hlocRef.value;

    if(this.poi != null){
        this.poi.draw(ctx);
    }

    if(this.currentLocation != null){
        this.currentLocation.draw(ctx, null, this.currentLocation);
        //unlike all the others, always default to hloc == currentLocation.
        if(this.currentLocation.contains(mouseLoc)){
            hloc = this.currentLocation;
        }
    }

    //last icon in array was just drawn, so redraw hovered icon so it appears on top of everything else.
    if(hloc != null){
        hloc.draw(ctx, mouseLoc, this.currentLocation);
    }
}

Overlay.prototype.click = function(clickLoc){
    for(const layer of this.layers.values()){
        if(layer.click(clickLoc, this)){
            return true;
        }
    }
    
    //allow deselecting element even if nothing else is enabled
    if(this.currentLocation?.contains(clickLoc))
    {
        this.currentLocation = null;
        return true;
    }
    return false;
}

/**
 * Handle click on the overlay layer.
 * @param {Point} lastMouseLoc screen space coordinates of mouse click
 * @returns if click was handled (ie, something was clicked on)
 */
Overlay.prototype.doubleClick = function(clickLoc){
    //overlay coordinates are all in map space, so we convert to that before checking.
    for(const layer of this.layers.values()){
        if(layer.doubleClick(clickLoc)){
            return true;
        }
    }
    return false;
}

Overlay.prototype.setActiveLayers = function(layers, tsp){

    if(layers != null){
        this.activeLayers = layers;
        this.layers.get("locations").visible = ((layers & OVERLAY_LAYER_LOCATIONS) != 0);
        this.layers.get("nirnroots").visible = ((layers & OVERLAY_LAYER_NIRNROOTS) != 0);
        this.layers.get("wayshrines").visible = ((layers & OVERLAY_LAYER_WAYSHRINES) != 0);
    }
    
    if(tsp != null){
        this.layers.get("locations").tspVisible = ((tsp & OVERLAY_LAYER_LOCATIONS) != 0);
        this.layers.get("nirnroots").tspVisible = ((tsp & OVERLAY_LAYER_NIRNROOTS) != 0);
        this.layers.get("wayshrines").tspVisible = ((tsp & OVERLAY_LAYER_WAYSHRINES) != 0);
    }

}

Overlay.prototype.addActiveLayer = function(newLayer){
    this.activeLayers |= newLayer;
    this.setActiveLayers(this.activeLayers);
}

Overlay.prototype.setActiveTsp = function(tsp){
    switch(tsp){
        case OVERLAY_LAYER_NONE:
        case OVERLAY_LAYER_LOCATIONS:
        case OVERLAY_LAYER_NIRNROOTS:
            this.activeTsp = tsp;
            this.setActiveLayers(null, tsp);
            break;
        default:
            console.error("unknown TSP selected:" + tsp);
            this.activeTsp = OVERLAY_LAYER_NONE;
            break;
    }
}

/**
 * Search for an icon by its formid.
 * @param formId 
 */
Overlay.prototype.getIconByFormId = function(formId){
    for(const layer of this.layers.values()){
        let maybeLoc = layer.icons.find(x=>x.cell.formId == formId);
        if(maybeLoc){
            return maybeLoc;
        }
    }
    return null;
}

Overlay.prototype.setCurrentLocationByFormId = function(formId){
    let icon = this.getIconByFormId(formId);
    if(icon != null){
        this.currentLocation = icon;
    }
}