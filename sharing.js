// ==============
// sharing stuff
// ==============

/**
 * checks to make sure that the global settings object has required properties for sharing.
 * if not, set them to sensible defaults.
 */
function initShareSettings(){
	let changed = false;
	if(settings == null){
		console.error("Sharing settings attempted to initalize before settings object exists");
		return;
	}

	if(settings.shareKey == null){
		settings.shareKey = generateSaveKey();
		changed = true;
	}
	else if(settings.shareKey.length != 88){
		console.error("share key '"+settings.shareKey+"' not correct length. Generating new share key.");
		settings.shareKey = generateSaveKey();
		changed = true;
	}

	if(settings.serverUrl == null || settings.serverUrl.length == 0){
		settings.serverUrl = "https://ratskip.azurewebsites.net/share";
		changed = true;
	}

	if(changed){
		saveCookie("settings", settings);
	}
}

/**
 * @returns a new 64-byte, base64-encoded key that can be used for uploading data.
 */
function generateSaveKey(){
	var typedArray = new Int8Array(64);
	typedArray = window.crypto.getRandomValues(typedArray);
	//sigh
	return base64ArrayBuffer(typedArray);
}

/**
 * internal method to upload specified save data. 
 * @param {string} uploadUrl URL endpoint to POST save data to.
 * @param {object} saveData save data object to POST.
 * @param {string} myShareCode share code to upload to.
 * @param {string} myShareKey private 'password' for share code. Must be exactly 64 bytes, base64-encoded.
 * @returns either resolve(response body) or reject(request)
 */
async function uploadSave(uploadUrl, saveData, myShareCode, myShareKey){
	return new Promise((resolve, reject) =>{
		let payload = {
			saveData: JSON.stringify(saveData),
			url: myShareCode,
			key: myShareKey
		};

		var req = new XMLHttpRequest();
		req.open("POST", uploadUrl, true);
		req.setRequestHeader("Accept","application/json;odata=nometadata");
		req.setRequestHeader("Content-Type","application/json");

		req.onload = function () {
			if(this.status == 200){
				//yay.
				resolve(this.response);
			}
			else{
				reject(this);
			}
		}

		req.onerror = function (){
			reject(this);
		}
		
		req.send(JSON.stringify(payload));
	});
	//TODO: if 500 error, try agin later.
}

/**
 * internal method to download save data from specified url.
 * @param {string} remoteUrl url to download save data from
 * @returns parsed json
 */
async function downloadSave(remoteUrl){
	return new Promise((resolve, reject)=>{
		var req = new XMLHttpRequest();
		req.open("GET", remoteUrl, true);
		req.setRequestHeader("Accept","application/json;odata=nometadata");
		req.setRequestHeader("Content-Type","application/json");
		
		req.onload = function(){
			if(this.status == 200){
				//yay
				resolve(JSON.parse(this.response));
			}
			else{
				reject(this);
			}
		}
		req.onerror = function(){
			reject(this);
		}
		req.send();
	})
		
}

/**
 * Upload current save to server. If currently spectating, does nothing.
 * we don't want remote save to replace current save. so we just set "viewing remote" and disable saving.
 */
async function uploadCurrentSave(){
	if(settings.remoteShareCode){
		//if we're viewing remote, don't upload.
		console.log("viewing remote data, will not upload.");
		return;
	}

	initShareSettings();
	let compressedData = compressSaveData(savedata);
	
	return uploadSave(settings.serverUrl, compressedData, settings.myShareCode, settings.shareKey)
	.then((result)=>{
		if(result){
			if(settings.myShareCode != result){
				console.log("my share code changed from '"+settings.myShareCode+"' to '"+result+"'");
				settings.myShareCode = result;
				saveCookie("settings",settings);
			}
			//do this every time we upload:
			document.dispatchEvent(new Event("progressShared"));
			alert("Uploaded");
		}
	});
}

/**
 * stop spectating and go back to local save data.
 */
function stopSpectating(){
	console.log("clearing remote data");
	settings.remoteShareCode = null;
	saveCookie("settings",settings);
	
	var localProgress = loadCookie("progress_local");
	if(localProgress?.version > 0){
		saveCookie("progress",localProgress);
	}
	saveCookie("progress_local",{});
	
	//check for function before loading because /share.html spectates, but immediately redirects
	// instead of updating progress.
	if(loadProgressFromCookie){
		loadProgressFromCookie();
	}
}

/**
 * Update data from spectating, or stop spectating if remote code is now blank.
 * @param {boolean} notifyOnUpdate should we pop up dialog when we update
 * @param {boolean} updateGlobalSaveData Should we decompress spectating data and store it in the global savedata variable?
 */
async function startSpectating(notifyOnUpdate = true, updateGlobalSaveData = true){
	let code = settings.remoteShareCode;
	if(code == null || code == ""){
		stopSpectating();
	}
	else{
		//TODO: move this if block. i dont think it belongs here.
		let progressLocal = loadCookie("progress_local");
		if(progressLocal == null || Object.keys(progressLocal).length == 0){
			//we don't have progress_local, so we can assume that the current value of 'progress' is local progress,
			//so save it before we overwrite it with the remote data.
			saveCookie("progress_local",loadCookie("progress"));
		}

		let downloadUrl = settings.serverUrl + "/" + settings.remoteShareCode; 
		return downloadSave(downloadUrl)
		.then((dl)=>{
			if(dl){
				//we can't save teh date object so we convert it to a pretty print string here
				let dlTime = new Date();
				settings.shareDownloadTime = dlTime.toDateString() + " " + dlTime.toTimeString().substring(0,8);
				saveCookie("settings",settings);
				saveCookie("progress",dl);
				if(updateGlobalSaveData){
					savedata = decompressSaveData(dl);

				}
				if(notifyOnUpdate){
					alert("Downloaded");
				}
				document.dispatchEvent(new Event("progressLoad"));
			}
		});
	}
}

/**
 * Start (or stop) spectating by viewing a remote url.
 * @param {Event} event onchange update.
 */
function setRemoteUrl(event){
	{
		initShareSettings();
		settings.remoteShareCode = event.target.value;
		saveCookie("settings",settings);
		startSpectating()
			.catch(()=>alert("invalid url"));
	}
}


