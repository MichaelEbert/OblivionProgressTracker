"use strict"
//==========================
// Functions that generate the page
//===========================
function init(){
	document.addEventListener("progressLoad",updateUIFromSaveData);
	loadJsonData().then(()=>{
		//populate sections with json data.
		//only display stuff that user can change.
		const base = document.getElementById("main");
		for(const klass of progressClasses){
			const hive = jsondata[klass.name];
			initMultiV2(hive, base,0);
		}
	}).then(()=>{
		if(loadProgressFromCookie() == false){
			resetProgress();
		}
		if(settings.remoteShareCode){
			if(!document.getElementById("spectateBanner")){
				let spectateBanner = document.createElement("SPAN");
				spectateBanner.innerText = "Spectating ⟳";
				spectateBanner.id = "spectateBanner";
				spectateBanner.style.backgroundColor = "#90FF90";
				spectateBanner.title = "last updated "+settings.shareDownloadTime+". Click to refresh."
				spectateBanner.addEventListener("click", function(){
					spectateBanner.innerText = "Reloading...";
					startSpectating(false, true).then(()=>{
						spectateBanner.innerText = "Spectating ⟳";
						spectateBanner.title = "last updated "+settings.shareDownloadTime+". Click to refresh.";
					});
				})
				document.getElementById("topbar").appendChild(spectateBanner);
	
			}
		}
	});
}
const classNamesForLevels = ["section","category","subcategory"]

/**
 * can't use runOnTree because we need to do additional stuff per-list, like subtree name.
 * @param {object} root root node
 * @param {Element} parentElement parent html element
 * @param {int} depth depth of this node in the tree.
 * @param {string} extraColumnName name of extra column. undefined if no extra column name.
 */
function initMultiV2(root, parentElement, depth, extraColumnName){
	if(root == null){
		console.log(parentElement);
		debugger;
	}

	if(root.elements == null){
		//this is a leaf node. so we just have to init this single thing.
		let maybeElement = initSingle(root, root.hive.classname, extraColumnName);
		if(maybeElement != null){
			parentElement.appendChild(maybeElement);
		}
	}
	else{
		// not a leaf node, so create a subtree, with a title n stuff.
		let subtreeName;
		//use classname for root elements so we don't end up with "stores_invested_in" as a part of links
		if(root.classname != null){
			subtreeName = root.classname.replaceAll(" ","_");
		}
		else{
			subtreeName = root.name.replaceAll(" ", "_");
		}
		const subtreeRoot = document.createElement("div");
		subtreeRoot.classList.add(classNamesForLevels[depth]);
		subtreeRoot.id = parentElement.id + "_" + subtreeName;
		
		const subtreeTitle = document.createElement("div");
		subtreeTitle.classList.add(classNamesForLevels[depth]+"Title");
		subtreeTitle.innerText = root.name;
		subtreeRoot.appendChild(subtreeTitle);
		
		//if we need to change the extra column name, do that before initializing child elements.
		if(root.extraColumn != null){
			extraColumnName = root.extraColumn;
		}
		
		//fill out this element with the child elements
		for(const datum of root.elements) {
			initMultiV2(datum, subtreeRoot, depth+1, extraColumnName);
		}

		//finally, append the fully created element to parent.
		parentElement.appendChild(subtreeRoot);
	}
}

/**
 * Creates a function that will be added to the other cell's html that updates this cell's html.
 * @param {*} indirectCell 
 */
function createIndirectUpdater(indirectHtml, indirectCell){
	return function(refCell, newValue){
		console.log("indirect update!");
		const myInputHtml = Array.from(indirectHtml.children).find(x=>x.tagName=="INPUT");
		updateChecklistProgress(null, newValue, null, indirectCell);
	}
}

