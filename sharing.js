// ==============
// sharing stuff
// ==============

function generateSaveKey(){
	var typedArray = new Int8Array(64);
	typedArray = window.crypto.getRandomValues(typedArray);
	//sigh
	return base64ArrayBuffer(typedArray);
}

function uploadSave(compressedSaveData){
	if(settings.shareKey == null){
		settings.shareKey = generateSaveKey();
		saveCookie("settings",settings);
	}
	
	let payload = {
		saveData: JSON.stringify(compressedSaveData),
		url: null,
		key: settings.shareKey
	};
	
	if(settings.myShareUrl != null){
		payload.url = settings.myShareUrl;
	}
	
	let url = settings.serverUrl;
	var req = new XMLHttpRequest();
    req.open("POST", url, false);
    req.setRequestHeader("Accept","application/json;odata=nometadata");
    req.setRequestHeader("Content-Type","application/json");
    req.send(JSON.stringify(payload));
	
	if(req.status == 200){
		//yay.
		settings.myShareUrl = req.response;
		saveCookie("settings",settings);
	}
	//TODO: if 500 error, try agin later.
}