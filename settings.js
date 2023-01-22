//NOTE: this is the companion page for settings.html. the actual settings object is initialized in progress.js

//updateUIFromSaveData(); //this updates the %complete in topbar
function updateShareUrl(){
	document.getElementById("myShareUrl").value = window.location.href.substring(0,window.location.href.lastIndexOf("/"))+"/share.html?code=" + settings.myShareCode;
}

function init(){
    loadProgressFromCookie();
    userdata.initAutoSettings();
    
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
    document.body.addEventListener('drop', saveReader.parseSave);

    if(settings.remoteShareCode){
        if(!document.getElementById("spectateBanner") && document.getElementById("topbar") != null){
            let spectateBanner = sharing.createSpectateBanner();
            document.getElementById("topbar")?.appendChild(spectateBanner);
        }
    }
}

function copyShareKeyToClipboard(){
    navigator.clipboard.writeText(settings.shareKey);
}

function copySaveDataToLocal(){
    userdata.saveCookie('progress_local',userdata.loadCookie('progress'));
    sharing.stopSpectating();
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
    var copyText = document.getElementById("myShareUrl");
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(copyText.value);
    copyText.setSelectionRange(0, 0); //I thought the selected text looked ugly so I made it deselect it at the end.
    document.getElementById("shareUrlCopy").innerHTML = "✅ Copied Share URL to Clipboard!";
}

function restoreServerPath() {
    document.getElementById("serverUrl").value = "https://ratskip.azurewebsites.net/share"; //we should eventually have this value be declared in only one place. Also in sharing.mjs
}