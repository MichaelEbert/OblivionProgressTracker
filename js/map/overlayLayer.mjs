import { TSP_STYLE_DASHED } from "./tspPath.mjs";
import { TSPPath } from "./tspPath.mjs";
// represents a single overlay layer

import { TSPLocation } from "./tspPath.mjs";

export {OverlayLayer}

/**
 * 
 * @param {MapLocation[]} locationArr 
 * @param {TSPLocation[]} tspElementArr 
 */
function OverlayLayer(locationArr, tspElementArr = null){
    this.icons = locationArr;
    this.visible = true;
    this.tspVisible = false;
    if(tspElementArr != null){
        this.tsp = new TSPPath(tspElementArr);
    }
    else{
        this.tsp = null;
    }

}

OverlayLayer.prototype.recalculateBoundingBox = function(){
    for(const locIcon of this.icons){
        locIcon.recalculateBoundingBox();
    }
    if(this.tsp != null){
        this.tsp.recalculate();
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
    }
}

OverlayLayer.prototype.click = function(clickLoc, currentLocationRef){
    if(this.visible){
        for(const icon of this.icons){
            if(icon.contains(clickLoc)){
                if(window.debug){
                    let name = icon.cell.name ?? icon.cell.formId;
                    console.log("selected "+name);
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
    }
    return false;
}