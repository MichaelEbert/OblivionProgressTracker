import {OverlayLayer} from "./overlayLayer.mjs";
import { Point } from "./point.mjs";
import {worldSpaceToScreenSpace} from "../map.mjs"
export {NearbyGatesLayer, NearbyLine};

function NearbyGatesLayer(locations, nearbyLines){
    OverlayLayer.call(this, locations);
    this.lines = nearbyLines;
}

NearbyGatesLayer.prototype = Object.create(OverlayLayer.prototype);

NearbyGatesLayer.prototype.draw = function(ctx, mouseLoc, currentLocation, hlocRef){
    if(!this.visible){
        return;
    }
    for(const line of this.lines){
        line.draw(ctx, mouseLoc, currentLocation, hlocRef);
    }
    OverlayLayer.prototype.draw.call(this, ctx, mouseLoc, currentLocation, hlocRef);
}


function NearbyLine(travelLoc, gates){
    this.start = new Point(travelLoc);
    this.ends = [];
    for(const gate of gates){
        this.ends.push(new Point(gate));
    }
}

NearbyLine.prototype.draw = function(ctx, mouseLoc, currentLocation, hlocRef){
    let startpt = worldSpaceToScreenSpace(this.start);
    for(const end of this.ends){
        let endpt = worldSpaceToScreenSpace(end);

        ctx.beginPath();
        ctx.lineWidth = 5; 
        ctx.setLineDash([]);
        ctx.strokeStyle="#FF0000";
        ctx.moveTo(startpt.x, startpt.y);
        ctx.lineTo(endpt.x, endpt.y);
        ctx.stroke();
    }
}