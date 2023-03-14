"use strict"

export { Overlay, OVERLAY_LAYER_NONE, OVERLAY_LAYER_LOCATIONS, OVERLAY_LAYER_NIRNROOTS, OVERLAY_LAYER_WAYSHRINES, OVERLAY_LAYER_CITYNIRNS, OVERLAY_LAYER_NEARBYGATES };

import { MapLocation, GateLocation } from "./mapLocation.mjs";
import { Point } from "./point.mjs";
import { getZoomLevel, screenSpaceToMapSpace } from "../map.mjs"
import { TSPLocation, TSPPath, TSP_STYLE_SOLID, TSP_STYLE_DASHED } from "./tspPath.mjs";
import { OverlayLayer } from "./overlayLayer.mjs"
import { runOnTree, jsondata } from "../obliviondata.mjs";
import { findCell } from "../obliviondata.mjs";
import { NearbyGatesLayer, NearbyLine } from "./nearbyGatesLayer.mjs";

const OVERLAY_LAYER_NONE = "";
const OVERLAY_LAYER_LOCATIONS = "locations";
const OVERLAY_LAYER_NIRNROOTS = "nirnroots";
const OVERLAY_LAYER_WAYSHRINES = "wayshrines";
const OVERLAY_LAYER_CITYNIRNS = "citynirns";
const OVERLAY_LAYER_NEARBYGATES = "nearbygates";

/*********************************
 * OVERLAY FUNCTIONS
 *  this is the icons n stuff on the map canvas.
 *********************************/
function Overlay(){
    this.layers = new Map();
    this.lastZoomLevel = undefined;
    this.currentLocation = null;
    this.activeTsp = null;
    
    this.createLocationLayer();
    this.createNirnrootLayer();
    this.createWayshrineLayer();
    this.createCityNirnLayer();
    this.createNearbyGatesLayer();

    this.clearActiveLayers();
    this.setActiveLayer(OVERLAY_LAYER_LOCATIONS, true);
}

Overlay.prototype.createLocationLayer = function(){

    let locTspArr = [];
    let nonGates = [];
    let gates = [];
    runOnTree(jsondata.location, function(loc){
        let newIcon = null;
        if(loc.name.includes("Oblivion Gate")){
            newIcon = new GateLocation(loc);
            gates.push(newIcon);
        }
        else{
            newIcon = new MapLocation(loc);
            nonGates.push(newIcon);
        }
        
        if(loc.tspId != null){
            locTspArr.push(new TSPLocation(loc.x, loc.y, loc.tspId));
        }
    });


    runOnTree(jsondata.locationPrediscovered, function(loc){
        let newIcon = null;
        if(loc.name.includes("Oblivion Gate")){
            newIcon = new GateLocation(loc);
            gates.push(newIcon);
        }
        else{
            newIcon = new MapLocation(loc);
            nonGates.push(newIcon);
        }
        
        if(loc.tspId != null){
            locTspArr.push(new TSPLocation(loc.x, loc.y, loc.tspId));
        }
    });

    let nonGatesLayer = {name: "nonGates", value: new OverlayLayer(nonGates, null)};
    let gatesLayer = {name: "gates", value: new OverlayLayer(gates, null)};

    //visibility will be controlled by OVERLAY_LAYER_LOCATIONS, not these individually
    nonGatesLayer.value.visible = true;
    gatesLayer.value.visible = true;

    this.layers.set(OVERLAY_LAYER_LOCATIONS,new OverlayLayer([], locTspArr, [nonGatesLayer, gatesLayer]));
}

Overlay.prototype.createNirnrootLayer = function(){
    let nirnTspArr = [];
    let nirnrootArr = [];
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
    this.layers.set(OVERLAY_LAYER_NIRNROOTS,new OverlayLayer(nirnrootArr, nirnTspArr));
}

Overlay.prototype.createWayshrineLayer = function(){
    let wayshrineArr = [];
    runOnTree(jsondata.wayshrine, function(loc){
        let newIcon = new MapLocation(loc);
        wayshrineArr.push(newIcon);
    });
    this.layers.set(OVERLAY_LAYER_WAYSHRINES,new OverlayLayer(wayshrineArr));
}

Overlay.prototype.createCityNirnLayer = function(){
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
    this.layers.set(OVERLAY_LAYER_CITYNIRNS,new OverlayLayer(cityNirnArr));
}

Overlay.prototype.createNearbyGatesLayer = function(){
    let nearbyGatesData = [];
    let nearbyGatesLocations = [];
    runOnTree(jsondata.location, function(loc){
        if(loc.nearbyRandomGates != null){
            let nearbyGates = [];
            nearbyGatesLocations.push(loc);
            for(const gateid of loc.nearbyRandomGates){
                let gate = findCell(gateid, "location");
                nearbyGates.push(gate);
                nearbyGatesLocations.push(gate);
            }
            nearbyGatesData.push(new NearbyLine(loc, nearbyGates));
        }
    });

    let nearbyGatesIcons = [];
    for(const loc of nearbyGatesLocations){
        let newIcon = null;
        if(loc.name.includes("Oblivion Gate")){
            newIcon = new GateLocation(loc);
        }
        else{
            newIcon = new MapLocation(loc);
        }
        nearbyGatesIcons.push(newIcon);
    }
    this.layers.set(OVERLAY_LAYER_NEARBYGATES,new NearbyGatesLayer(nearbyGatesIcons, nearbyGatesData));
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

/**
 * enable or disable display and interaction with a layer.
 * @param layer name of layer
 * @param active true if active
 */
Overlay.prototype.setActiveLayer = function(layer, active){
    let targetLayer = this.layers.get(layer);
    if(targetLayer != null){
        targetLayer.visible = active;
    }
}

/**
 * Clear all active layers
 */
Overlay.prototype.clearActiveLayers = function(){
    for(const layer of this.layers.values()){
        layer.visible = false;
    }
}

Overlay.prototype.setActiveTsp = function(layer){
    if(layer == ""){
        if(this.activeTsp != null){
            this.activeTsp.tspVisible = false;
        }
        this.activeTsp = null;
    }
    let targetLayer = this.layers.get(layer);
    if(targetLayer != null){
        if(this.activeTsp != null){
            this.activeTsp.tspVisible = false;
        }
        targetLayer.tspVisible = true;
        this.activeTsp = targetLayer;
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