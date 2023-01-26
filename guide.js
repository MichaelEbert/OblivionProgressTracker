"use strict"

var linkedElements = [];

function LinkedElement(element, classname, id){
	this.htmlElement = element;
	this.classname = classname;
	this.id = id;
}

function init(){
	loadSettingsFromCookie();
	//initialize sidebar container, which we will hide situationally but only need to build once.
	let sidebarPanel = document.getElementById("sidebar");
	let sidebarContent = document.getElementById("sidebarContent");
	if(sidebarPanel != null && sidebarContent != null) { //if there is a sidebarPanel and sidebarContent to populate.
		//Build an iframeContainer to add inside of the sidebarContent
		sidebarPanel.style.display = ""; //make the sidebar visible if it isn't already.
		let iframeContainer = document.createElement("div");
		iframeContainer.classList.add("iframeContainer");
		iframeContainer.id = "iframeContainer";

		var myframe = document.createElement("iframe");
		myframe.name="myframe";
		myframe.id="myframe";
		myframe.classList.add("iframe");
		myframe.src="help.html";
		
		//Place the myframe in the iframeContainer, then place the whole payload into the sidebarContent
		iframeContainer.appendChild(myframe);
		sidebarContent.appendChild(iframeContainer);
		//Run an update to the page now that things are initialized.
		checkIframeSize(); 
	}
	
	window.addEventListener("resize",onWindowResize);
	loadJsonData().then(()=>{
		loadProgressFromCookie();
		sharing.initSharingFeature();
		replaceElements();
	});
}

/**
 * Initial function to replace checkboxes n stuff.
 * 
 * Note: We could search all trees for a match, so if the user got the classname wrong, it'll still work, but
 * I think we'll leave that as an error. Programatically it doesn't matter, but it is simpler and it will
 * helps when you're looking in the html.
 */
function replaceElements(){
	//TODO: incorporate NPC elements in to this general method.
	for(const klass of classes){
		let replaceableParts = Array.of(...document.getElementsByClassName(klass.name));
		for(const element of replaceableParts){
			//step 1: get the target element data.
			var found = false;
			var cell = null;
			var elementid = null;
			const checklistid = element.getAttribute("clid");

			//check in the following order: formid, sequentialid, innerText as name
			if(checklistid?.startsWith("0x")){
				let maybeJson = findCell(checklistid, klass.name);
				if(maybeJson != null){
					elementid = maybeJson.id;
					cell = maybeJson;
					found=true;
				}
			}

			if(!found && checklistid?.startsWith(klass.name)){
				elementid = checklistid.substring(klass.name.length);
				cell = findOnTree(jsondata[klass.name],(x=>x.id == elementid));
				if(cell){found=true;}
			}

			if(!found){
				//element didn't have a formid. search by name.
				//maybe we can look up by name
				let elementType = element?.classList[0];
				if(elementType != null){
					let elementName = element.innerText;

					//sanitize name if possible
					let firstBracketPos = elementName.indexOf("[");
					if(firstBracketPos != -1){
						elementName = elementName.substring(0,firstBracketPos);
					}
					elementName = elementName.trim();

					var maybeCell = findOnTree(jsondata[elementType], x=>x.name?.toLowerCase() == elementName.toLowerCase());
					if(maybeCell != null && (maybeCell.id != null || maybeCell.formId != null)){
						elementid = maybeCell.id;
						cell = maybeCell;
						found = true;
					}

					//for NPC, we don't have all teh data.
					//but we can fake it.
					if(!found && klass.name == "npc"){
						cell = {name:elementName, hive:jsondata.npc};
						found = true;
					}
				}
			}
	
			if(found){
				//step 2: create the internal stuff.
				const elementclass = cell.hive.classname;
				let format = CELL_FORMAT_GUIDE;
				if(element.getAttribute("disabled") == "true"){
					format |= CELL_FORMAT_DISABLE_CHECKBOX;
				}

				if(settings.classnameCheck){
					format |= CELL_FORMAT_NAMELINK_SHOW_CLASSNAME;
				}
				if(elementclass == "npc"){
					format |= CELL_FORMAT_SKIP_ID;
					format &= ~CELL_FORMAT_SHOW_CHECKBOX;
				}

				let customText = element.innerText;
				if(customText.length == 0){
					customText = null;
				}
				let newElement = initSingleCell(cell, null, format, customText);
				element.replaceWith(newElement);
				//step 3: load current data from cookies
				if(newElement == null || elementclass == null){
					debugger;
				}
			}
			else{
				//element not found. skip this iteration and move to the next one.
				element.classList.add("replaceableError");
				let classStuff = {
					clid: checklistid,
					identifiedClass: element?.classList[0],
					contents: element?.innerText,
					context:element.parentElement.innerText
				}
				if(window.debug){
					console.warn("replaceable element not found in reference: ");
					console.warn(classStuff);
				}
			}
		}
	}
	updateUIFromSaveData();
}