//init a single leaf node
//imma call single leaf nodes "cells" because its memorable
function initSingle(cell, classname, extraColumnName){
	//hack for fame
	if(cell.ref != null){
		//this is an indirect class.
		let refCell;
		refCell = findCell(cell.ref);
		if(refCell == null){
			console.error("Object not found with form id "+cell.ref);
			return null;
		}
	
	
		var usableId = refCell.formId;
		
		var rowhtml = document.createElement("div");
		rowhtml.classList.add(classname);
		rowhtml.classList.add("item");
		rowhtml.id = classname+usableId.toString();
		//indirect elements are disabled and you can't click them.
		//rowhtml.addEventListener('click',rowClicked);
		
		//name
		var rName = document.createElement("span");
		rName.classList.add(classname+"Name");
		if(cell.name != null){
			rName.innerText = cell.name;
		}
		else{
			rName.innerText = refCell.name;
		}
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
	
		rcheck.classList.add(classname+"Check")
		rcheck.classList.add("check")
		rcheck.id = rowhtml.id+"check"
		rcheck.disabled = true;
		rowhtml.appendChild(rcheck);

		//add indirect updater to referenced cell
		refCell.onUpdate.push(createIndirectUpdater(rowhtml, cell));

	}
	else{
		
		var usableId = cell.formId;
		if(usableId == null){
			console.log("no formid for "+cell.name);
			return;
		}
		
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


		//UNIQUE
		//notes
		if(cell.notes){
			var notesIcon = document.createElement("span");
			notesIcon.title = cell.notes;
			notesIcon.innerText = "⚠"
			rowhtml.appendChild(notesIcon);
		}
	}
	
	//COMMON
	if(extraColumnName && cell[extraColumnName] != null){
		let extraCol = document.createElement("span");
		extraCol.classList.add("detailColumn");
		extraCol.innerText = cell[extraColumnName];
		rowhtml.appendChild(extraCol);
	}
	
	//COMMON
	//update the UI on progress update
	cell.onUpdate.push(function(cell, newValue){
		if(cell.type == "number"){
			rcheck.value = newValue;
		}
		else{
			rcheck.checked = newValue;
			setParentChecked(rcheck);
		}
	});

	return rowhtml;
}


//==========================
// Functions that deal with progress
//===========================

/**
 * Recalculate the total progress, and update UI elements.
 */
function recalculateProgressAndUpdateProgressUI(){
	let percentCompleteSoFar = recalculateProgress();
	//round progress to 2 decimal places
	progress = Math.round((percentCompleteSoFar * 100)*100)/100;
	Array.of(...document.getElementsByClassName("totalProgressPercent")).forEach(element => {
		element.innerHTML = progress.toString();
		if(element.parentElement.className == "topbarSection"){
			element.parentElement.style = `background: linear-gradient(to right, green ${progress.toString()}%, red ${progress.toString()}%);`;
		}
	});
}

/**
 * helper function for updateUIFromSaveData
 * @param {} cell 
 */
function updateHtmlElementFromSaveData(cell){
	const classname = cell.hive.classname
	const checkbox = document.getElementById(classname+cell.formId+"check");
	if(checkbox == null){
		if(window.debug){
			//user doesn't really need to know if this happens; it is expected for elements that don't draw.
			console.warn("unable to find checkbox element for modifiable cell '"+classname+cell.formId+"' (id "+cell.id+")");
		}
		return;
	}
	let newval = null;
	if(cell.ref == null){
		//we call updateChecklistProgress so indirect elements will update from this
		if(cell.id != null){
			if(savedata[classname] == null){
				debugger;
			}
			newval = savedata[classname][cell.id];
			updateChecklistProgress(null, newval, null, cell, true);
		}
	}
}

/**
 * When savedata is loaded, we need to bulk change all of the HTML to match the savedata state.
 * This function does that.
 */
function updateUIFromSaveData(){
	for(const klass of progressClasses){
		const hive = jsondata[klass.name];
		runOnTree(hive, updateHtmlElementFromSaveData);
	}

	recalculateProgressAndUpdateProgressUI();
}

function setParentChecked(checkbox){
	if(checkbox.checked){
		checkbox.parentElement.classList.add("checked");
	}
	else{
		checkbox.parentElement.classList.remove("checked");
	}
}

/**
 * called when user inputs data
 * @param {string} htmlRowId 
 * @param {Element} checkboxElement 
 */
function userInputData(htmlRowId, checkboxElement){
	//extract what it is from the parent id so we can update progress
	for(const klass of progressClasses) {
		if(htmlRowId.startsWith(klass.name)){
			let rowid = htmlRowId.substring(klass.name.length);
			updateChecklistProgressFromInputElement(rowid, checkboxElement, klass.name);
			break;
		}
	}
	
	recalculateProgressAndUpdateProgressUI();
	saveProgressToCookie();
	if(settings.autoUploadCheck){
		uploadCurrentSave();
	}
}

function checkboxClicked(event){
	const parentid = event.target.parentElement.id;
	userInputData(parentid, event.target);
	//so that it doesn't trigger rowClicked()
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
}
