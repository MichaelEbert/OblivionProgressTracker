export{
    init,
    getNirnroots,
    activateNirnroot
}

import * as map from './map.mjs'

function zoomToNirnroute(nirnFormId){

}

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
    document.getElementById("mapContainer").style.width = window.settings.iframeWidth;
    document.getElementById("button_tspNirnroot").checked = true;
    document.getElementById("button_Nirnroot").checked = true;
    document.getElementById("farImage").addEventListener('error',fallbackIngameImage);
    document.getElementById("closeImage").addEventListener('error',fallbackIngameImage);
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
    activateNirnroot(findOnTree(jsondata.nirnroot, (x=>x.tspID == 0)).formId);
}

function activateNirnroot(nirnFormId){
    loadImageTries = 0;
    document.getElementById("farImage").src="./data/minipages/nirnroot/"+nirnFormId+"_a.webp";
    document.getElementById("closeImage").src="./data/minipages/nirnroot/"+nirnFormId+"_b.webp";

    if(nirnFormId == nextNirnroot?.cell?.formId){
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
        console.log("thisNirnroot is now "+thisNirnroot.cell.formId+" with tspid "+thisNirnroot.cell.tspID);
    }
    if(window.debug){
        console.log("nextNirnroot is now "+nextNirnroot.cell.formId+" with tspid "+nextNirnroot.cell.tspID);
    }

    const nameElement = document.getElementById("nirnName");
    nameElement.innerText = "Nirnroot "+thisNirnroot.cell.tspID+" “"+(thisNirnroot.cell.name??thisNirnroot.cell.formId)+"”";
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
    
    map.zoomToFormId(nirnFormId);
    map.draw();
}

function findNextNirnroot(thisNirnroot){
    let thisTspId = parseInt(thisNirnroot.cell.tspID);
    let nextNirnrootCell = findOnTree(jsondata.nirnroot, (x=>x.tspID == thisTspId+1));
    if(nextNirnrootCell == null){
        nextNirnrootCell = findOnTree(jsondata.nirnroot, (x=>x.tspID == 0));
    }
    let nextOne = map.getOverlay().nirnroots.find(x=>x.cell.formId == nextNirnrootCell.formId);
    return nextOne;
}

function findPrevNirnroot(thisNirnroot){
    let thisTspId = parseInt(thisNirnroot.cell.tspID);
    let nextNirnrootCell = findOnTree(jsondata.nirnroot, (x=>x.tspID == thisTspId-1));
    if(nextNirnrootCell == null){
        nextNirnrootCell = findOnTree(jsondata.nirnroot, (x=>x.tspID == 0));
    }
    let prevOne = map.getOverlay().nirnroots.find(x=>x.cell.formId == nextNirnrootCell.formId);
    return prevOne;
}