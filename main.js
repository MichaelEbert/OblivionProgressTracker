"use strict"
//==========================
// Functions that generate the page
//===========================
function init(){
	document.addEventListener("progressLoad",updateUIFromSaveData);
	obliviondata.loadJsonData().then(()=>{
		userdata.loadSettingsFromCookie();
		//populate sections with json data.
		//only display stuff that user can change.
		const base = document.getElementById("main");
		console.log("should be loaded now!!");
		for(const klass of obliviondata.progressClasses){
			const hive = obliviondata.jsondata[klass.name];
			initMulti(hive, base,0);
		}
		//BAD HACK for chrome (and other standards compliant browsers lol)
		//Firefox ignores break-inside: avoid if the column is too long.
		document.getElementById("main_nirnroot").children[0].style = "break-inside:unset";
		document.getElementById("main_misc_Closed_Oblivion_Gates_40_Random_Gates").children[0].style = "break-inside:unset";
	}).then(()=>{
		if(userdata.loadProgressFromCookie() == false){
			userdata.resetProgress();
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
			if(settings.spectateAutoRefresh == true){
				startSpectating(false, true);
			}
		}
	});
}
const classNamesForLevels = ["section","category","subcategory"];
const MAX_DEPTH = classNamesForLevels.length-1;

function createLeafContainer(){
	let leafContainer = document.createElement("DIV");
	leafContainer.classList.add("itemContainer");
	return leafContainer;
}

function initMulti(root, parentElement, depth, extraColumnName){
	let leafContainerPtr = {value:null};
	initMultiInternal(root, parentElement, depth, extraColumnName, leafContainerPtr);
	if(leafContainerPtr.value != null){
		debugger;
		console.warning("something failed during init. orphan leaf container left over.");
	}
}
/**
 * can't use runOnTree because we need to do additional stuff per-list, like subtree name.
 * @param {object} root root node
 * @param {Element} parentElement parent html element
 * @param {number} depth depth of this node in the tree.
 * @param {string} extraColumnName name of extra column. undefined if no extra column name.
 */
function initMultiInternal(root, parentElement, depth, extraColumnName, leafContainerPtr){
	if(root == null){
		console.log(parentElement);
		debugger;
	}
	
	if(root.elements == null){
		//this is a leaf node. so we just have to init this single thing.
		let maybeElement = common.initSingleCell(root, extraColumnName, common.CELL_FORMAT_CHECKLIST);
		if(maybeElement != null){
			if(leafContainerPtr.value == null){
				leafContainerPtr.value = createLeafContainer();
			}
			leafContainerPtr.value.appendChild(maybeElement);
		}
	}
	else{
		if(root.classname == null && root.name == null){
			//skip this level.
			for(const datum of root.elements) {
				initMultiInternal(datum, parentElement, depth, extraColumnName, leafContainerPtr);
			}
		}
		else{
			// not a leaf node, so create a subtree, with a title n stuff.
			//We're starting a new subtree, so append the parent's leaves to it, if necessary.
			if(leafContainerPtr.value != null){
				parentElement.appendChild(leafContainerPtr.value);
				leafContainerPtr.value = null;
			}
			leafContainerPtr.value = createLeafContainer();
			let subtreeName;
			//use classname for root elements so we don't end up with "stores_invested_in" as a part of links
			if(root.classname != null){
				subtreeName = root.classname.replaceAll(" ","_");
			}
			else if (root.name != null){
				subtreeName = root.name.replaceAll(" ", "_");
			}
			else{
				//no name for intermediate cell. Skip in heirarchy.
				debugger;
			}
			const subtreeRoot = document.createElement("div");
			subtreeRoot.classList.add(classNamesForLevels[Math.min(MAX_DEPTH, depth)]);
			subtreeRoot.id = parentElement.id + "_" + subtreeName;
			
			const subtreeTitle = document.createElement("div");
			subtreeTitle.classList.add(classNamesForLevels[Math.min(MAX_DEPTH, depth)]+"Title");
			subtreeTitle.innerText = root.name;
			if(root.notes != null){
				const subtreeNotes = document.createElement("SPAN");
				subtreeNotes.title = root.notes;
				//there's an extra space here, only for titles, because it looks better.
				subtreeNotes.innerText = " ⚠";
				subtreeTitle.appendChild(subtreeNotes);
			}
			leafContainerPtr.value.appendChild(subtreeTitle);
			
			//if we need to change the extra column name, do that before initializing child elements.
			if(root.extraColumn != null){
				extraColumnName = root.extraColumn;
			}

			//fill out this element with the child elements
			for(const datum of root.elements) {
				initMultiInternal(datum, subtreeRoot, depth+1, extraColumnName, leafContainerPtr);
			}

			//if we had any leaf nodes, append their container to this element before we finish.
			if(leafContainerPtr.value != null){
				subtreeRoot.appendChild(leafContainerPtr.value);
				leafContainerPtr.value = null;
			}
				//finally, append the fully created element to parent.
			parentElement.appendChild(subtreeRoot);
		}
	}
}

//==========================
// Functions that deal with progress
//===========================

/**
 * Recalculate the total progress, and update UI elements.
 */
function recalculateProgressAndUpdateProgressUI(){
	let percentCompleteSoFar = window.progress.recalculateProgress();
	//round progress to 2 decimal places
	let progress = Math.round((percentCompleteSoFar * 100)*100)/100;
	Array.of(...document.getElementsByClassName("totalProgressPercent")).forEach(element => {
		element.innerText = progress.toString();
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
	let usableId = cell.formId;
	if(usableId == null){
		usableId = cell.id;
	}
	let checkbox = document.getElementById(classname+usableId+"check");
	if(checkbox == null){
		if(usableId != null && window.debug){
			//user doesn't really need to know if this happens; it is expected for elements that don't draw.
			console.warn("unable to find checkbox element for modifiable cell '"+classname+usableId+"' (id "+cell.id+")");
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
			progress.updateChecklistProgress(null, newval, null, cell, true);
		}
	}
}

/**
 * When savedata is loaded, we need to bulk change all of the HTML to match the savedata state.
 * This function does that.
 */
function updateUIFromSaveData(){
	for(const klass of obliviondata.progressClasses){
		const hive = obliviondata.jsondata[klass.name];
		obliviondata.runOnTree(hive, updateHtmlElementFromSaveData);
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
	for(const klass of obliviondata.progressClasses) {
		if(htmlRowId.startsWith(klass.name)){
			let rowid = htmlRowId.substring(klass.name.length);
			progress.updateChecklistProgressFromInputElement(rowid, checkboxElement, klass.name);
			break;
		}
	}
	
	recalculateProgressAndUpdateProgressUI();
	window.userdata.saveProgressToCookie();
	if(settings.autoUploadCheck){
		window.sharing.uploadCurrentSave();
	}
}

function checkboxClicked(event){
	const parentid = this.parentElement.id;
	userInputData(parentid, this);
	//so that it doesn't trigger rowClicked()
	event.stopPropagation();
}

// when user clicks on the row, not the checkbox
function rowClicked(event){
	if(event.target.nodeName == "A"){
		//if user clicks link, don't treat that as checking off the element.
		return;
	}
	const checkbox = Array.from(this.children).find(x=>x.tagName=="INPUT");
	if(checkbox.type == "number"){
		checkbox.focus();
		checkbox.select();
	}
	else{
		checkbox.checked = !checkbox.checked;
		userInputData(this.id, checkbox);
	}
}
