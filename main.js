"use strict"
//==========================
// Functions that generate the page
//===========================
function init(){
	document.addEventListener("progressLoad",updateUIFromSaveData);
	loadJsonData().then(()=>{
		//populate sections with json data.
		//only display stuff that user can change.
		for(const klass of progressClasses){
			const hive = jsondata[klass.name];
			const section = document.getElementById(klass.name+"section");
			if(section == null){
				console.warn("could not find section for class "+klass.name);
				continue;
			}
			//we start at depth 1 because the page itself already has the depth 0 titles.
			initMultiV2(hive.elements, klass.name, section,1);
		}
		{
			if(false){
				//fame is tracked indirectly.
				let klass = classes.find(x=>x.name == "fame");
				const hive = jsondata[klass.name];
				const section = document.getElementById(klass.name+"section");
				if(section == null){
					console.warn("could not find section for class "+klass.name);
				}
				else{//we start at depth 1 because the page itself already has the depth 0 titles.
					initMultiV2(hive.elements, klass.name, section,1,"amount");
				}
			}
		}
	}).then(()=>{
		if(loadProgressFromCookie() == false){
			resetProgress();
		}
	});
}

const classNamesForLevels = ["section","category","subcategory"]

/**
 * can't use runOnTree because we need to do additional stuff per-list, like subtree name.
 * NOTE: unlike runOnTree, this takes a list of data nodes instead of a single node.
 * @param {object[]} multidata list of data nodes
 * @param {string} classname name of this class/hive
 * @param {Element} parentNode parent html element
 * @param {int} depth depth of this node in the tree.
 * @param {string} extraColumnName name of extra column. undefined if no extra column name.
 */
function initMultiV2(multidata, classname, parentNode, depth, extraColumnName){
	if(multidata == null){
		console.log(parentNode);
		debugger;
	}
	for(const datum of multidata) {
		if(datum.elements == null){
			let maybeElement = parentNode.appendChild(initSingle(datum, classname, extraColumnName));
            if(maybeElement != null){
				parentNode.appendChild(maybeElement);
			}
		}
		else{
			// not a leaf node, so create a subtree, with a title n stuff.
			const subtreeName = datum.name.replaceAll(" ","_");
			const subtreeRoot = document.createElement("div");
			subtreeRoot.classList.add(classNamesForLevels[depth]);
			subtreeRoot.id = parentNode.id + "_" + subtreeName;
			
			const subtreeTitle = document.createElement("div");
			subtreeTitle.classList.add(classNamesForLevels[depth]+"Title");
			subtreeTitle.innerText = datum.name;
			subtreeRoot.appendChild(subtreeTitle);
			
			if(datum.extraColumn != null){
				extraColumnName = datum.extraColumn;
			}
			
			initMultiV2(datum.elements, classname, subtreeRoot, depth+1, extraColumnName);
			parentNode.appendChild(subtreeRoot);
		}
	}
}

/**
 * Creates a function that will be added to the other cell's html that updates this cell's html.
 * @param {*} indirectCell 
 */
function CreateIndirectUpdater(indirectHtml){
	return function(event){
		console.log("indirect update!");
		const checkbox = Array.from(indirectHtml.children).find(x=>x.tagName=="INPUT");
		checkbox.checked = event.target.checked;
		userInputData(indirectHtml.id, checkbox);
	}
}

//ugggg
function initSingleIndirect(cell, classname, extraColumnName){
	let refCell;
	refCell = findOnTree(jsondata["quest"], (x=>x.formId == cell.ref));
	if(refCell == null){
		console.error("Object not found with form id "+cell.ref);
		return null;
	}
	var usableId = refCell.formId;
	
	var rowhtml = document.createElement("div");
	rowhtml.classList.add(classname);
	rowhtml.classList.add("item");
	rowhtml.id = classname+usableId.toString();
	//rowhtml.addEventListener('click',rowClicked);
	
	//name
	var rName = document.createElement("span");
	rName.classList.add(classname+"Name");
	rName.innerText = refCell.name;
	rowhtml.appendChild(rName);
	
	//checkbox
	var rcheck = document.createElement("input")
	if(refCell.type){
		rcheck.type= refCell.type;
		//rcheck.addEventListener('change',checkboxClicked);
		rcheck.size=4;
		if(refCell.max){
			rcheck.max = refCell.max;
		}
	}
	else{
		rcheck.type="checkbox";
		//rcheck.addEventListener('click',checkboxClicked);
	}
	//we need to add an event listener for the other cell.
	let otherCellCheck = document.getElementById("quest"+refCell.id+"check");
	if(otherCellCheck == null){
		console.warn("Could not find checkbox for element "+"quest"+refCell.id+"check");
	}
	else{
		otherCellCheck.addEventListener("change",CreateIndirectUpdater(rowhtml));
	}

	rcheck.classList.add(classname+"Check")
	rcheck.classList.add("check")
	rcheck.id = rowhtml.id+"check"
	rcheck.disabled = true;
	rowhtml.appendChild(rcheck)

	if(extraColumnName && cell[extraColumnName] != null){
		let extraCol = document.createElement("span");
		extraCol.classList.add("detailColumn");
		extraCol.innerText = cell[extraColumnName];
		rowhtml.appendChild(extraCol);
	}
	return rowhtml;
}

