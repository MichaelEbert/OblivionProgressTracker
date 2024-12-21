//NOTE: this is the companion page for settings.html. the actual settings object is initialized in userdata.mjs
export{
    updateShareUrl,
    init,
    copyShareKeyToClipboard,
    copySaveDataToLocal,
    exportProgress,
    importProgress,
    copytoClipboard,
    restoreServerPath
}

import { loadProgressFromCookie, saveProgressToCookie, initAutoSettings, loadSettingsFromCookie, saveCookie, loadCookie } from './userdata.mjs'
import {loadJsonData} from './obliviondata.mjs'
import {updateProgressBar} from './progressCalculation.mjs'
import { parseSave } from './saveReader.mjs'
import { initSharingFeature, stopSpectating, setRemoteUrl, createSpectateBanner } from './sharing.mjs'
import { setPopoutShareCode } from './popout.mjs'

//updateUIFromSaveData(); //this updates the %complete in topbar
function updateShareUrl(){
	document.getElementById("myShareUrl").value = window.location.href.substring(0,window.location.href.lastIndexOf("/"))+"/share.html?code=" + settings.myShareCode;
    setPopoutShareCode();
}

function init(){
    if(!window.location.toString().endsWith("settings.html")){
        console.error("settings.html init() called fron non-settings page! things may break.");
    }
    loadJsonData(".").then(()=>{
        console.assert(jsondata != null);
        loadProgressFromCookie();
        console.log("progress loaded!");
    });
    loadSettingsFromCookie();
    
    initAutoSettings();
    initSharingFeature();
    
    //custom settings
    document.getElementById("fileinput").addEventListener('change',importProgress);
    document.getElementById("remoteShareCode").addEventListener('change',setRemoteUrl);
    document.getElementById("clearRemoteButton").addEventListener('click',function(){
        let sharecode = document.getElementById("remoteShareCode"); 
        sharecode.value = ""; 
        setRemoteUrl({target:sharecode});
        document.getElementById("copyDataLocalButton").disabled = true;
        });
    document.addEventListener("progressShared",updateShareUrl);

    if(settings.myShareCode){
        updateShareUrl();
    }

    if(settings.remoteShareCode){
        document.getElementById("remoteShareCode").value = settings.remoteShareCode;
    }
    document.getElementById("copyShareKeyButton")?.addEventListener('click',copyShareKeyToClipboard);

    document.getElementById("copyDataLocalButton").addEventListener('click',copySaveDataToLocal);
    if(settings.remoteShareCode){
        document.getElementById("copyDataLocalButton").disabled = false;
    }

    const ignoreEvent = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    // Handle drag+drop of files. Have to ignore dragenter/dragover for compatibility reasons.
    document.body.addEventListener('dragenter', ignoreEvent);
    document.body.addEventListener('dragover', ignoreEvent);
    document.body.addEventListener('drop', parseSave);

    document.addEventListener("progressLoad",updateProgressBar);
}

function copyShareKeyToClipboard(){
    navigator.clipboard.writeText(settings.shareKey);
}

function copySaveDataToLocal(){
    saveCookie('progress_local',loadCookie('progress'));
    stopSpectating();
    document.getElementById("copyDataLocalButton").disabled = true;
    location.reload();
}

function exportProgress(){
	//from stackoverflow
	const progressString = new Blob([JSON.stringify(savedata)], {type:"text/plain"});
	const element = document.createElement('a');
	element.href = window.URL.createObjectURL(progressString);
	element.download = "oblivionProgressTracker.save"
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
	window.URL.revokeObjectURL(progressString);
}

function importProgress(eventargs){
	var filedata = document.getElementById("fileinput").files[0].text();
	filedata.then(x => {
		savedata = JSON.parse(x);
		saveProgressToCookie();
		alert("progress imported");
	});
}

function copytoClipboard() {
    navigator.clipboard.writeText(document.getElementById("myShareUrl").value);
    document.getElementById("shareUrlCopy").innerHTML = "✅ Copied Share URL to Clipboard!";
}

function restoreServerPath() {
    document.getElementById("serverUrl").value = "https://ratskip.azurewebsites.net/share"; //we should eventually have this value be declared in only one place. Also in sharing.mjs
}