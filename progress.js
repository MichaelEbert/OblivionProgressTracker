"use strict"
//functions that save and load user progess.

var savedata;
var settings;
const version = 6;

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

/**
 * Load settings from cookie, initializes if nonexistent.
 * separate function because in some cases (share.html) we want to load settings but not progress.
 */
function loadSettingsFromCookie(){
	settings = loadCookie("settings");
	if(settings == null){
		settings = {};
	}
	//TODO: fix my shit encapsulation. until then...
	if(initShareSettings != null){
		initShareSettings();
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
		}}),0);
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

//=========================
//Progress percentage updates and helper functions
//=========================

/**
 * Update save progress for the specified element.
 * @param {*} formId 
 * @param {Element} inputElement HTML input element with the new value 
 * @param {*} classHint 
 * @param {*} cellHint 
 */
function updateChecklistProgressFromInputElement(formId, inputElement, classHint = null, cellHint = null){
	//lets extract the value from the input elemeent.
	if(inputElement.tagName != "INPUT"){
		debugger;
		console.error("input elmeent does not have type INPUT");
		return;
	}

	let newValue = null;
	if(inputElement.type == "checkbox"){
		newValue = inputElement.checked;
	}
	else{
		newValue = inputElement.valueAsNumber;
	}

	return updateChecklistProgress(formId, newValue, classHint, cellHint);
}

function updateChecklistProgress(formId, newValue, classHint = null, cellHint = null){
	let cell = null;
	if(cellHint != null)
	{
		cell = cellHint;
	}
	else{
		cell = findCell(formId, classHint);
		if(cell == null){
			throw "Element not found to save progress on."
		}
	}

	let valueAsCorrectType;
	if(cell.type == "number"){
		switch(typeof(newValue)){
			case "boolean":
				valueAsCorrectType = newValue? 1 : 0;
				break;
			case "number":
				valueAsCorrectType = newValue;
				break;
			default:
				throw "unexpected input type";
		}
	}
	else{
		//cell is bool
		switch(typeof(newValue)){
			case "boolean":
				valueAsCorrectType = newValue;
				break;
			case "number":
				if(newValue == 0){
					valueAsCorrectType = false;
				}
				else{
					valueAsCorrectType = true;
				}
				break;
			default:
				throw "unexpected input type";
		}
	}

	if(cell.id == null){
		//we don't need to save this
		if(cell.onUpdate != null && cell.onUpdate.length != 0 ){
			for(const fn of cell.onUpdate){
				fn(cell, valueAsCorrectType);
			}
		}
		return true;
	}
	else{
		//now we get the save data for this.
		let oldval = savedata[cell.hive.classname][cell.id];
		if(valueAsCorrectType == oldval){
			//do nothing.
			return false;
		}
		else{
			savedata[cell.hive.classname][cell.id] = valueAsCorrectType;
			//do post-update stuff here.
			if(cell.onUpdate != null && cell.onUpdate.length != 0 ){
				for(const fn of cell.onUpdate){
					fn(cell, valueAsCorrectType);
				}
			}
			return true;
		}
	}
}

function updateInputElementFromProgress(newValue, inputElement){
	//... TODO
}

/**
 * Recalculate progress
 * @returns {Number} progress
 */
function recalculateProgress(){
	//we could probably cache the hives that aren't modified
	var percentCompleteSoFar = 0.0;
	for(const klass of progressClasses) {
		const hive = jsondata[klass.name];
		percentCompleteSoFar += runOnTree(hive, node=>getSubtotalCompletion(node,klass.name), 0, node=>node.weight != null);
	}
	
	//we can turn percentCompleteSoFar into an actual percent here, instead of dividing by total in each segment, since
	// (a / total + b/total + c/total + ...) == (a+b+c+..)/total
	percentCompleteSoFar = percentCompleteSoFar / totalweight;
	return percentCompleteSoFar;
}

/**
 * Get completion for a subtotal, multiplied by the subtree weight. additionally, updates subtotal HTML elements if it can find them.
 * @param {Object} subtotalJsonNode node with a subtotal
 * @returns {Number} weighted completion percentage
 */
function getSubtotalCompletion(subtotalJsonNode){
	const weight = subtotalJsonNode.weight;
	//optimization so we're not looking for progress in nodes that don't have it (eg saves)
	if(weight == 0){
		return 0;
	}
	const [items,total] = sumCompletionItems(subtotalJsonNode);
	
	//try to find subtotals
	//this may fail if we have multiple score nodes from different hives with the same name.
	let nodeInternalName = subtotalJsonNode.classname;
	if(!nodeInternalName){
		nodeInternalName = subtotalJsonNode.name;
	}
	if(nodeInternalName == null){
		console.warn("score node has no name");
		debugger;
	}
	const overviewId = "overview_"+nodeInternalName.replaceAll(" ","_").toLowerCase();
	const maybeItem = document.getElementById(overviewId);
	if(maybeItem){
		//add this to correct subtotal slot
		maybeItem.innerText = items.toString() + "/" + total.toString();
	}
	
	// and finally, return weighted progress for total progress.
	return (items/total)*weight;
}

/**
 * Recursively sum completion items for all cells in this tree.
 * @param {object} jsonNode tree root
 * @returns {[Number,Number]} an array of [completed items, total items] for this tree.
 */
function sumCompletionItems(jsonNode){
	//can't use runOnTree because we get 2 inner results and we cant add that in 1 step
	if(jsonNode.elements == null){
		return sumCompletionSingleCell(jsonNode);
	}
	else{
		var completed = 0;
		var total = 0;
		for(const element of jsonNode.elements){
			let innerResult = sumCompletionItems(element);
			completed += innerResult[0];
			total += innerResult[1];
		}
		return [completed,total];
	}
}

/**
 * Extract the user's completion of a single cell.
 * @param {Object} cell cell to check completion on
 * @returns {[Number,Number]} an array of [completed items, total items] for this cell.
 */
function sumCompletionSingleCell(cell){
	var totalElements;
	var completedElements;
	if(cell?.hive?.name == null){
		console.error("Error summing completion for cell: hive name is null.");
		console.error(cell);
		return [0,0];
	}

	if(cell.type == "number"){
		completedElements = savedata[cell.hive.classname][cell.id];
		if(cell.max){
			totalElements = cell.max;
		}
		else{
			totalElements = Math.max(1,completedElements);
		}
	}
	else{
		//we're a checkbox
		totalElements = 1;
		if(cell.hive.classname == null){
			debugger;
		}
		if(savedata[cell.hive.classname][cell.id]){
			completedElements = 1;
		}
		else{
			completedElements = 0;
		}
	}
	if(completedElements == undefined || totalElements == undefined){
		console.error("element completion is undefined. Skipping.");
		console.error(cell);
		return [0,0];
	}
	return [completedElements,totalElements];	
}


//Topbar percentage update and helper functions END