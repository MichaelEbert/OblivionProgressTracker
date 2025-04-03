import { jsondata, classes, loadJsonData, runOnTree, progressClasses } from "./obliviondata.mjs";
import { initShareSettings, uploadCurrentSave } from "./sharing.mjs";
import { updateLocalProgress } from "./progressCalculation.mjs";

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
	resetProgress,
	createNewSave,
	resetProgressForHive,
	initAutoSettings,
	newShareCode
}


window.savedata = null;
window.settings = null;

const SAVEDATA_VERSION = 11;
const SETTINGS_VERSION = 5;

function saveCookie(name,valu){
	var stringValue = JSON.stringify(valu);
	if(window.debugSaving)
	{
		console.log("saving "+name+" with value:"+stringValue);
	}
	window.localStorage.setItem(name, stringValue);
}

function loadCookie(name){
	if(window.debugSaving)
	{
		console.log("loading "+name);
	}
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
function upgradeSaveData(targetSaveData, shouldConfirm = true){
	if(targetSaveData.version == null){
		let reset = confirm("Save data is invalid or corrupted. Reset progress?");
		if(reset){
			targetSaveData = createNewSave();
		}
	}
	//we use ! >= so it'll handle stuff like undefined, nan, or strings.
	if(!(targetSaveData.version >= 5)){
		//tell user we can't upgrade.
		let reset = confirm("Save data is out of date. Percentages may be wrong. Would you like to reset progress?");
		if(reset){
			targetSaveData = createNewSave();
		}
	}
	else{
		var shouldAttemptUpgrade = false;
		if(targetSaveData.version < SAVEDATA_VERSION){
			if(shouldConfirm){
				//ask if user wants to attempt upgrade
				shouldAttemptUpgrade = confirm("Save data is out of date. Percentages may be wrong. Would you like to attempt upgrade?");
			}
			else{
				shouldAttemptUpgrade = true;
			}
		}
		if(shouldAttemptUpgrade){
			switch(targetSaveData.version){
				case 5:
				case 6:
					//from 6 to 7: 
					//add fame class
					targetSaveData.fame = {};
				case 7:
					resetProgressForHive(targetSaveData, jsondata.fame);
				case 8:
					//add nirnroot and locations in v9
					targetSaveData.nirnroot = {};
					targetSaveData.location = {};
					resetProgressForHive(targetSaveData, jsondata.nirnroot);
					resetProgressForHive(targetSaveData, jsondata.location);
				case 9:
				case 10:
					//in 11, we just introduced the "compressed" variable.
					targetSaveData.version = SAVEDATA_VERSION;
					break;
				default:
					alert("error while upgrading");
					break;
			}
			console.log("upgrade succeeded.");
		}
	}
	return targetSaveData;
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
	if(compressedSaveData.version < 11 || compressedSaveData.compressed == true) {
		for(const propname in compressedSaveData){
			const matchingClass = classes.find(x=>x.name == propname);
			if(matchingClass != null && matchingClass.standard) {
				decompressedSaveData[propname] = {};
				let elements = compressedSaveData[propname];
				if(elements.length == undefined){
					//iterate by key
					for(const [key, value] of Object.entries(elements)){
						if(value != null){
							decompressedSaveData[propname][key] = (value == 1) || (value === true);
						}
					}
				}
				else{
					//iterate by index
					for(let i = 0; i < elements.length; i++){
						if(elements[i] != null){
							decompressedSaveData[propname][i] = (elements[i] == 1) || (elements[i] === true);
						}
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
	if(settings.remoteShareCode != null && settings.remoteShareCode != ""){
		//user tried to save while spectating. Load progress instead to reset whatever they did.
		//loadProgressFromCookie();
		return;
	}
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

function newShareCode()
{
	settings.shareKey = null;
	settings.shareCode = null;
	saveCookie("settings", settings);
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
	if(settings.version < SETTINGS_VERSION || settings.version == null)	{
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
				changed |= initProperty(settings, "spectateAutoRefreshInterval", 5);
			case 2:
				//2 to 3: 
				//deprecated
			case 3:
				// reset shareDownloadTimeInternal since we changed its type
				if(settings.shareDownloadTimeInternal != undefined) {
					settings.shareDownloadTimeInternal = null;
				}
			case 4:
				// renamed myShareCode to shareCode
				if(settings.myShareCode != null){
					settings.shareCode = settings.myShareCode;
				}		
			default:
				//done
				break;
		}
		
		settings.version = SETTINGS_VERSION;
		changed = true;
	}

	//default values
	changed |= initProperty(settings, "iframeCheck", "auto");
	changed |= initProperty(settings, "iframeMinWidth", 1000);
	changed |= initProperty(settings, "iframeWidth", "45vw");
	changed |= initProperty(settings, "mapShowPrediscovered", true);
	changed |= initProperty(settings, "mapShowLocationsOnNirnroot", false);
	changed |= initProperty(settings, "classnameCheck", false);
	changed |= initProperty(settings, "mapShowNonGates", true);
	changed |= initProperty(settings, "mapShowGates", true);
	
	if(settings.shareDownloadTimeInternal != null)
	{
		settings.shareDownloadTimeInternal = new Date(settings.shareDownloadTimeInternal);
	}

	//TODO: fix my shit encapsulation.
	initShareSettings();

	if(changed){
		saveCookie("settings",settings);
	}
}

/**
 * Load progress and settings. Dispatch a progressLoad event when progress is loaded.
 * @returns {boolean} true if progress was been successfully loaded. False if new savedata was created.
 */
function loadProgressFromCookie(){
	loadSettingsFromCookie();
	if(settings.shareCode != null || settings.remoteShareCode != null)
	{
		//TODO: try reloading from remote
		//TODO: what if we wipe save#s tho
		//downloadSave(...)
	}
	var compressed = loadCookie("progress");
	
	if(compressed && Object.getOwnPropertyNames(compressed).length != 0){
		
		updateLocalProgress(compressed);
		return true;
	}
	else{
		//could not find savedata. create new savedata.
		if(window.debug){
			console.log("could not find savedata. resetting progress.");
		}
		resetProgress(false);
		return false;
	}
}

/**
 * Reset savedata progress for specific hive. Helper function for resetProgress.
 * @param {object} targetSaveData save data to reset hive in
 * @param {object} hive hive to reset
 */
function resetProgressForHive(targetSaveData, hive)
{
	const classname = hive.classname;
	targetSaveData[classname] = {};
	runOnTree(hive,(cell=>{
		cell.cache = null;
		if(cell.id == null){
			//this cell doesn't have a sequential ID, so we can't save it.
			return;
		}
		if(cell.type == "number"){
			targetSaveData[classname][cell.id] = 0;
		}
		else{
			targetSaveData[classname][cell.id] = false;
		}}));
}

function createNewSave()
{
	if(jsondata == null){
		return loadJsonData('..').then(()=>{
			console.assert(jsondata != null);
			return createNewSave();
		});
	}
	
	let targetSaveData = new Object();
	targetSaveData.version = SAVEDATA_VERSION;
	
	for(const klass of progressClasses){
		resetProgressForHive(targetSaveData, jsondata[klass.name]);
	}
	return targetSaveData;
}

/**
 * Generate a new, clean savedata object, and saves it to cookie. Dispatches a progressLoad event when save data is updated.
 * @param {boolean} shouldConfirm Should we confirm with the user or not
 */
function resetProgress(shouldConfirm=false){
	var execute = true;
	if(shouldConfirm){
		execute = confirm("press OK to reset data");
	}
	if(execute){
		let newdata = createNewSave();
		updateLocalProgress(newdata);
		if(settings.shareCode != null)
		{
			uploadCurrentSave();
		}
	}
}

/**
 * all checkboxes with class "autosetting" will automatically have a setting created for them.
 * all input with class "autoTextSetting" will automatically have a setting created for them.
 */
function initAutoSettings(settingsEvent, textSettingsEvent){
    let autoSettings = document.getElementsByClassName("autosetting");
    for(const setting of autoSettings){
        setting.addEventListener('change', onSettingChange);
        if(settingsEvent != null){setting.addEventListener('change', settingsEvent);}
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
        if(textSettingsEvent != null){setting.addEventListener('change', textSettingsEvent);}
        const settingName = setting.id;
        if(settings[settingName] != null){
            setting.value = settings[settingName];
        }
        if(window.debug){
            console.log("Auto text setting "+settingName+" with value "+settings[settingName]);
        }
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