/**
 * given a \<span class="npc"\>, attempt to get NPC data.
 * @param {HTMLElement} npcElement 
 */
function getNpcData(npcElement){
	var maybeFormId = npcElement.getAttribute("clid");
	if(maybeFormId != null && maybeFormId != "undefined"){
		var maybeNpcData = jsondata.npc?.elements.find(npc=>npc.formId == maybeFormId);
		if(maybeNpcData != null){
			return maybeNpcData;
		}
		else{
			//npc data not found for this formid
			console.error("npc data not found for formId "+maybeFormId);
			return null;
		}
	}
	
	//element didn't have a formid. search by name.
	//maybe we can look up by name
	var npcName = npcElement.children[0].innerText;
	var maybeNpcData = jsondata.npc?.elements.find(npc=>npc.name.toLowerCase() == npcName.toLowerCase())
	if(maybeNpcData != null){
		return maybeNpcData;
	}

	//npc data not found by name. could just be missing from our constants data, so provide name for auto-uesp.
	return {name:npcName};
}

/**
 * Recalculate the total progress, and update UI elements.
 */
function recalculateProgressAndUpdateProgressUI(){
	let percentCompleteSoFar;
	
	try{
		percentCompleteSoFar = window.progress.recalculateProgress();
	} catch{
		console.log("percentComplete got from localStorage");
		percentCompleteSoFar = localStorage.getItem("percentageDone");
	}
	
	// //round progress to 2 decimal places
	// let progress = (percentCompleteSoFar * 100).toFixed(2);
	// Array.of(...document.getElementsByClassName("totalProgressPercent")).forEach(element => {
	// 	element.innerText = progress.toString();
	// 	if(element.parentElement.className == "topbarSection"){
	// 		element.parentElement.style = `background: linear-gradient(to right, green ${progress.toString()}%, red ${progress.toString()}%);`;
	// 	}
	// });
}

/**
 * helper function for updateUIFromSaveData. Does not call recalculateProgress().
 * @param {} cell 
 */
