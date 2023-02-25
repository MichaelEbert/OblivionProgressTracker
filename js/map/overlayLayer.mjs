import { TSP_STYLE_DASHED } from "./tspPath.mjs";
import { TSPPath } from "./tspPath.mjs";
// represents a single overlay layer

import { TSPLocation } from "./tspPath.mjs";

export {OverlayLayer}

/**
 * 
 * @param {MapLocation[]} locationArr 
 * @param {TSPLocation[]} tspElementArr 
 * @param {{k,v}[]} subLayers sub layers and their names
 */
function OverlayLayer(locationArr, tspElementArr = null, subLayers = null){
    this.icons = locationArr;
    this.visible = true;
    this.tspVisible = false;
    this.layers = new Map();
    if(tspElementArr != null){
        this.tsp = new TSPPath(tspElementArr);
    }
    else{
        this.tsp = null;
    }
    if(subLayers != null){
        for(const layer of subLayers){
            this.layers.set(layer.name, layer.value);
        }
    }

}

OverlayLayer.prototype.recalculateBoundingBox = function(){
    for(const locIcon of this.icons){
        locIcon.recalculateBoundingBox();
    }
    if(this.tsp != null){
        this.tsp.recalculate();
    }
    for(const layer of this.layers.values()){
        layer.recalculateBoundingBox();
    }
}

OverlayLayer.prototype.draw = function(ctx, mouseLoc, currentLocation, hlocRef){
    if(this.tspVisible){
        this.tsp.draw(ctx);
    }
    if(this.visible){
        for(const locIcon of this.icons){
            //this call we don't have to include mouseLoc because if mouseLoc is true, we will redraw later.
            locIcon.draw(ctx, null, currentLocation);
            if(hlocRef.value == null && locIcon.contains(mouseLoc)){
                hlocRef.value = locIcon;
            }
        }
        for(const layer of this.layers.values()){
            layer.draw(ctx, mouseLoc, currentLocation, hlocRef);
        }
    }
}

OverlayLayer.prototype.click = function(clickLoc, currentLocationRef){
    if(this.visible){
        for(const icon of this.icons){
            if(icon.contains(clickLoc)){
                if(window.debug){
                    let name = icon.cell.name ?? icon.cell.formId;
                    console.log("selected "+name+" (formId "+icon.cell.formId+")");
                }
                if(currentLocationRef.currentLocation == icon){
                    currentLocationRef.currentLocation = null;
                }
                else{
                    currentLocationRef.currentLocation = icon;
                }
                return true;
            }
        }
        for(const layer of this.layers.values()){
            if(layer.click(clickLoc, currentLocationRef)){
                return true;
            }
        }
    }
    return false;
}

OverlayLayer.prototype.doubleClick = function(clickLoc){
    //overlay coordinates are all in map space, so we convert to that before checking.
    if(this.visible){
        for(const icon of this.icons){
            if(icon.contains(clickLoc)){
                let activated = icon.onClick(clickLoc);
                if(activated){
                    return true;
                }
            }
        }
        for(const layer of this.layers.values()){
            if(this.doubleClick(clickLoc)){
                return true;
            }
        }
    }
    return false;
}