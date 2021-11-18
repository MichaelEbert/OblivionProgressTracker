//NOTE: this is the companion page for settings.html. the actual settings object is initialized in progress.js

//updateUIFromSaveData(); //this updates the %complete in topbar
function updateShareUrl(){
	document.getElementById("myShareUrl").value = window.location.href.substring(0,window.location.href.lastIndexOf("/"))+"/share.html?code=" + settings.myShareCode;
}

function init(){
    loadProgressFromCookie();
    document.getElementById("fileinput").addEventListener('change',importProgress);
    document.getElementById("minipageCheck").addEventListener('change',onSettingChange);
    document.getElementById("autoUploadCheck").addEventListener('change',onSettingChange);
    document.getElementById("iframeCheck").addEventListener('change',onSettingChangeText);
    document.getElementById("serverUrl").addEventListener('change',onSettingChangeText);
    document.getElementById("remoteShareCode").addEventListener('change',setRemoteUrl);
    document.getElementById("clearRemoteButton").addEventListener('click',function(){
        let sharecode = document.getElementById("remoteShareCode"); 
        sharecode.value = ""; 
        setRemoteUrl({target:sharecode});
        });
    document.addEventListener("progressUpload",updateShareUrl);

    if(settings.minipageCheck){
        document.getElementById("minipageCheck").checked = true;
    }
    else{
        document.getElementById("minipageCheck").checked = false;
    }

    if(settings.iframeCheck){
        document.getElementById("iframeCheck").value = settings.iframeCheck;
    }

    if(settings.serverUrl){
        document.getElementById("serverUrl").value = settings.serverUrl;
    }

    if(settings.myShareCode){
        updateShareUrl();
    }

    if(settings.remoteShareCode){
        document.getElementById("remoteShareCode").value = settings.remoteShareCode;
    }
}


/**
 * on boolean settings change 
 */
function onSettingChange(event){
	var settingsVal = event.target.id;
	settings[settingsVal] = event.target.checked;
	saveCookie("settings",settings);	
}

function onSettingChangeText(event){
	var settingsVal = event.target.id;
	settings[settingsVal] = event.target.value;
	saveCookie("settings",settings);
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
		saveProgress();
		alert("progress imported");
	});
}