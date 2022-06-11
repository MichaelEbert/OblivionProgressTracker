import { jsondata } from "./obliviondata.mjs";
import { classes } from "./obliviondata.mjs";
import { runOnTree } from "./obliviondata.mjs";
import { progressClasses } from "./obliviondata.mjs";
import { initShareSettings } from "./sharing.mjs";

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
	resetProgress
}


window.savedata = null;
window.settings = null;

const SAVEDATA_VERSION = 11;
const SETTINGS_VERSION = 2;

function saveCookie(name,valu){
	var stringValue = JSON.stringify(valu);
	window.localStorage.setItem(name, stringValue);
}

function loadCookie(name){
	return JSON.parse(window.localStorage.getItem(name));
}

function loadCookieOld(name){
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

window.migrate = function(){
	saveCookie("settings",loadCookieOld("settings"));
	saveCookie("progress",loadCookieOld("progress"));
	console.log("migrated.");
}

/**
 * Attempt to upgrade the save data stored in `savedata` to the most recent version.
 */
function upgradeSaveData(shouldConfirm){
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
		if(savedata.version < SAVEDATA_VERSION){
			if(shouldConfirm){
				//ask if user wants to attempt upgrade
				shouldAttemptUpgrade = confirm("Save data is out of date. Percentages may be wrong. Would you like to attempt upgrade?");
			}
			else{
				shouldAttemptUpgrade = true;
			}
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
				case 10:
					//in 11, we just introduced the "compressed" variable.
					savedata.version = SAVEDATA_VERSION;
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
	compressed.compressed = true;
	return compressed;
}

function decompressSaveData(compressedSaveData){
	//expand cookie data back to nice, usable form.
	var decompressedSaveData = {};
	if(compressedSaveData.version < 11 || compressedSaveData.compressed == true)
	{
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
	}
	else{
		decompressedSaveData = compressedSaveData;
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
 * Initialize object property to defaultvalue if it currently does not exist.
 * @param {} object 
 * @param {*} propname name of property to initialize
 * @param {*} defaultValue value to set property to (if it doesn't exist yet)
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
	//use this (and bump the settings version) when there is a breaking change in the format.
	if(settings.version !== SETTINGS_VERSION)
	{
		switch(settings.version){
			case null:
			case undefined:
				settings.version = 1;
				if(settings.iframeCheck != null){
					settings.iframeCheck = "auto";
				}
				changed = true;
			case 1:
				//1 to 2: set auto refresh and auto refresh time.
				changed |= initProperty(settings, "spectateAutoRefresh", true);
				changed |= initProperty(settings, "spectateAutoRefreshInterval", 30);
			default:
				//uhh
				break;
		}
		settings.version = SETTINGS_VERSION;
		changed = true;
	}

	//default values
	
	changed |= initProperty(settings, "minipageCheck",true);
	changed |= initProperty(settings, "iframeCheck", "auto");
	changed |= initProperty(settings, "iframeMinWidth", 600);
	changed |= initProperty(settings, "iframeWidth", "45vw");
	changed |= initProperty(settings, "mapShowPrediscovered", true);
	changed |= initProperty(settings, "mapShowLocationsOnNirnroot", false);
	
	//TODO: fix my shit encapsulation.
	initShareSettings();

	if(changed){
		saveCookie("settings",settings);
	}
}

/**
 * Load progress and settings. Dispatch a progressChanged event when progress is loaded.
 * @returns {boolean} true if progress was been successfully loaded. False if new savedata was created.
 */
function loadProgressFromCookie(){
	loadSettingsFromCookie();	
	var compressed = loadCookie("progress");
	
	if(compressed){
		savedata = decompressSaveData(compressed);
		if(savedata.version != SAVEDATA_VERSION){
			upgradeSaveData();
		}
		document.dispatchEvent(new Event("progressChanged"));
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
		}}));
}

/**
 * Generate a new, clean savedata object, and saves it to cookie. Dispatches a progressChanged event when save data is updated.
 * @param {boolean} shouldConfirm Should we confirm with the user or not
 */
function resetProgress(shouldConfirm=false){
	var execute = true;
	if(shouldConfirm){
		execute = confirm("press OK to reset data");
	}
	if(execute){
		savedata = new Object();
		savedata.version = SAVEDATA_VERSION;
		
		for(const klass of progressClasses){
			resetProgressForHive(jsondata[klass.name]);
		}
	}
	saveProgressToCookie();
	document.dispatchEvent(new Event("progressChanged"));
}