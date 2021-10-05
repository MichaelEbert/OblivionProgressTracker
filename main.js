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
			
			if(hive.version >= 2){
				const section = document.getElementById(klass.name+"section");
				if(section == null){
					console.warn("could not find section for class "+klass.name);
					continue;
				}
				//we start at depth 1 because the page itself already has the depth 0 titles.
				initMultiV2(hive.elements, klass.name, section,1);
			}
			else{
				if(klass.name == "skill"){
					initMulti(hive.elements,klass.name, "specialization");
				}
				else{
					console.error("Init failed for "+klass.name+": version is "+hive.version);
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

//can't use runOnTree because we need to do additional stuff per-list, like subtree name.
function initMultiV2(multidata, classname, parentNode, depth){
	if(multidata == null){
		console.log(parentNode);
		debugger;
	}
	for(const datum of multidata) {
		//only leaf nodes have IDs
		if(datum.id != null || datum.formId != null){
			parentNode.appendChild(initSingle(datum, classname));
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
			
			initMultiV2(datum.elements, classname, subtreeRoot, depth+1);
			parentNode.appendChild(subtreeRoot);
		}
	}
}

//init a non-leaf element
function initMulti(multidata, classname, categoryName){
	var section = document.getElementById(classname+"section");
	// it MIGHT be better to just stick all the books in a sortable table.
	var currentCategory = "";
	//categoryHtml is a container so we can minimize 1 category at a time
	var categoryHtml;
	for (const datum of multidata){
		var bhtml = initSingle(datum,classname);
		if(datum[categoryName] != currentCategory){
			currentCategory = datum[categoryName];
			
			categoryHtml = document.createElement("div");
			categoryHtml.classList.add("category");
			categoryHtml.id = classname+currentCategory.replaceAll(" ","_");
			section.appendChild(categoryHtml);
			
			var categoryTitle = document.createElement("div");
			categoryTitle.classList.add("categoryTitle");
			categoryTitle.innerText = currentCategory;
			categoryHtml.appendChild(categoryTitle);
		}
		categoryHtml.appendChild(bhtml);
	}
}

//init a single leaf node
//imma call single leaf nodes "cells" because its memorable
function initSingle(cell, classname){
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
	
	return rowhtml;
}


//==========================
// Functions that deal with progress
//===========================

//returns [completed items,total items] for a single cell in the json.
function sumCompletionSingleCell(cell,classname){
	var totalElements;
	var completedElements;
	if(cell.type == "number"){
		completedElements = savedata[classname][cell.id];
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
		if(savedata[classname][cell.id]){
			completedElements = 1;
		}
		else{
			completedElements = 0;
		}
	}
	return [completedElements,totalElements];	
}

//get the sum of completed items and total items under this element in the json.
//can't use runOnTree because we get 2 inner results and we cant add taht in 1 step
function sumCompletionItems(jsonNode,classname){
	if(jsonNode.id != null){
		return sumCompletionSingleCell(jsonNode,classname);
	}
	else{
		var completed = 0;
		var total = 0;
		for(const element of jsonNode.elements){
			let innerResult = sumCompletionItems(element,classname);
			completed += innerResult[0];
			total += innerResult[1];
		}
		return [completed,total];
	}
}

// given a json node with a weight, sums the completion of all items
// under that node.
// additionally, updates subtotal HTML elements if it can find them.
function getSubtotalCompletion(subtotalJsonNode,classname){
	const weight = subtotalJsonNode.weight;
	const [items,total] = sumCompletionItems(subtotalJsonNode,classname);
	
	//try to find subtotals
	//this may fail if we have multiple score nodes from different hives wiht the same name.
	const overviewId = "overview_"+subtotalJsonNode.name.replaceAll(" ","_").toLowerCase();
	const maybeItem = document.getElementById(overviewId);
	if(maybeItem){
		//add this to correct subtotal slot
		maybeItem.innerText = items.toString() + "/" + total.toString();
	}
	
	// and finally, return weighted progress for total progress.
	return (items/total)*weight;
}

function recalculateProgressAndSave(){
	//we could probably cache the hives that aren't modified
	var percentCompleteSoFar = 0.0;
	for(const klass of progressClasses) {
		const hive = jsondata[klass.name];
		if(hive?.version >= 2){
			percentCompleteSoFar += runOnTree(hive, node=>getSubtotalCompletion(node,klass.name), 0, node=>node.weight != null);
		}
		else{
			let classtotal = 0;
			let classchecked = 0;
			for (const id in savedata[klass.name]){
				if(savedata[klass.name][id] == true){
					classchecked += 1;
				}
				classtotal +=1;
			}
			
			//update overview and totals
			document.getElementById("overview_"+klass.name).innerText = classchecked.toString() + "/" + classtotal.toString();
			percentCompleteSoFar += (classchecked/classtotal) * (klass.weight);
		}
	}
	
	//we can turn percentCompleteSoFar into an actual percent here, instead of dividing by total in each segment, since
	// (a / total + b/total + c/total + ...) == (a+b+c+..)/total
	percentCompleteSoFar = percentCompleteSoFar / totalweight;
	
	//round progress to 2 decimal places
	var progress = Math.round((percentCompleteSoFar * 100)*100)/100;
	document.querySelectorAll('[id=totalProgressPercent]').forEach(element => {element.innerHTML = progress.toString();});
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
}
