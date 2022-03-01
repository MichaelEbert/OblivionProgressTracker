"use strict"
export {TSPLocation, TSPPath}

import { Point } from './point.mjs'
import { worldSpaceToMapSpace, mapSpaceToScreenSpace } from '../map.mjs'


function TSPLocation(worldX,worldY,tspId){
    this.worldX = worldX;
    this.worldY = worldY;
    this.id = tspId;
    this.recalculate();
}

TSPLocation.prototype.recalculate = function(){
    let p = worldSpaceToMapSpace(new Point(this.worldX, this.worldY));
    this.x = p.x;
    this.y = p.y;
}

/**
 * Create a TSP path for drawing
 * @param {TSPLocation[]} location_array 
 */
function TSPPath(location_array){
    this.locations = [...location_array];
    this.locations.sort((a,b)=>{if(a.id > b.id){return 1;}if(a.id < b.id){return -1};return 0});
    this.recalculate();
}

/**
 * Append a point to this TSP path
 * @param {TSPLocation} tspLocation 
 */
TSPPath.prototype.push = function(tspLocation){
    this.locations.push(locations);
}

TSPPath.prototype.recalculate = function(){
    for(const loc of this.locations){
        if(!(loc instanceof TSPLocation)){
            debugger;
        }
        loc.recalculate();
    }
}

/**draws the Traveling salesman path*/
TSPPath.prototype.draw = function(ctx){
    ctx.lineCap = "round";
    //draw from prev point to current point
    for(let i = 1; i < this.locations.length; i++){
        let point = mapSpaceToScreenSpace(new Point(this.locations[i]));
        let prevPoint = mapSpaceToScreenSpace(new Point(this.locations[i-1]));
        
        //TODO: add in custom color/line width selection.
        //TODO: add in secondary line outline to make line "pop" on map better.
        ctx.beginPath();
        ctx.strokeStyle="#FF0000";
        ctx.lineWidth = 5; 
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(prevPoint.x, prevPoint.y);
        ctx.stroke();
    }

    //draws the last connection from the last point to the first point.
    let a = mapSpaceToScreenSpace(new Point(this.locations[0]));
    let z = mapSpaceToScreenSpace(new Point(this.locations[this.locations.length - 1]));
    
    ctx.beginPath();
    ctx.strokeStyle="#FF0000";
    ctx.lineWidth = 5;
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(z.x, z.y);
    ctx.stroke();
}