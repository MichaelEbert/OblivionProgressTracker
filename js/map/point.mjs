"use strict";
export {Point};

/**
 * 2d point. Jas useful math methods like multiply, divide, etc.
 * @param x x of point 
 * @param y y of point
 */
function Point(x,y){
    //allow passing in single object instead of x,y coords
    if(typeof(x) == "object" && y === undefined){//triple equals because we don't want (null, null) to trigger this
        this.x = x.x;
        this.y = x.y;
    }
    else{
        this.x = x;
        this.y = y;
    }
}


Point.prototype.toString = function(){
    return "("+this.x+","+this.y+")";
}
/**
 * Return a point that is the result of adding a scalar or point to this point.
 * @param {*} object scalar or point to add
 * @returns {Point} new point
 */
Point.prototype.add = function(object){
    if(typeof(object) == "number"){
        let asNum = parseFloat(object);
        return new Point(this.x + asNum, this.y + asNum);
    }
    else{
        //should this typecheck for point? IDK i'm not used to js development
        return new Point(this.x + object.x, this.y + object.y);
    }
}
/**
 * Return a point that is the result of subtracting a scalar or point from this point.
 * @param {*} object scalar or point to subtract
 * @returns {Point} new point
 */
Point.prototype.subtract = function(object){
    if(typeof(object) == "number"){
        let asNum = parseFloat(object);
        return new Point(this.x - asNum, this.y - asNum);
    }
    else{
        //should this typecheck for point? IDK i'm not used to js development
        return new Point(this.x - object.x, this.y - object.y);
    }
}
/**
 * Multiply this point by a scalar.
 * @param {number} number number to multiply by
 * @returns {Point} new point
 */
Point.prototype.multiply = function(number){
    let asNum = parseFloat(number);
    return new Point(this.x * asNum, this.y * asNum);
}
/**
 * divide this point by a scalar.
 * @param {number} number number to multiply by
 * @returns {Point} new point
 */
Point.prototype.divide = function(number){
    let asNum = parseFloat(number);
    return new Point(this.x / asNum, this.y / asNum);
}