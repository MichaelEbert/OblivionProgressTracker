//=========================
//Progress percentage updates and helper functions
//=========================

export{
	updateChecklistProgressFromInputElement,
	updateChecklistProgress,
	recalculateProgress,
	sumCompletionItems,
	clearProgressCache
}

import { totalweight, getJsonData, findCell, runOnTree, progressClasses } from './obliviondata.mjs';
import {saveProgressToCookie} from './userdata.mjs';
import {uploadCurrentSave} from './sharing.mjs';
import { uploadPartialSave } from './sharing.mjs';
import { decompressSaveData } from './userdata.mjs';

/**
 * Update save progress for the specified element.
 * @param {*} formId formid of the cell to update save data for.
 * @param {Element} inputElement HTML input element with the new value 
 * @param {*} classHint optional. classname of hive to search for this cell in.
 * @param {*} cellHint optional. the cell to update save data for.
 * @returns was value changed
 */
function updateChecklistProgressFromInputElement(formId, inputElement, classHint = null, cellHint = null){
	//lets extract the value from the input elemeent.
	if(inputElement.tagName != "INPUT"){
		debugger;
		console.error("input elmeent does not have type INPUT");
		return false;
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

/**
 * Update save progress for the specified cell.
 * @param {*} formId formid of the cell to update save data for.
 * @param {*} value new value
 * @param {*} classHint optional. classname of hive to search for this cell in.
 * @param {*} cellHint optional. the cell to update save data for.
 * @param {boolean} skipSave optional. Should we skip saving this value. Useful for loading from file.
 * @returns was value changed
 */
function updateChecklistProgress(formId, newValue, classHint = null, cellHint = null, skipSave = false){
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
	if(cell.ref && cell.forwardInput){
		cell = findCell(cell.ref);
	}

	return updateChecklistProgressInternal(cell, newValue, skipSave);
}

/**
 * Update save progress for the specified cell.
 * @param {*} formId formid of the cell to update save data for.
 * @param {*} value new value
 * @param {boolean} skipSave optional. Should we skip saving this value. Useful for loading from file.
 * @returns was value changed
 */
function updateChecklistProgressInternal(cell, newValue, skipSave){
	let valueAsCorrectType;
	if(cell.type == "number"){
		switch(typeof(newValue)){
			case "boolean":
				valueAsCorrectType = newValue? 1 : 0;
				break;
			case "number":
				valueAsCorrectType = newValue;
				break;
			case "undefined":
				//save data doesn't exist for this element, we should delete it.
				valueAsCorrectType = undefined;
				break;
			default:
				debugger;
				console.error("unexpected input type "+typeof(newValue)+" for cell "+cell.name);
				return false;
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
			case "undefined":
				valueAsCorrectType = undefined;
				break;
			default:
				debugger;
				console.error("unexpected input type "+typeof(newValue)+" for cell "+cell.name);
				return false;
		}
	}
	//mark cached value as invalid
	let cellObj = cell;
	while(cellObj != null){
		cellObj.cache = null;
		cellObj = cellObj.parent;
	}

	if(cell.id == null || !cell.hive.class.containsUserProgress){
		//we don't need to save this
		if(cell.onUpdate != null && cell.onUpdate.length != 0 ){
			for(const fn of cell.onUpdate){
				fn(cell, valueAsCorrectType);
			}
		}
		return false;
	}
	else{
		if(!skipSave){
			//now we get the save data for this.
			let oldval = savedata[cell.hive.classname][cell.id];
			if(valueAsCorrectType == oldval){
				//do nothing.
				return false;
			}

			if(valueAsCorrectType === undefined){
				if(savedata[cell.hive.classname][cell.id] !== undefined){
					//delete this element
					delete savedata[cell.hive.classname][cell.id];
				}
			}
			else{
				savedata[cell.hive.classname][cell.id] = valueAsCorrectType;
			}
		}
		
		//do post-update stuff here.
		if(cell.onUpdate != null && cell.onUpdate.length != 0 ){
			for(const fn of cell.onUpdate){
				fn(cell, valueAsCorrectType);
			}
		}
		if(!skipSave){
			saveProgressToCookie();
			if(settings.autoUploadCheck){
				// idk this might result in torn savedata
				uploadPartialSave(cell.hive).then((result)=>{
					//new data:
					const oldData = JSON.stringify(compressSaveData(savedata));
					const newData = JSON.stringify(compressSaveData(decompressSaveData(JSON.parse(result.response))));
					if(oldData != newData)
					{
						alert("data changed on server!");
					}
				});
			}
		}
		return true;
	}
}

function clearProgressCache(){
	for(const klass of progressClasses){
		runOnTree(jsondata[klass.name], (cell)=>cell.cache = null, 0, (node)=>true);
	}
}

/**
 * Recalculate progress. Also updates UI.
 * @returns {Number} progress
 */
function recalculateProgress(){
	//we have to recalculate hives that are updated because of refs to other hives.
	var calculator = new ProgressCalculator();
	const percentCompleteSoFar = calculator.calculateProgress(progressClasses, getJsonData());

	let progress = (percentCompleteSoFar * 100).toFixed(2);
	Array.of(...document.getElementsByClassName("totalProgressPercent")).forEach(element => {
		element.innerText = progress.toString();
		if(element.parentElement.className == "topbarSection"){
			element.parentElement.style = `background: linear-gradient(to right, green ${progress.toString()}%, crimson ${progress.toString()}%);`;
		}
	});
	return percentCompleteSoFar;
}

function sumCompletionItems(cell){
	var calculator = new ProgressCalculator();
	return calculator.sumCompletionItems(cell);
}

//this is an object because we need the hivesToCalculate in child functions.
function ProgressCalculator(){
	this.hivesToCalculate = [];
}

ProgressCalculator.prototype.calculateProgress = function(progressClasses, jsondata){
	this.hivesToCalculate = progressClasses.map(x=>jsondata[x.name]);
	this.hiveResults = new Map();
	var MAX_HIVES = 16;//prevent endless recursion
	let i = 0;
	for(i = 0; (i < this.hivesToCalculate.length && i < MAX_HIVES); i+=1){
		const thisHive = this.hivesToCalculate[i];
		//have to encapsulate the getSubtotalCompletion call in a lambda to capture `this`
		this.hiveResults.set(thisHive, runOnTree(thisHive, (x=>this.getSubtotalCompletion(x)), 0, node=>node.weight != null, true));
	}
	if(i == MAX_HIVES){
		console.warn("Progress calculation infinite loop: reached MAX_HIVES");
	}

	//sum the final results
	var totalCompleteSoFar = 0.0;
	for(const value of this.hiveResults.values()){
		totalCompleteSoFar += value;
	}
	//we can turn percentCompleteSoFar into an actual percent here, instead of dividing by total in each segment, since
	// (a / total + b/total + c/total + ...) == (a+b+c+..)/total
	let percentCompleteSoFar = totalCompleteSoFar / totalweight;
	if(window.debug){
		console.log("Progress: %f items complete out of %f.", totalCompleteSoFar, totalweight);
	}

	//this is so we can access our percentage on other pages that don't affect it.
	localStorage.setItem("percentageDone", percentCompleteSoFar)

	return percentCompleteSoFar;
}

/**
 * Get completion for a subtotal, multiplied by the subtree weight. additionally, updates subtotal HTML elements if it can find them.
 * @param {Object} subtotalJsonNode node with a subtotal
 * @returns {Number} weighted completion percentage
 */
ProgressCalculator.prototype.getSubtotalCompletion = function(subtotalJsonNode){
	const weight = subtotalJsonNode.weight;
	//optimization so we're not looking for progress in nodes that don't have it (eg saves)
	if(weight == 0){
		return 0;
	}
	const [items,total] = this.sumCompletionItems(subtotalJsonNode);
	
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
	
	for(const item of document.getElementsByClassName(overviewId)){
		item.innerText = items.toString() + "/" + total.toString();
	}
	
	// and finally, return weighted progress for total progress.
	return (items/total)*weight;
}

/**
 * Recursively sum completion items for all cells in this tree.
 * @param {object} cell tree root
 * @returns {[Number,Number]} an array of [completed items, total items] for this tree.
 */
ProgressCalculator.prototype.sumCompletionItems = function(cell){
	if(cell.cache != null){
		return cell.cache;
	}
	let result = null;
	//can't use runOnTree because we get 2 inner results and we cant add that in 1 step
	if(cell.elements == null){
		result = this.sumCompletionSingleCell(cell);
	}
	else{
		var completed = 0;
		var total = 0;
		for(const element of cell.elements){
			let innerResult = this.sumCompletionItems(element);
			completed += innerResult[0];
			total += innerResult[1];
		}
		if(cell.max != null){
			let max = parseInt(cell.max);
			result = [Math.min(max, completed), Math.min(max,total)];
		}
		else{
			result = [completed,total];
		}
		//we only recalculate the value of intermediate nodes here, so run all their onUpdate() stuff here.
		if(cell.onUpdate != null && cell.onUpdate.length > 0){
			for(const fn of cell.onUpdate){
				fn(cell, completed, total);
			}
			//this whole thing is a class because of THIS FUCKER
			this.hivesToCalculate.push(cell.hive);
		}
	}
	cell.cache = result;
	return result;
}

/**
 * Extract the user's completion of a single cell.
 * @param {Object} cell cell to check completion on
 * @returns {[Number,Number]} an array of [completed items, total items] for this cell.
 */
ProgressCalculator.prototype.sumCompletionSingleCell = function(cell){
	var totalElements;
	var completedElements;
	if(cell?.hive?.name == null){
		console.error("Error summing completion for cell: hive name is null.");
		console.error(cell);
		return [0,0];
	}
	if(cell.ref != null){
		let actualCell = findCell(cell.ref);
		if(actualCell == null){
			console.warn("cell ref points to invalid node "+cell.ref);
			return [0,0];
		}
		let x = this.sumCompletionItems(actualCell);
		completedElements = x[0];
		totalElements = x[1];
	}
	else{
		if(cell == undefined){
			debugger;
		}
		
		if(cell.type == "number"){
			completedElements = savedata[cell.hive.classname][cell.id];
			if(cell.max != null){
				totalElements = cell.max;
			}
			else{
				totalElements = Math.max(1,completedElements);
			}
		}
		else{
			//we're a checkbox
			totalElements = 1;

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
	}
	//do this part for both ref and direct cells.

	let multiplier = 1.0;
	if(cell.scale != null){
		multiplier = parseFloat(cell.scale);
	}

	if(isNaN(completedElements) || isNaN(totalElements) || isNaN(multiplier)){
		debugger;
		return [0,0];
	}

	return [completedElements*multiplier,totalElements*multiplier];	
}


//Topbar percentage update and helper functions END