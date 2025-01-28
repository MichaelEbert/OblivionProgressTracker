// ==============
// Contains code for sharing progress across the network.

import { base64ArrayBuffer } from "./base64ArrayBuffer.mjs";
import { updateLocalProgress } from "./progressCalculation.mjs";
import { loadProgressFromCookie,	saveCookie,	loadCookie,	compressSaveData} from "./userdata.mjs";

// ==============
export {
	initShareSettings,
	generateSaveKey,
	uploadSave,
	downloadSave,
	uploadCurrentSave,
	uploadPartialSave,
	startSpectating,
	stopSpectating,
	setRemoteUrl,
	createSpectateBanner,
	initSharingFeature
};

/**
 * checks to make sure that the global settings object has required properties for sharing.
 * if not, set them to sensible defaults.
 * todo: move this to userdata?
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
	currentRequest = new Promise((resolve, reject) =>{
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
			let newCode;
			//first get url...
			const share = "share/";
			var start = this.responseURL.indexOf(share);
			if(start == -1){
				newCode = this.response;
			}
			else{
				start += share.length;
				newCode = this.responseURL.substring(start);
				newCode = newCode.substring(0, newCode.indexOf('/'));
				if(newCode.length < 6){
					newCode = this.response;
				}
			}
			currentRequest = null;
			if(this.status == 200){
				//yay.
				resolve({"code": newCode, "response":this.response});
			}
			else{
				reject(this);
			}
		}

		req.onerror = function (){
			currentRequest = null;
			reject(this);
		}
		
		req.send(JSON.stringify(payload));
	});
	
	return currentRequest;
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
		if(settings.shareDownloadTimeInternal != null && settings.shareDownloadTimeInternal != ""){
			req.setRequestHeader("If-Modified-Since",settings.shareDownloadTimeInternal.toUTCString());
		}
		
		req.onload = function(){
			if(this.status == 200){
				//yay
				resolve(JSON.parse(this.response));
			}
			else if(this.status == 304){
				//unchanged
				resolve();
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
async function uploadCurrentSave(notifyOnUpdate = true){	
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
			let responseContainsNewProgress = true;
			if(settings.myShareCode != result.code){
				console.log("my share code changed from '"+settings.myShareCode+"' to '"+result.code+"'");
				if(settings.myShareCode == null){
					responseContainsNewProgress = false;
				}
				settings.myShareCode = result.code;
				saveCookie("settings",settings);
				
			}
			if(responseContainsNewProgress){
				updateLocalProgress(JSON.parse(result.response), true);
			}

			//do this every time we upload:
			document.dispatchEvent(new Event("progressShared"));
			if(window.debug){
				console.log("progress shared: "+result.code);
			}
			if(notifyOnUpdate){
				//?????
				alert("Progress Shared");
			}
		}
	});
}

/**
 * Upload partial changes to a savefile.
 * @param partialJsonData jsondata hive to upload.
 */
async function uploadPartialSave(partialJsonData){
	if(settings.remoteShareCode){
		//if we're viewing remote, don't upload.
		console.log("viewing remote data, will not upload.");
		return;
	}
	initShareSettings();

	//currently only support single element or single hive.
	if(partialJsonData.hive == null)
	{
		console.error("cannot upload, no hive found.");
	}

	//hive:
	let hive = partialJsonData.hive;
	if(!hive.class.containsUserProgress)
	{
		return;
	}

	//get savedata format
	let dataToUpload = savedata[hive.classname];
	let uploadPath = hive.classname;

	if(partialJsonData.elements == null && partialJsonData.id != null)
	{
		//leaf node. we can upload just this.
		dataToUpload = savedata[hive.classname][partialJsonData.id];
		if(hive.class.standard)
		{
			//compress if we need to
			dataToUpload = dataToUpload == 1 ? 1:0;
		}
		uploadPath = `${hive.classname}/${partialJsonData.id}`;
	}
	else{
		if(hive.class.standard)
		{
			let compressed = [];
			for(const elementPropName in dataToUpload){
				compressed[parseInt(elementPropName)] = dataToUpload[elementPropName] == 1 ?1:0;
			}
			dataToUpload = compressed;
		}
	}	

	let fullUrl = `${settings.serverUrl}/${settings.myShareCode}/d/${uploadPath}`;
	return uploadSave(fullUrl, dataToUpload, settings.myShareCode, settings.shareKey);
}

/**
 * @returns {boolean} is user currently spectating
 */
