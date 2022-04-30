export{
    init,
    getNirnroots,
    activateNirnroot
}

import * as map from './map.mjs'
import { jsondata, findOnTree, findCell } from './obliviondata.mjs';
import { saveCookie } from './userdata.mjs';

// ok first, lets just do a dual page of map and images.
var prevNirnroot;
var thisNirnroot;
var nextNirnroot;
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

async function init(){
    document.getElementById("button_tspNirnroot").checked = true;
    document.getElementById("button_Nirnroot").checked = true;
    document.getElementById("farImage").addEventListener('error',fallbackIngameImage);
    document.getElementById("closeImage").addEventListener('error',fallbackIngameImage);

    const mapContainer = document.getElementById("mapContainer");
    mapContainer.style.width = window.settings.iframeWidth;
    mapContainer.addEventListener('mouseup',(event)=>{
        console.log("mup");
        //we need to convert px to vw.
        let widthInPx = /(\d*)px/.exec(event.target.style.width);
        if(widthInPx?.length > 1){
            const newWidthPx = parseInt(widthInPx[1]);
            const documentWidthPx = window.innerWidth;
            let newWidthEm = (newWidthPx/documentWidthPx*100).toFixed(1) +"vw";
            event.target.style.width = newWidthEm;
            if(settings.iframeWidth != newWidthEm){
                settings.iframeWidth = newWidthEm;
                saveCookie("settings",settings);
            }
        }
    });
    
    if(window.debug){
        window.getNirnroots = getNirnroots;
    }    

    await map.initMap();
    map.setZoomLevel(0.8);

    document.getElementById("nextButton").addEventListener('click', (_evt)=>{
        activateNirnroot(nextNirnroot.cell.formId); 
    });
    document.getElementById("prevButton").addEventListener('click', (_evt)=>{
        activateNirnroot(prevNirnroot.cell.formId); 
    });
    if(window.debug){
        console.log("activating first nirnroot");
    }
    let targetNirnroot = 0;
    let windowParams = new URLSearchParams(window.location.search);
    if(windowParams.get("tspId") != null){
        targetNirnroot = parseInt(windowParams.get("tspId"));
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
        thisNirnroot = thisNirnroot = map.getOverlay().nirnroots.find(x=>x.cell.formId == nirnFormId);
        prevNirnroot = findPrevNirnroot(thisNirnroot);
        nextNirnroot = findNextNirnroot(thisNirnroot);
    }
    
    if(window.debug){
        console.log("thisNirnroot is now "+thisNirnroot.cell.formId+" with tspid "+thisNirnroot.cell.tspId);
    }
    if(window.debug){
        console.log("nextNirnroot is now "+nextNirnroot.cell.formId+" with tspid "+nextNirnroot.cell.tspId);
    }

    const nameElement = document.getElementById("nirnName");
    nameElement.innerText = "Nirnroot "+thisNirnroot.cell.tspId+" “"+(thisNirnroot.cell.name??thisNirnroot.cell.formId)+"”";
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
    
    map.zoomToFormId(nirnFormId);
    map.draw();
}

function findNextNirnroot(thisNirnroot){
    let thisTspId = parseInt(thisNirnroot.cell.tspId);
    let nextNirnrootCell = findOnTree(jsondata.nirnroot, (x=>x.tspId == thisTspId+1));
    if(nextNirnrootCell == null){
        nextNirnrootCell = findOnTree(jsondata.nirnroot, (x=>x.tspId == 0));
    }
    let nextOne = map.getOverlay().nirnroots.find(x=>x.cell.formId == nextNirnrootCell.formId);
    return nextOne;
}

function findPrevNirnroot(thisNirnroot){
    let thisTspId = parseInt(thisNirnroot.cell.tspId);
    let nextNirnrootCell = findOnTree(jsondata.nirnroot, (x=>x.tspId == thisTspId-1));
    if(nextNirnrootCell == null){
        nextNirnrootCell = findOnTree(jsondata.nirnroot, (x=>x.tspId == 0));
    }
    let prevOne = map.getOverlay().nirnroots.find(x=>x.cell.formId == nextNirnrootCell.formId);
    return prevOne;
}

function getFastTravelInstructions(thisNirnroot){
    if(thisNirnroot.cell.fastTravelId == null){
        return "";
    }
    else{
        const nearestPlace = findCell(thisNirnroot.cell.fastTravelId, "location");
        const direction = getFastTravelDirection(thisNirnroot, nearestPlace);
        return `Fast travel to ${nearestPlace.name} and head ${direction}`;
    }
}

function getFastTravelDirection(thisNirnroot, nearestPlace){
    const travelX = thisNirnroot.cell.x - nearestPlace.x;
    const travelY = thisNirnroot.cell.y - nearestPlace.y;

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