//init a single leaf node
//imma call single leaf nodes "cells" because its memorable
function initSingle(cell, classname, extraColumnName){
	//hack for fame
	if(cell.ref != null){
		//this is an indirect class.
		return initSingleIndirect(cell, classname, extraColumnName);
	}
	
	
	//this is here because we may want to switch over to formID.
	var usableId = cell.id;
	
	var rowhtml = document.createElement("div");
	rowhtml.classList.add(classname);
	rowhtml.classList.add("item");
	rowhtml.id = classname+usableId.toString();
	rowhtml.addEventListener('click',rowClicked);
	
	//name
	var rName = document.createElement("span");
	rName.classList.add(classname+"Name");
	var linky = document.createElement("a");
	if(cell.link){
		linky.href = cell.link;
	}
	else{
		linky.href="https://en.uesp.net/wiki/Oblivion:"+cell.name.replaceAll(" ","_");
	}
	linky.innerText = cell.name;
	linky.target = "_blank";
	rName.appendChild(linky);
	rowhtml.appendChild(rName);
	
	//checkbox
	var rcheck = document.createElement("input")
	if(cell.type){
		rcheck.type= cell.type;
		rcheck.addEventListener('change',checkboxClicked);
		rcheck.size=4;
		if(cell.max){
			rcheck.max = cell.max;
		}
	}
	else{
		rcheck.type="checkbox";
		rcheck.addEventListener('click',checkboxClicked);
	}
	rcheck.classList.add(classname+"Check")
	rcheck.classList.add("check")
	rcheck.id = rowhtml.id+"check"
	rowhtml.appendChild(rcheck)
	
	//notes
	if(cell.notes){
		var notesIcon = document.createElement("span");
		notesIcon.title = cell.notes;
		notesIcon.innerText = "⚠"
		rowhtml.appendChild(notesIcon);
	}
	
	if(extraColumnName && cell[extraColumnName] != null){
		let extraCol = document.createElement("span");
		extraCol.classList.add("detailColumn");
		extraCol.innerText = cell[extraColumnName];
		rowhtml.appendChild(extraCol);
	}
	
	return rowhtml;
}


//==========================
// Functions that deal with progress
//===========================

function recalculateProgressAndSave(){
	let percentCompleteSoFar = recalculateProgress();
	//round progress to 2 decimal places
	progress = Math.round((percentCompleteSoFar * 100)*100)/100;
	Array.of(...document.getElementsByClassName("totalProgressPercent")).forEach(element => {
		element.innerHTML = progress.toString();
		if(element.parentElement.className == "topbarSection"){
			element.parentElement.style = `background: linear-gradient(to right, green ${progress.toString()}%, red ${progress.toString()}%);`;
		}
	});
	saveProgressToCookie();
}

function updateCellFromSaveData(cell, classname){
	const checkbox = document.getElementById(classname+cell.id+"check");
	if(checkbox == null){
		console.warn("unable to find input for modifiable cell '"+classname+cell.id+"'");
		return;
	}
	var savedValue = savedata[classname][cell.id];
	if(cell.type == "number"){
		checkbox.value = savedValue;
	}
	else{
		checkbox.checked = savedValue;
		setParentChecked(checkbox);
	}
}

function updateUIFromSaveData(){
	for(const klass of progressClasses){
		const hive = jsondata[klass.name];
		runOnTree(hive, (x=>updateCellFromSaveData(x,klass.name)));
	}
	
	recalculateProgressAndSave();
}

function setParentChecked(checkbox){
	if(checkbox.checked){
		checkbox.parentElement.classList.add("checked");
	}
	else{
		checkbox.parentElement.classList.remove("checked");
	}
}

function userInputData(htmlRowId, checkboxElement){
	var found=false;
	//extract what it is from the parent id so we can update progress
	for(const klass of progressClasses) {
		if(htmlRowId.startsWith(klass.name)){
			let rowid = null;
			if(klass.standard){
				//guaranteed to be an int so we parse
				rowid = parseInt(htmlRowId.substring(klass.name.length));
			}
			else{
				rowid = htmlRowId.substring(klass.name.length);
			}
		
			if(checkboxElement.type == "checkbox"){
				savedata[klass.name][rowid] = checkboxElement.checked;
				setParentChecked(checkboxElement);
			}
			else{
				savedata[klass.name][rowid] = checkboxElement.valueAsNumber;
			}
			found=true;
			break;
		}
	}
	
	recalculateProgressAndSave();
}

function checkboxClicked(event){
	const parentid = event.target.parentElement.id;
	userInputData(parentid, event.target);
	event.stopPropagation();
}

// when user clicks on the row, not the checkbox
function rowClicked(event){
	const checkbox = Array.from(event.target.children).find(x=>x.tagName=="INPUT");
	if(checkbox.type == "number"){
		checkbox.focus();
		checkbox.select();
	}
	else{
		checkbox.checked = !checkbox.checked;
		userInputData(event.target.id, checkbox);
	}
	//for change listeners
	checkbox.dispatchEvent(new Event('change'));
}
