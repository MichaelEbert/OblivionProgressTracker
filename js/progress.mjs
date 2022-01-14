"use strict"
//progress percentage stuff

export{
	updateChecklistProgressFromInputElement,
	updateChecklistProgress,
	recalculateProgress,
	sumCompletionItems,
}

import {saveProgressToCookie} from './userdata.mjs';

//=========================
//Progress percentage updates and helper functions
//=========================

/**
 * Update save progress for the specified element.
 * @param {*} formId formid of the cell to update save data for.
 * @param {Element} inputElement HTML input element with the new value 
 * @param {*} classHint optional. classname of hive to search for this cell in.
 * @param {*} cellHint optional. the cell to update save data for.
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

/**
 * Update save progress for the specified cell.
 * @param {*} formId formid of the cell to update save data for.
 * @param {*} value new value
 * @param {*} classHint optional. classname of hive to search for this cell in.
 * @param {*} cellHint optional. the cell to update save data for.
 */
function updateChecklistProgress(formId, newValue, classHint = null, cellHint = null, force = false){
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
			case "undefined":
			default:
				debugger;
				console.error("unexpected input type "+typeof(newValue)+" for cell "+cell.name);
				return;
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
				valueAsCorrectType = false;
				break;
			default:
				debugger;
				console.error("unexpected input type "+typeof(newValue)+" for cell "+cell.name);
				return;
		}
	}

	if(cell.id == null){
		//we don't need to save this
		if(cell.onUpdate != null && cell.onUpdate.length != 0 ){
			for(const fn of cell.onUpdate){
				fn(cell, valueAsCorrectType);
			}
		}
		saveProgressToCookie();
		return true;
	}
	else{
		//now we get the save data for this.
		let oldval = savedata[cell.hive.classname][cell.id];
		if(!force && valueAsCorrectType == oldval){
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
			saveProgressToCookie();
			return true;
		}
	}
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
	
	//we can turn percentCompleteSoFar into an act11l percent here, instead of dividing by total in each segment, since
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
		if(jsonNode.max != null){
			let max = parseInt(jsonNode.max);
			return [Math.min(max, completed), Math.min(max,total)];
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
	let cellToUse = cell;
	if(cell.ref != null){
		cellToUse = findCell(cell.ref);
	}
	
	if(cellToUse.type == "number"){
		completedElements = savedata[cellToUse.hive.classname][cellToUse.id];
		if(cellToUse.max != null){
			totalElements = cellToUse.max;
		}
		else{
			totalElements = Math.max(1,completedElements);
		}
	}
	else{
		//we're a checkbox
		totalElements = 1;

		if(savedata[cellToUse.hive.classname][cellToUse.id]){
			completedElements = 1;
		}
		else{
			completedElements = 0;
		}

		if(cellToUse.max != null){
			totalElements *= parseFloat(cellToUse.max);
			completedElements *= parseFloat(cellToUse.max);
		}
	}
	if(completedElements == undefined || totalElements == undefined){
		console.error("element completion is undefined. Skipping.");
		console.error(cell);
		return [0,0];
	}

	let multiplier = 1.0;
	if(cell.ref != null && cell.max != null){
		multiplier = cell.max / totalElements;
	}

	if(isNaN(completedElements) || isNaN(totalElements) || isNaN(multiplier)){
		debugger;
		return [0,0];
	}

	return [completedElements*multiplier,totalElements*multiplier];	
}


//Topbar percentage update and helper functions END