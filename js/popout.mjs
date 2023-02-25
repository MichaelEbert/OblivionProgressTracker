export{
    setPopoutShareCode,
    initBrowserSource,
    initPopoutSettings,
    copyBrowserSourceToClipboard,
    init
}

import {recalculateProgress} from './progressCalculation.mjs'
import * as obliviondata from './obliviondata.mjs'
import * as userdata from './userdata.mjs'

//Automatically sets the share code setting to be the user's current code by default.
function setPopoutShareCode(){
    var shareUrl = document.getElementById("myShareUrl").value;
    var shareCode = "";
    if(shareUrl != null){
        shareCode = shareUrl.split('?code=').pop();
        document.getElementById("popoutShareCode").value = shareCode;
    }
}

//Runs in the settings.html page when the user clicks the "Generate Browser Source Tracker" button. Generates a popout window and passes params.
function initBrowserSource(){
    //default settings
    var width = 460;
    var height = 330;
    var columns = 2;
    var shareCode = "";
    var finalUrl = "";

    //Override settings with user preferences if applicable
    width = document.getElementById("browserSourceWidth").value ?? 0;
    height = document.getElementById("browserSourceHeight").value ?? 0;
    columns = document.getElementById("browserSourceColumns").value ?? 0;
    shareCode = document.getElementById("popoutShareCode").value ?? 0;
    
    if(shareCode == null || shareCode == "" || shareCode.length < 6){
        finalUrl = "Please enter a valid share code."
    }
    else{
        //generate the popout window url based on settings.
        var windowParamsURL = 'popout.html?code=' + shareCode + '&width=' + width + 'px&height=' + height + 'px&columns=' + columns;
        finalUrl = window.location.href.substring(0,window.location.href.lastIndexOf("/"))+"/"+windowParamsURL;
    }
    document.getElementById("browserSourceUrl").value = finalUrl;
}

//Runs in the popout.html page. Takes the window parameters generated in the previous function and modifies html elements to fit these parameters.
function initPopoutSettings(){
    //get window parameters from url.
    const windowParams = window.location.search;
    const urlParams = new URLSearchParams(windowParams);

    //update popout html elements based on settings.
    //window.getElementById(popoutContainer).style.width = urlParams.get('width');
    //window.getElementById(popoutContainer).style.height = urlParams.get('height');
}

//The copy to clipboard function for the popout tracker.
function copyBrowserSourceToClipboard(){
    navigator.clipboard.writeText(document.getElementById("browserSourceUrl").value);
    document.getElementById("browserSourceCopyConfirm").innerHTML = "✅ Copied Browser Source URL to Clipboard!";
}

function init(){
    document.addEventListener("progressLoad",recalculateProgressAndUpdateProgressUI);
	obliviondata.loadJsonData().then(()=>{
        userdata.loadSettingsFromCookie();
        userdata.loadProgressFromCookie();
    });
}

/**
 * Recalculate the total progress, and update UI elements.
 */
function recalculateProgressAndUpdateProgressUI(){
	let percentCompleteSoFar = recalculateProgress();
	
	//round progress to 2 decimal places
	let progress = Math.round((percentCompleteSoFar * 100)*100)/100;
	Array.of(...document.getElementsByClassName("totalProgressPercent")).forEach(element => {
		element.innerText = progress.toString();
		if(element.parentElement.className == "topbarSection" || element.parentElement.className == "popoutTopBarSection"){
			element.parentElement.style = `background: linear-gradient(to right, green ${progress.toString()}%, crimson ${progress.toString()}%);`;
		}
	});
}