function isSpectating(){
	return settings.remoteShareCode != null && settings.remoteShareCode != "";
}

/**
 * stop spectating and go back to local save data.
 */
function stopSpectating(){
	if(autoUpdateIntervalId != null){
		clearInterval(autoUpdateIntervalId);
	}
	console.log("stopping spectating.");
	
	settings.remoteShareCode = null;
	settings.shareDownloadTimeInternal = null;
	settings.shareDownloadTime = "";
	saveCookie("settings",settings);

	document.getElementById("spectateBanner")?.remove();
	document.getElementById("sidebarFloaty")?.classList.remove("screenHeight2");
	var localProgress = loadCookie("progress_local");
	if(localProgress != null && Object.keys(localProgress).length > 0){
		if(window.debug){
			console.log("localProgress is not null and has keys. Setting progress to local progress.");
		}
		saveCookie("progress",localProgress);
		saveCookie("progress_local",{});
	}
	//check for function before loading because /share.html spectates, but immediately redirects
	// instead of updating progress.
	//loadProgressFromCookie emits a progressLoad event so we don't have to manually do it.
	loadProgressFromCookie();
}

//autoupdate listener.
var autoUpdateListener = null;
var autoUpdateIntervalId = null;
var currentRequest = null;
/**
 * Update data from spectating, or stop spectating if remote code is now blank. Emits a "progressLoad" event when download is complete.
 * Must set spectate code before calling.
 * @param {boolean} notifyOnUpdate should we pop up dialog when we update
 * @param {boolean} updateGlobalSaveData Should we decompress spectating data (true) or just write it to localStorage?
 */
async function startSpectating(notifyOnUpdate = true, updateGlobalSaveData = true){
	if((new Date() - settings.shareDownloadTimeInternal) < (settings.spectateAutoRefreshInterval*1000)){
		return;
	}
	if(currentRequest != null){
		return;
	}
	if(window.debug){
		console.log("spectate update");
	}
	let code = settings.remoteShareCode;
	if(code == null || code == ""){
		stopSpectating();
	}
	else{
		//TODO: move this if block. i dont think it belongs here.
		let progressLocal = null;
		try{
			progressLocal = loadCookie("progress_local");
		}
		catch{}
		
		if(progressLocal == null || Object.keys(progressLocal).length == 0){
			//we don't have progress_local, so we can assume that the current value of 'progress' is local progress,
			//so save it before we overwrite it with the remote data.
			saveCookie("progress_local",loadCookie("progress"));
		}

		let downloadUrl = settings.serverUrl + "/" + settings.remoteShareCode; 
		currentRequest = downloadSave(downloadUrl)
		.then((dl)=>{
			if(dl){
				//we can't serialize the date object so we convert it to a pretty print string here
				let dlTime = new Date();
				settings.shareDownloadTimeInternal = dlTime;
				settings.shareDownloadTime = dlTime.toDateString() + " " + dlTime.toTimeString().substring(0,8);				
				saveCookie("settings",settings);
				if(notifyOnUpdate){
					alert("Downloaded");
				}
				if(!updateGlobalSaveData) {
					window.savedata = dl;
					saveCookie("progress", savedata);
				}
				else{
					updateLocalProgress(dl, true);
				}
			}
			else{
				if(window.debug){
					console.log("304 content unchanged since "+settings.shareDownloadTimeInternal);
				}
			}

			//AFTER everything else, attach an auto listener to update spectating.
			if(autoUpdateListener == null && settings.spectateAutoRefresh == true && isSpectating()){
				if(window.debug){
					console.log("Attaching auto update listener");
				}
				autoUpdateListener = ()=>{
					startSpectating(false, true);
				}
				autoUpdateIntervalId = setInterval(autoUpdateListener, Math.max(settings.spectateAutoRefreshInterval*1000, 1000));
			}
			currentRequest = null;
		}).catch((e)=>{
			if(e.status == 400){
				alert("Share code '"+settings.remoteShareCode+"' isn't in correct format. It should be 6 characters.");
			}
			if(e.status == 404){
				alert("Share code '"+settings.remoteShareCode+"' doesn't exist. Did you mistype it?");
			}
			else{
				alert("invalid url: "+e.responseURL+" retuned with status "+e.status);
			}
			stopSpectating();
			currentRequest = null;
		});
		return currentRequest;
	}
}

/**
 * Start (or stop) spectating by viewing a remote url.
 * @param {Event} event onchange update.
 */
