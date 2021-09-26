"use strict"
//functions that save and load user progess.

var savedata;
var settings;
const version = 6;

function saveCookie(name,value){
	//save for 10 years
	if(value == null || Object.keys(value) == null){
		debugger;
	}
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

function saveProgressToCookie(){
	saveCookie("progress",compressSaveData(savedata));
}

function loadProgressFromCookie(){
	settings = loadCookie("settings");
	if(settings == null){
		settings = {};
	}
	
	var compressed = loadCookie("progress");
	
	if(compressed){
		savedata = decompressSaveData(compressed);
		if(savedata.version != version){
			alert("Save data is out of date. Percentages may be wrong.")
		}
		document.dispatchEvent(new Event("progressLoad"));
		return true;
	}
	else{
		return false;
	}
}

//helper function for resetProgress
function resetProgressForTree(classname, jsonNode){
	runOnTree(jsonNode,(e=>{
		if(e.type == "number"){
			savedata[classname][e.id] = 0;
		}
		else{
			savedata[classname][e.id] = false;
		}}),0,(e=>e.id != null));
}

//generate a new, clean savedata object, and saves it to cookie.
function resetProgress(shouldConfirm=false){
	var execute = true;
	if(shouldConfirm){
		execute = confirm("press OK to reset data");
	}
	if(execute){
		savedata = new Object();
		savedata.version = version;
		
		for(const klass of classes){
			if(klass.shouldSave){
				savedata[klass.name] = {};
				resetProgressForTree(klass.name, jsondata[klass.name]);
			}
		}
	}
	saveProgressToCookie();
	document.dispatchEvent(new Event("progressLoad"));
}