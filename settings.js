//NOTE: this is the companion page for settings.html. the actual settings object is initialized in progress.js

//updateUIFromSaveData(); //this updates the %complete in topbar
function updateShareUrl(){
	document.getElementById("myShareUrl").value = window.location.href.substring(0,window.location.href.lastIndexOf("/"))+"/share.html?code=" + settings.myShareCode;
}

/**
 * all checkboxes with class "autosetting" will automatically have a setting created for them.
 * all input with class "autoTextSetting" will automatically have a setting created for them.
 */
function initAutoSettings(){
    let autoSettings = document.getElementsByClassName("autosetting");
    for(const setting of autoSettings){
        setting.addEventListener('change', onSettingChange);
        const settingName = setting.id;
        if(settings[settingName] != null){
            setting.checked = settings[settingName];
        }
        if(window.debug){
            console.log("Auto boolean setting "+settingName+" with value "+settings[settingName]);
        }
    }
    let autoTextSettings = document.getElementsByClassName("autoTextSetting");
    for(const setting of autoTextSettings){
        setting.addEventListener('change', onSettingChangeText);
        const settingName = setting.id;
        if(settings[settingName] != null){
            setting.value = settings[settingName];
        }
        if(window.debug){
            console.log("Auto text setting "+settingName+" with value "+settings[settingName]);
        }
    }
}

function init(){
    loadProgressFromCookie();
    
    initAutoSettings();
    
    //custom settings
    document.getElementById("fileinput").addEventListener('change',importProgress);
    document.getElementById("remoteShareCode").addEventListener('change',setRemoteUrl);
    document.getElementById("clearRemoteButton").addEventListener('click',function(){
        let sharecode = document.getElementById("remoteShareCode"); 
        sharecode.value = ""; 
        setRemoteUrl({target:sharecode});
        });
    document.addEventListener("progressShared",updateShareUrl);

    if(settings.myShareCode){
        updateShareUrl();
    }

    if(settings.remoteShareCode){
        document.getElementById("remoteShareCode").value = settings.remoteShareCode;
    }
    document.getElementById("copyShareKeyButton")?.addEventListener('click',copyShareKeyToClipboard);
}

function copyShareKeyToClipboard(){
    navigator.clipboard.writeText(settings.shareKey);
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
		saveProgressToCookie();
		alert("progress imported");
	});
}