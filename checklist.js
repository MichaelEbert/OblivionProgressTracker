"use strict"
//==========================
// Functions that generate the page
//===========================
function init(){
	document.addEventListener("progressLoad",progress.updateProgressBar)
	obliviondata.loadJsonData().then(()=>{
		userdata.loadSettingsFromCookie();
		//populate sections with json data.
		//only display stuff that user can change.
		const base = document.getElementById("main");
		for(const klass of obliviondata.progressClasses){
			const hive = obliviondata.jsondata[klass.name];
			initMulti(hive, base,0);
		}
		//BAD HACK to get these specific columns to wrap
		try{
			document.getElementById("main_nirnroot_Outdoor_Circuit").children[0].style = "break-inside:unset";
			document.getElementById("main_misc_Oblivion_Gates_Shut_40_Random_Gates").children[0].style = "break-inside:unset";
			document.getElementById("main_save").children[0].style = "break-inside:unset";
		}
		catch{
			debugger;
		}
	}).then(()=>{
		if(userdata.loadProgressFromCookie() == false){
			userdata.resetProgress();
		}

		sharing.initSharingFeature();

		const ignoreEvent = (e) => {
			e.preventDefault();
			e.stopPropagation();
		};
		// Handle drag+drop of files. Have to ignore dragenter/dragover for compatibility reasons.
		document.body.addEventListener('dragenter', ignoreEvent);
		document.body.addEventListener('dragover', ignoreEvent);
		document.body.addEventListener('drop', saveReader.parseSave);
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
	let hydrate = true;
	if(debug?.disable_hydration){
		hydrate = false;
	}
	initMultiInternal(root, parentElement, depth, extraColumnName, leafContainerPtr, hydrate);
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
function initMultiInternal(root, parentElement, depth, extraColumnName, leafContainerPtr, hydrate){
	if(root == null){
		console.log(parentElement);
		debugger;
	}
	
	if(root.elements == null){
		//this is a leaf node. so we just have to init this single thing.
		let maybeElement = common.initSingleCell(root, extraColumnName, common.CELL_FORMAT_CHECKLIST, null, hydrate);
		if(!hydrate){
			if(maybeElement != null){
				if(leafContainerPtr.value == null){
					leafContainerPtr.value = createLeafContainer();
				}
				leafContainerPtr.value.appendChild(maybeElement);
			}
		}
	}
	else{
		if(root.classname == null && root.name == null){
			//skip this level.
			for(const datum of root.elements) {
				initMultiInternal(datum, parentElement, depth, extraColumnName, leafContainerPtr, hydrate);
			}
		}
		else{
			let subtreeRoot = null;
			if(!hydrate){
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
				subtreeName = subtreeName.replaceAll(".","");
				subtreeRoot = document.createElement("div");
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
			}
			//fill out this element with the child elements
			for(const datum of root.elements) {
				initMultiInternal(datum, subtreeRoot, depth+1, extraColumnName, leafContainerPtr, hydrate);
			}

			if(!hydrate){
				//if we had any leaf nodes, append their container to this element before we finish.
				if(leafContainerPtr.value != null){
					subtreeRoot.appendChild(leafContainerPtr.value);
					leafContainerPtr.value = null;
				}
				//finally, append the fully created element to parent.
				
				//first, check for existing element. this may be the case if we are on a page meant for hydration.
				let maybeExisting = document.getElementById(subtreeRoot.id);
				if(maybeExisting != null){
					maybeExisting.remove();
					if(debug.disable_hydration){
						console.log("removing existing element with id "+subtreeRoot.id);
					}
				}
				parentElement.appendChild(subtreeRoot);
			}
		}
	}
}

//==========================
// Functions that deal with progress
//===========================

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
	
	progress.updateProgressBar();
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
