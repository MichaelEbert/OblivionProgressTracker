//functions that save and load user progess and settings.
export{
	saveCookie,
	loadCookie,
	upgradeSaveData,
	compressSaveData,
	decompressSaveData,
	saveProgressToCookie,
	loadSettingsFromCookie,
    loadProgressFromCookie,
}


window.savedata = null;
window.settings = null;

const version = 9;

function saveCookie(name,value){
	//save for 10 years
	var expiry = new Date()
	expiry.setDate(expiry.getDate()+365*10);
	document.cookie = name+"="+JSON.stringify(value)+"; expires="+expiry.toUTCString()+"; SameSite = Lax";

}

function loadCookie(name){
	try{
		let thisCookie = document.cookie
		.split('; ')
		.find(row => row.startsWith(name+"="));
		let splitIndex = thisCookie.indexOf("=");
		let cookieValue = thisCookie.substring(splitIndex+1);
		return JSON.parse(cookieValue);
	}
	catch{
		return null;
	}
}

/**
 * Attempt to upgrade the save data stored in `savedata` to the most recent version.
 */
function upgradeSaveData(){
	//we use ! >= so it'll handle stuff like undefined, nan, or strings.
	if(!(savedata.version >= 5)){
		//tell user we can't upgrade.
		let reset = confirm("Save data is out of date. Percentages may be wrong. Would you like to reset progress?");
		if(reset){
			resetProgress();
		}
	}
	else{
		var shouldAttemptUpgrade = false;
		if(savedata.version < version){
			//ask if user wants to attempt upgrade
			shouldAttemptUpgrade = confirm("Save data is out of date. Percentages may be wrong. Would you like to attempt upgrade?");
		}
		if(shouldAttemptUpgrade){
			switch(savedata.version){
				case 5:
				case 6:
					//from 6 to 7: 
					//add fame class
					savedata.fame = {};
				case 7:
					resetProgressForHive(jsondata.fame);
				case 8:
					//add nirnroot and locations in v9
					savedata.nirnroot = {};
					savedata.location = {};
					resetProgressForHive(jsondata.nirnroot);
					resetProgressForHive(jsondata.location);
				case 9:
					savedata.version = version;
					//current version, we're done.
					break;
				default:
					alert("error while upgrading");
					break;
			}
			console.log("upgrade succeeded.");
		}
		saveProgressToCookie();
	}
}

//compress save data object for more efficient stringification
//savedata is in the format where IDs are an associative array of boolean values. 
//change this to linear array of int values so its smaller.
function compressSaveData(saveDataObject){
	var compressed = {};
	compressed.version = saveDataObject.version;
	for(const propname in saveDataObject){
		const matchingClass = classes.find(x=>x.name == propname);
		if(matchingClass != null && matchingClass.standard) {
			//for "standard" classes, we do a more efficient compression
			compressed[propname] = [];
			const elements = saveDataObject[propname];
			for(const elementPropName in elements){
				compressed[propname][parseInt(elementPropName)] = elements[elementPropName] == 1 ?1:0;
			}
		}
		else{
			//otherwise, we just leave it be.
			compressed[propname] = savedata[propname];
		}
	}
	return compressed;
}

function decompressSaveData(compressedSaveData){
	//expand cookie data back to nice, usable form.
	var decompressedSaveData = {};
	for(const propname in compressedSaveData){
		const matchingClass = classes.find(x=>x.name == propname);
		if(matchingClass != null && matchingClass.standard) {
			decompressedSaveData[propname] = {};
			let elements = compressedSaveData[propname];
			for(let i = 0; i < elements.length; i++){
				if(elements[i] != null){
					decompressedSaveData[propname][i] = (elements[i] == 1);
				}
			}
		}
		else{
			decompressedSaveData[propname] = compressedSaveData[propname];
		}
	}
	return decompressedSaveData;
}

/**
 * Save the user's progress.
 */
function saveProgressToCookie(){
	saveCookie("progress",compressSaveData(savedata));
}

/**
 * Load settings from cookie, initializes if nonexistent.
 * separate function because in some cases (share.html) we want to load settings but not progress.
 */
function loadSettingsFromCookie(){
	settings = loadCookie("settings");
	initSettings();
}

/**
 * Initialize object property.
 * @param {} object 
 * @param {*} propname 
 * @param {*} defaultValue 
 */
function initProperty(object, propname, defaultValue){
	if(object[propname] == null){
		object[propname] = defaultValue;
		return true;
	}
	return false;
}

/**
 * Set default values for settings, if they haven't already been set.
 */
function initSettings(){
	let changed = false;

	changed |= initProperty(window, "settings", {});

	//UPGRADES:
	switch(settings.version){
		case null:
		case undefined:
			settings.version = 1;
			if(settings.iframeCheck != null){
				settings.iframeCheck = "auto";
			}
			changed = true;
		default:
			//uhh
			break;
	}

	changed |= initProperty(settings, "minipageCheck",true);
	changed |= initProperty(settings, "iframeCheck", "auto");
	changed |= initProperty(settings, "iframeMinWidth", 600);
	changed |= initProperty(settings, "iframeWidth", "45vw");
	
	//TODO: fix my shit encapsulation. until then...
	if(typeof(initShareSettings) != "undefined"){
		initShareSettings();
	}

	if(changed){
		saveCookie("settings",settings);
	}
}

/**
 * Load progress and settings.
 */
function loadProgressFromCookie(){
	loadSettingsFromCookie();	
	var compressed = loadCookie("progress");
	
	if(compressed){
		savedata = decompressSaveData(compressed);
		if(savedata.version != version){
			upgradeSaveData();
		}
		document.dispatchEvent(new Event("progressLoad"));
		return true;
	}
	else{
		//could not find savedata. create new savedata.
		resetProgress(false);
		return false;
	}
}

/**
 * Reset savedata progress for specific hive. Helper function for resetProgress.
 * @param {object} hive hive to reset
 */
function resetProgressForHive(hive){
	const classname = hive.classname;
	savedata[classname] = {};
	runOnTree(hive,(cell=>{
		if(cell.id == null){
			//this cell doesn't have a sequential ID, so we can't save it.
			return;
		}
		if(cell.type == "number"){
			savedata[classname][cell.id] = 0;
		}
		else{
			savedata[classname][cell.id] = false;
		}}),0);
}

/**
 * Generate a new, clean savedata object, and saves it to cookie.
 * @param {boolean} shouldConfirm Should we confirm with the user or not
 */
function resetProgress(shouldConfirm=false){
	var execute = true;
	if(shouldConfirm){
		execute = confirm("press OK to reset data");
	}
	if(execute){
		savedata = new Object();
		savedata.version = version;
		
		for(const klass of progressClasses){
			resetProgressForHive(jsondata[klass.name]);
		}
	}
	saveProgressToCookie();
	document.dispatchEvent(new Event("progressLoad"));
}