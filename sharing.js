// ==============
// sharing stuff
// ==============

function generateSaveKey(){
	var typedArray = new Int8Array(64);
	typedArray = window.crypto.getRandomValues(typedArray);
	//sigh
	return base64ArrayBuffer(typedArray);
}

function uploadSave(uploadUrl, saveData, myShareUrl, myShareKey){
	let payload = {
		saveData: JSON.stringify(saveData),
		url: myShareUrl,
		key: myShareKey
	};
	
	var req = new XMLHttpRequest();
    req.open("POST", uploadUrl, false);
    req.setRequestHeader("Accept","application/json;odata=nometadata");
    req.setRequestHeader("Content-Type","application/json");
    req.send(JSON.stringify(payload));
	
	if(req.status == 200){
		//yay.
		return req.response;
	}
	return null;
	//TODO: if 500 error, try agin later.
}

//download save.
function downloadSave(remoteUrl){
	var req = new XMLHttpRequest();
    req.open("GET", remoteUrl, false);
    req.setRequestHeader("Accept","application/json;odata=nometadata");
    req.setRequestHeader("Content-Type","application/json");
    req.send();
	
	if(req.status == 200){
		//yay
		return JSON.parse(req.response);
	}
	return null;	
}

//so we don't want remote save to replace current save.
//so we just set "viewing remote" and disable saving.
function uploadCurrentSave(){
	if(settings.remoteShareUrl){
		//if we're viewing remote, don't upload.
		console.log("viewing remote data, will not upload.");
		return;
	}
	
	let compressedData = compressSaveData(savedata);
	if(settings.shareKey == null){
		settings.shareKey = generateSaveKey();
		saveCookie("settings",settings);
	}
	
	var result = uploadSave(settings.serverUrl, compressedData, settings.myShareUrl, settings.shareKey);
	
	if(result){
		settings.myShareUrl = result;
		saveCookie("settings",settings);
		const myShareUrlField = document.getElementById("myShareUrl");
		myShareUrlField.value = result;
	}
}

function clearRemoteUrl(){
	console.log("clearing remote data");
	settings.remoteShareUrl = null;
	saveCookie("settings",settings);
	
	var localProgress = loadCookie("progress_local");
	if(localProgress?.version > 0){
		saveCookie("progress",localProgress);
	}
	saveCookie("progress_local",{});
	
	loadProgressFromCookie();
}

function setRemoteUrl(event){
	if(event.target.value == ""){
		clearRemoteUrl();
		return;
	}
	if(Object.keys(loadCookie("progress_local")).length == 0){
		//we don't have local progress, so we can assume that current progress is local.
		saveCookie("progress_local",compressSaveData(savedata));
	}
	
	settings.remoteShareUrl = event.target.value;
	saveCookie("settings",settings);
	
	let downloadUrl = settings.serverUrl + "/" + settings.remoteShareUrl; 
	let dl = downloadSave(downloadUrl);
	
	if(dl){
		savedata = decompressSaveData(dl);
		saveCookie("progress",dl);
		alert("Downloaded");
	}
}