function updateHtmlElementFromSaveData(cell){
	const classname = cell.hive.classname
	let usableId = cell.formId;
	if(usableId == null){
		usableId = cell.id;
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
			//don't call recalculateProgress() because we do that in bulk in the calling function.
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

function checkboxClicked(event){
	const rowHtml = event.target.parentElement;

	var parentid = rowHtml.getAttribute("clid");
	var classname = rowHtml.classList[0];
	updateChecklistProgressFromInputElement(parentid, event.target, classname);
	event.stopPropagation();
	// we need to update because there might be multiple instances of the same book on this page, and we want to check them all.
	recalculateProgressAndUpdateProgressUI();
}

function rowClicked(event){
	if(event.target.nodeName == "A"){
		//if user clicks link, don't treat that as checking off the element.
		return;
	}
	const checkbox = Array.from(this.children).find(x=>x.tagName=="INPUT");
	if(checkbox == null){
		return;
	}
	if(checkbox.type == "number"){
		checkbox.focus();
		checkbox.select();
	}
	else{
		checkbox.checked = !checkbox.checked;
		userInputData(this, checkbox);
	}
}

/**
 * called when user inputs data
 * @param {Element} rowHtml 
 * @param {Element} checkboxElement 
 */
function userInputData(rowHtml, checkboxElement){
	//extract what it is from the parent id so we can update progress
	var classname = rowHtml.classList[0];
	let rowid = rowHtml.getAttribute("clid");
	progress.updateChecklistProgressFromInputElement(rowid, checkboxElement, classname);
	
	recalculateProgressAndUpdateProgressUI();
}

//These variables are used to make sure we don't run a ton of refresh code constantly.
var __displayingIframe = null;
var __linkFormatType = null; //if for example the iframe was already off and we now have it set to window, the window link rewrite code wouldn't run without checking this.
/**
 * Update iframe visibility and where guide links will appear.
 * @param {boolean} visible should iframe be visible
 */
//TODO: Split the link updating and iFrame updating into two separate functions for even less redundancy.
function updateIframe(visible){
	//If no settings are changing, exit this script to avoid tons of redundant updating.
	if(visible == __displayingIframe && settings.iframeCheck == __linkFormatType){
		return;
	}
	if(window.debug){
		let newstate = visible?"on":"off"
		console.log("updating iframe to "+newstate);
	}
	if(visible){
		//iframe going from off to on
		let sidebar = document.getElementById("sidebar");
		let divider = document.getElementById("dragMe");

		if(sidebar != null && divider != null && mainPanel != null){
			sidebar.style.display = "";
			divider.style.display = "";
		}
		else{
			console.error("Could not find all elements required to enable the iframe.");
		}
		
		//update all _blank links to open in iframe
		var links = document.getElementsByClassName("guideFrame")[0].getElementsByTagName("A");
		for(var lnk of links){
			if(lnk.target == "_blank" || lnk.target == "externalSecondWindow"){
				lnk.target = "myframe";
			}
		}
		if(navigator.userAgent.includes("Chrome") ){
			//Chrome doesn't resize images in iframes so we get to do it ourselves.
			//use onLoad instead of document.addEventListener because we only want this once and this is the easiest way to do that
			let myframe = document.getElementById("myframe");
			myframe.onload = (evt)=>{
				const img = myframe.contentDocument.children[0]?.children[1]?.children[0];
				if(img == null || img.tagName != "IMG"){
					if(window.debug){
						console.log("can't find img to resize");
					}
					return;
				}
				img.style = "width:100%;cursor:zoom-in";
				img.addEventListener('click', (evt)=>{
					if(img.style.width == "100%"){
						img.style = "cursor:zoom-out";
					}
					else{
						img.style = "width:100%;cursor:zoom-in";
					}
				});
				console.log("img loaded in second window");
			};
		}
		__displayingIframe = true;
	}
	else{
		//iframe going from on to off
		//just hide the entire side panel because if we go back to large, we don't want to have to reload the iframe.
		let sidebar = document.getElementById("sidebar");
		let divider = document.getElementById("dragMe");
		let mainPanel = document.getElementsByClassName("mainPanel")[0]; //TODO: homogenize the id for this div on each webpage.
		if(sidebar != null && divider != null && mainPanel != null){
			sidebar.style.display = "none";
			divider.style.display = "none";
			mainPanel.style.width = "100%"; //Want this to be 100% width since draggable will set it assuming there is a sidePanel even if there isn't.
		}
		//update links to redirect to desired place based on settings.
		if(settings.iframeCheck == "window"){ //If the user wants links to redirect to a second window.
			var links = document.getElementsByClassName("guideFrame")[0].getElementsByTagName("A");
			for(var lnk of links){
				if(lnk.target == "_blank" || lnk.target == "myframe"){
					lnk.target = "externalSecondWindow";
				}
			}
		}
		else{//iframeCheck setting is "off" and the user doesn't specfically want it to open in a second window, so we do new tab.
			var links = document.getElementsByClassName("guideFrame")[0].getElementsByTagName("A");
			for(var lnk of links){
				if(lnk.target == "myframe" || lnk.target == "externalSecondWindow"){
					lnk.target = "_blank";
				}
			}
		}
		__displayingIframe = false;
	}
	__linkFormatType = settings.iframeCheck;
}

//The root function of the iframe resizing settings, runs each time the window size changes.
var windowResizeId = null;
function onWindowResize(event){
	//on window resize, we may want to hide sidebar.
	//only resize after being still for 10ms
	if(windowResizeId != null){
		clearTimeout(windowResizeId);
	}
	windowResizeId = setTimeout(checkIframeSize,10,event);
}

//Checks the window size and pass a true/false to the updateIframe function to indicate if the iframe should be turned on/off.
function checkIframeSize(event){
	windowResizeId = null;
	if(settings?.iframeCheck == "on" || 
	(settings?.iframeCheck == "auto" && !window.matchMedia("(max-width: " + settings.iframeMinWidth + "px)").matches)){ //if iframe setting is on or set to auto and window is larger than setting for min width.
		updateIframe(true);
	}
	else{
		updateIframe(false);
	}
}

function pushNpcReferencesToMinipage(event){
	const npcData = getNpcData(event.target.parentElement);
	const references = getAllReferencesOnPage(npcData);
	const myframe = document.getElementById("myframe");
	
	myframe.addEventListener('load',()=>{
		myframe.contentWindow.postMessage(references,"*");
		console.log(references);
	},{once:true});
}

function getAllReferencesOnPage(cell){
	var npcLinks = document.getElementsByClassName("npc");
	var refs = [];
	for(var link of npcLinks){
		if(link.children[0].innerText == cell.name){
			//TODO: or formId
			refs.push(getElementReferenceLocation(link));
		}
	}
	return refs;
}

/**
 * Return the document path of the specified html element.
 * Used for the npc "referenced in" feature.
 * @param {*} obj html element
 * @returns {{anchor: string, path: string}} Link to section object is referenced in and absolute path to object.
 */
function getElementReferenceLocation(obj){
	var parent = obj.parentElement;
	var link = null;
	var path = "";
	
	while(parent != document.body){
		if(parent.id != null && parent.id != ""){
			//ignore duplicate sections of IDs
			if(path.substring(1).startsWith(parent.id)){
				var abridgedPath = path.substring(1+parent.id.length);
				if(abridgedPath[0] == "_"){
					abridgedPath = abridgedPath.substring(1);
				}
				path = "/"+abridgedPath;
			}
			path = "/" + parent.id + path;
			if(link == null) {
				link = parent.id.toString();
			}
		}
		else if(parent.tagName == "LI"){
			const index = Array.prototype.indexOf.call(parent.parentElement.children,parent);
			path = "/"+(index+1)+path;
		}
		
		parent = parent.parentElement;
	}
	return {anchor:link,path:path};
}