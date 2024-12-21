export{
    init,
    getNirnroots,
    activateNirnroot
}

import * as map from './map.mjs'
import { jsondata, findOnTree, findCell } from './obliviondata.mjs';
import { updateChecklistProgress, recalculateProgress } from './progressCalculation.mjs';
import { saveCookie } from './userdata.mjs';

var prevNirnroot;
var thisNirnroot;
var nextNirnroot;
var thisNirnrootChecked;

/**
 * Debugging function to get prev, this and next nirnroot.
 */
function getNirnroots(){
    return [prevNirnroot,thisNirnroot,nextNirnroot];
}

var loadImageTries = 0;
function fallbackIngameImage(eventArgs){
	if(loadImageTries < 3){
		eventArgs.target.src = "./data/minipages/in-game-placeholder.png";	
		loadImageTries += 1;
	}
}
function initEventListeners(){
    //The 'popstate' is so when user clicks "back" to go to prev nirn, it reloads the page correctly
    window.addEventListener('popstate', ()=>{
        let windowParams = new URLSearchParams(window.location.search);
        let maybeWindowParams = ["tspId","tsp","tspid"];
        let targetNirnroot = 0;
        for(const maybeParam of maybeWindowParams)
        {
            if(windowParams.get(maybeParam) != null ){
                targetNirnroot = parseInt(windowParams.get(maybeParam));
                break;
            }
        }
        
        let firstNirn = findOnTree(jsondata.nirnroot, (x=>x.tspId == targetNirnroot));
        activateNirnroot(firstNirn.formId);
    });

    const nextButton = document.getElementById("nextButton");
    const prevButton = document.getElementById("prevButton");
    nextButton.addEventListener('click', (_evt)=>{
        updateChecklistProgress(null, true, null, thisNirnroot.cell);
        recalculateProgress();
        activateNirnroot(nextNirnroot.cell.formId); 
    });
    prevButton.addEventListener('click', (_evt)=>{
        updateChecklistProgress(null, false, null, prevNirnroot.cell);
        recalculateProgress();
        activateNirnroot(prevNirnroot.cell.formId); 
    });

    
	document.addEventListener("progressLoad",()=>{
        // if after a progressLoad, the current nirn has
        // been checked, advance to next unchecked nirn.
        let newCheckedValue = savedata["nirnroot"][thisNirnroot.cell.id];
        if(thisNirnrootChecked === false && newCheckedValue)
        {
            while(savedata["nirnroot"][thisNirnroot.cell.id] == true &&
                nextNirnroot.cell.tspId != 0)
            {
                activateNirnroot(nextNirnroot.cell.formId);
            }
            newCheckedValue = savedata["nirnroot"][thisNirnroot.cell.id];
        }
    });

    document.body.addEventListener('keyup', (evt)=>{
        if(evt.code === "ArrowRight"){
            nextButton.click();
        }
        else if(evt.code === "ArrowLeft"){ 
            prevButton.click();
        }
    });
    document.getElementById("nirnIdField").addEventListener('change', (_evt)=>{
        let targetNirnroot = parseInt(_evt.target.value);
        if(targetNirnroot != null){
            let firstNirn = findOnTree(jsondata.nirnroot, (x=>x.tspId == targetNirnroot));
            activateNirnroot(firstNirn.formId);
        }
    });

    document.getElementById("farImage").addEventListener('error',fallbackIngameImage);
    document.getElementById("closeImage").addEventListener('error',fallbackIngameImage);
}


async function init(){
    initEventListeners();
    
    if(window.debug){
        window.getNirnroots = getNirnroots;
    }    

    //set "display nirns" and "display nirn TSP" on
    document.getElementById("button_tspNirnroot").checked = true;
    document.getElementById("button_Nirnroot").checked = true;
    await map.initMap();
    map.setZoomLevel(0.8);

    if(window.debug){
        console.log("activating first nirnroot");
    }

    let targetNirnroot = 0;
    let windowParams = new URLSearchParams(window.location.search);
    let maybeWindowParams = ["tspId","tsp","tspid"];
    for(const maybeParam of maybeWindowParams)
    {
        if(windowParams.get(maybeParam) != null ){
            targetNirnroot = parseInt(windowParams.get(maybeParam));
            break;
        }
    }
    
    let firstNirn = findOnTree(jsondata.nirnroot, (x=>x.tspId == targetNirnroot));
    activateNirnroot(firstNirn.formId);
}

