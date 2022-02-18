"use strict"

export { Overlay, OVERLAY_LAYER_LOCATIONS, OVERLAY_LAYER_NIRNROOTS };

import { MapLocation, GateIcon } from "./mapObject.mjs";
import { Point } from "./point.mjs";
import { getZoomLevel, screenSpaceToMapSpace } from "../map.mjs"
import { TSPLocation } from "./tspPath.mjs";
import { TSPPath } from "./tspPath.mjs";

const OVERLAY_LAYER_LOCATIONS = 0x1;
const OVERLAY_LAYER_NIRNROOTS = 0x2;

/*********************************
 * OVERLAY FUNCTIONS
 *  this is the icons n stuff on the map canvas.
 *********************************/
function Overlay(){
    this.locations = [];
    this.tsp_locations = [];
    this.nirnroots = [];
    this.tsp_nirnroots = [];
    this.lastZoomLevel = undefined;
    this.currentLocation = null;
    this.setActiveLayer(OVERLAY_LAYER_LOCATIONS);

    //the following funcitons need a captured this variable
    let ovr = this;
    let locTspArr = [];
    let nirnTspArr = [];
    runOnTree(jsondata.location, function(loc){
        let newIcon = null;
        if(loc.name.includes("Oblivion Gate")){
            newIcon = new GateIcon(loc);
        }
        else{
            newIcon = new MapLocation(loc);
        }
        ovr.locations.push(newIcon);
        
        if(loc.tspID != null){
            locTspArr.push(new TSPLocation(loc.x, loc.y, loc.tspID));
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
        ovr.locations.push(newIcon);
        
        if(loc.tspID != null){
            locTspArr.push(new TSPLocation(loc.x, loc.y, loc.tspID));
        }
    });

    runOnTree(jsondata.nirnroot, function(nirn){
        if(nirn.cell == "Outdoors"){
            let newIcon = new MapLocation(nirn)
            ovr.nirnroots.push(newIcon);

            if(nirn.tspID != null){
                nirnTspArr.push(new TSPLocation(nirn.x, nirn.y, nirn.tspID));
            }
        }
    });

    //Sort and run intial world->map->screen space calculations for TSP arrays.
    this.tsp_locations = new TSPPath(locTspArr);
    this.tsp_nirnroots = new TSPPath(nirnTspArr);
}

var hloc = null;
/**
 * Draw icons on the map
 */
Overlay.prototype.draw = function(ctx, zoomLevel, showTSP, mouseLoc){
    if(zoomLevel != this.lastZoomLevel){
        this.lastZoomLevel = zoomLevel;
        for(const locIcon of this.locations){
            locIcon.recalculateBoundingBox();
        }
        for(const icon of this.nirnroots){
            icon.recalculateBoundingBox();
        }
        if(this.poi != null){
            this.poi.recalculateBoundingBox();
        }
        this.tsp_locations.recalculate();
        this.tsp_nirnroots.recalculate();
    }

    if(!hloc?.contains(mouseLoc)){
        hloc = null;
    }
    if(this.showLocations){
        if(showTSP && !this.showNirnroots){
            //only draw this if we're not drawing nirnroot TSP.
            //because 2 TSP at the same time is ususable.
            this.tsp_locations.draw(ctx);
        }
        
        for(const locIcon of this.locations){
            //this call we don't have to include mouseLoc because if mouseLoc is true, we will redraw later.
            locIcon.draw(ctx, mouseLoc, this.currentLocation);
            if(hloc == null && locIcon.contains(mouseLoc)){
                hloc = locIcon;
            }
        }
    }
    if(this.showNirnroots){
        if(showTSP){
            this.tsp_nirnroots.draw(ctx);
        }

        for(const nirnIcon of this.nirnroots){
            nirnIcon.draw(ctx, mouseLoc, this.currentLocation);
            if(hloc == null && nirnIcon.contains(mouseLoc)){
                hloc = nirnIcon;
            }
        }
    }

    if(this.poi != null){
        this.poi.draw(ctx);
    }

    if(this.currentLocation != null){
        this.currentLocation.draw(ctx, null, this.currentLocation);
    }

    //last icon in array was just drawn, so redraw hovered icon so it appears on top of everything else.
    if(hloc != null){
        hloc.draw(ctx, mouseLoc, this.currentLocation);
    }
}

Overlay.prototype.click = function(clickLoc){
    const clickLocInMapSpace = screenSpaceToMapSpace(clickLoc);
    if(this.showLocations){
        for(const icon of this.locations){
            if(icon.contains(clickLoc)){
                if(window.debug){
                    let name = icon.cell.name ?? icon.cell.formId;
                    console.log("selected "+name);
                }
                if(this.currentLocation == icon){
                    this.currentLocation = null;
                }
                else{
                    this.currentLocation = icon;
                }
                return true;
            }
        }
    }
    if(this.showNirnroots){
        for(const icon of this.nirnroots){
            if(icon.contains(clickLoc)){
                if(window.debug){
                    let name = icon.cell.name ?? icon.cell.formId;
                    console.log("selected "+name);
                }
                if(this.currentLocation == icon){
                    this.currentLocation = null;
                }
                else{
                    this.currentLocation = icon;
                }
                return true;
            }
        }
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
    if(this.showLocations){
        for(const icon of this.locations){
            if(icon.contains(clickLoc)){
                let activated = icon.onClick(clickLoc);
                if(activated){
                    return true;
                }
            }
        }
    }
    if(this.showNirnroots){
        for(const icon of this.nirnroots){
            if(icon.contains(clickLoc)){
                let activated = icon.onClick(clickLoc);
                if(activated){
                    return true;
                }
            }
        }
    }
    return false;
}

Overlay.prototype.setActiveLayer = function(layer){
    if(layer == OVERLAY_LAYER_LOCATIONS){
        this.showNirnroots = false;
        this.showLocations = true;
    }
    else if(layer == OVERLAY_LAYER_NIRNROOTS){
        this.showNirnroots = true;
        if(window.settings.mapShowLocationsOnNirnroot){
            this.showLocations = true;
        }
        else{
            this.showLocations = false;
        }
    }
    else{
        this.showNirnroots = false;
        this.showLocations = false;
        if(window.debug){
            console.log("set active layer to none.... why did you do that?");
        }
    }
}