function setRemoteUrl(event)
{
	initShareSettings();
	settings.remoteShareCode = event.target.value;
	saveCookie("settings",settings);
	startSpectating();
}

/**
 * Create a "spectating" banner element
 * @returns html element to control spectating.
 */
function createSpectateBanner(){
	let spectateBanner = document.createElement("DIV");
	let bannerDefaultText = "You are currently spectating someone else and cannot make changes. Exit spectator mode to switch back to your personal progress. ⟳";
	spectateBanner.innerText = bannerDefaultText;
	spectateBanner.id = "spectateBanner";
	spectateBanner.classList.add("spectateBanner");
	spectateBanner.title = "Last updated "+settings.shareDownloadTime+". Click to refresh."
	spectateBanner.addEventListener("click", function(){
		// childNodes[0] because that's the #text fragment. can't do innerText because the cancel button is there as well.
		spectateBanner.childNodes[0].nodeValue = "Reloading...";
		startSpectating(false, true).then(()=>{
			spectateBanner.childNodes[0].nodeValue = bannerDefaultText;
			spectateBanner.title = "Last updated "+settings.shareDownloadTime+". Click to refresh.";
		});
	});

	let spectateCancelButton = document.createElement("SPAN");
	spectateCancelButton.innerText = "🗙";
	spectateCancelButton.title = "Cancel spectating";
	spectateCancelButton.addEventListener("click", function(){
		stopSpectating();
		spectateBanner.remove();
	});
	spectateBanner.appendChild(spectateCancelButton);

	return spectateBanner;
}

/**
 * Call this on a page to do all the sharing stuff. Create topbar, start autorefresh, etc.
 */
function initSharingFeature(){
	if(!isSpectating() && (settings.myShareCode == null || settings.myShareCode == "")){
		return;
	}

	if(isSpectating())
	{
		if(!document.getElementById("spectateBanner")){
			let spectateBanner = createSpectateBanner();
			document.getElementById("topbar")?.insertBefore(spectateBanner, document.getElementById("topbar").firstChild);
			document.getElementById("sidebarFloaty")?.classList.add("screenHeight2");
		}
		if(settings.spectateAutoRefresh == true){
			startSpectating(false, true);
		}
	}
	else{
		if(settings.spectateAutoRefresh)
		{
			startSync(true);
		}
	}
}

function startSync(updateGlobalSaveData)
{
	if((new Date() - settings.shareDownloadTimeInternal) < (settings.spectateAutoRefreshInterval*1000)){
		return;
	}
	if(currentRequest != null){
		return;
	}
	let downloadUrl = settings.serverUrl + "/" + settings.myShareCode; 
	currentRequest = downloadSave(downloadUrl)
	.then((dl)=>{
		if(dl){
			//we can't serialize the date object so we convert it to a pretty print string here
			let dlTime = new Date();
			settings.shareDownloadTimeInternal = dlTime;
			settings.shareDownloadTime = dlTime.toDateString() + " " + dlTime.toTimeString().substring(0,8);
			saveCookie("settings",settings);

			updateLocalProgress(dl, true);
		}
		else{
			if(window.debug){
				console.log("304 content unchanged since "+settings.shareDownloadTimeInternal);
			}
		}

		//AFTER everything else, attach an auto listener to update spectating.
		if(autoUpdateListener == null && settings.spectateAutoRefresh == true){
			if(window.debug){
				console.log("Attaching auto update listener");
			}
			autoUpdateListener = ()=>{
				startSync(true);
			}
			autoUpdateIntervalId = setInterval(autoUpdateListener, Math.max(settings.spectateAutoRefreshInterval*1000, 1000));
		}
		currentRequest = null;
	})
	.catch(request=>{
		//if 404, that just means that no progress has been shared yet,
		//so that's OK.
		if(request.status == 404)
		{
			if(window.debug){
				console.log("no progress uploaded to server yet");
			}
			//AFTER everything else, attach an auto listener to update spectating.
			if(autoUpdateListener == null && settings.spectateAutoRefresh == true){
				if(window.debug){
					console.log("Attaching auto update listener");
				}
				autoUpdateListener = ()=>{
					startSync(true);
				}
				autoUpdateIntervalId = setInterval(autoUpdateListener, Math.max(settings.spectateAutoRefreshInterval*1000, 1000));
			}
		}
		currentRequest = null;
	});
	return currentRequest;
}