function activateNirnroot(nirnFormId){
    loadImageTries = 0;
    const farUrl = "./data/minipages/nirnroot/"+nirnFormId+"_a.webp";
    const closeUrl = "./data/minipages/nirnroot/"+nirnFormId+"_b.webp";
    document.getElementById("farImage").src=farUrl;
    document.getElementById("farImageHyperlink").href = farUrl;
    document.getElementById("closeImage").src=closeUrl;
    document.getElementById("closeImageHyperlink").href=closeUrl;
    if(nirnFormId == thisNirnroot?.cell?.formId){
        // bug case for trying to go backwards past 0. don't feel like fixing that so
        // we just do nothing in this case.
    }
    else if(nirnFormId == nextNirnroot?.cell?.formId){
        // we're going to next, so only need to get the final one.
        prevNirnroot = thisNirnroot;
        thisNirnroot = nextNirnroot;
        nextNirnroot = findNextNirnroot(thisNirnroot);
        
    }
    else if(nirnFormId == prevNirnroot?.cell?.formId){
        nextNirnroot = thisNirnroot;
        thisNirnroot = prevNirnroot;
        prevNirnroot = findPrevNirnroot(thisNirnroot);
    }
    else{
        thisNirnroot = thisNirnroot = map.getOverlay().layers.get("nirnroots").icons.find(x=>x.cell.formId == nirnFormId);
        prevNirnroot = findPrevNirnroot(thisNirnroot);
        nextNirnroot = findNextNirnroot(thisNirnroot);
    }
    const thisTspId = thisNirnroot.cell.tspId;
    
    if(window.debug){
        console.log("thisNirnroot is now "+thisNirnroot.cell.formId+" with tspid "+thisTspId);
        console.log("nextNirnroot is now "+nextNirnroot.cell.formId+" with tspid "+nextNirnroot.cell.tspId);
    }
    const newUrl = window.location.toString().split("?")[0] + "?tspId="+thisTspId;
    window.history.pushState(null, "", newUrl);
    document.title = "Nirnroute — Nirnroot #"+thisTspId;

    document.getElementById("nirnIdField").value = thisTspId;

    const nameElement = document.getElementById("nirnName");
    nameElement.innerText = "Nirnroot "+thisTspId+" “"+(thisNirnroot.cell.name??thisNirnroot.cell.formId)+"”";
    if(thisNirnroot.cell.trivia != null){
        nameElement.title = thisNirnroot.cell.trivia
    }
    else{
        nameElement.title = "";
    }
    const instructionsElement = document.getElementById("instructions");
    if(thisNirnroot.cell.notes != null){
        instructionsElement.innerText = thisNirnroot.cell.notes;
    }
    else{
        instructionsElement.innerText = "";
    }

    const nextToElement = document.getElementById("closeTo");
    nextToElement.innerText = getFastTravelInstructions(thisNirnroot);

    thisNirnrootChecked = savedata["nirnroot"][thisNirnroot.cell.id];    
    
    map.zoomToFormId(nirnFormId);
    map.draw();
}

/**
 * Find the nirnroot before the current one in the TSP path.
 * @param thisNirnroot 
 * @returns {MapObject} The nirnroot before this one in the TSP path.
 */
function findNextNirnroot(thisNirnroot){
    let thisTspId = parseInt(thisNirnroot.cell.tspId);
    let nextNirnrootCell = findOnTree(jsondata.nirnroot, (x=>x.tspId == thisTspId+1));
    if(nextNirnrootCell == null){
        nextNirnrootCell = findOnTree(jsondata.nirnroot, (x=>x.tspId == 0));
    }
    let nextOne = map.getOverlay().layers.get("nirnroots").icons.find(x=>x.cell.formId == nextNirnrootCell.formId);
    return nextOne;
}

/**
 * Find the nirnroot after the current one in the TSP path.
 * @param thisNirnroot 
 * @returns {MapObject} The nirnroot after this one in the TSP path.
 */
function findPrevNirnroot(thisNirnroot){
    let thisTspId = parseInt(thisNirnroot.cell.tspId);
    let nextNirnrootCell = findOnTree(jsondata.nirnroot, (x=>x.tspId == thisTspId-1));
    if(nextNirnrootCell == null){
        nextNirnrootCell = findOnTree(jsondata.nirnroot, (x=>x.tspId == 0));
    }
    let prevOne = map.getOverlay().layers.get("nirnroots").icons.find(x=>x.cell.formId == nextNirnrootCell.formId);
    return prevOne;
}

/**
 * Obtain text directions that can be used to fast travel to the target nirnroot.
 *  If it is faster to travel from the previous nirnroot (aka no nearest fast travel location specified),
 * then returns an empty string.
 * @param thisNirnroot 
 * @returns {string} Directions in text format
 */
function getFastTravelInstructions(thisNirnroot){
    console.log(thisNirnroot.cell.fastTravelId);
    if(thisNirnroot.cell.fastTravelId == null || thisNirnroot.cell.fastTravelId == "0x000AD373"){//THIS PREVENTS CONFUSING AUTO SWAMP INSTRUCTION
        return "";
    }
    else{
        const nearestPlace = findCell(thisNirnroot.cell.fastTravelId);
        var direction;
        if(nearestPlace == undefined){
            direction = "undefined";
        }
        else{
            direction = getFastTravelDirection(nearestPlace, thisNirnroot.cell);
        }
        return `Fast travel to ${nearestPlace?.name} and head ${direction}`;
    }
}

/**
 * @param sourcePlace source location to travel from
 * @param targetPlace target location to travel to
 * @returns {String} Which of the 8 cardinal or ordinal directions to travel from the sourcePlace to reach the targetPlace.
 */
function getFastTravelDirection(sourcePlace, targetPlace){
    const travelX = targetPlace.x - sourcePlace.x;
    const travelY = targetPlace.y - sourcePlace.y;

    const travelAngle = Math.atan2(travelY, travelX);
    const π = Math.PI;
    //2π / 8 segments = each segment is π/4, and divide on π/8.

    if(travelAngle < (-7*π/8)){
        return "West";
    }
    else if(travelAngle < (-5 * π / 8)) {
        return "Southwest";
    }
    else if(travelAngle < (-3 * π / 8)) {
        return "South";
    }
    else if(travelAngle < (-1 * π / 8)) {
        return "Southeast";
    }
    else if(travelAngle < (1 * π / 8)) {
        return "East";
    }
    else if(travelAngle < (3 * π / 8)) {
        return "Northeast";
    }
    else if(travelAngle < (5 * π / 8)) {
        return "North";
    }
    else if(travelAngle < (7 * π / 8)) {
        return "Northwest";
    }
    else{
        return "West";
    }
}