"use strict"

var linkedElements = [];

function LinkedElement(element, classname, id){
	this.htmlElement = element;
	this.classname = classname;
	this.id = id;
}

function init(){
	loadSettingsFromCookie();
	checkIframeSize(); 
	
	window.addEventListener("resize",onWindowResize);
	document.addEventListener("progressLoad",progress.updateProgressBar)
	loadJsonData().then(()=>{
		replaceElements();
		loadProgressFromCookie();
		sharing.initSharingFeature();
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

function checkboxClicked(event){
	const rowHtml = event.target.parentElement;

	var parentid = rowHtml.getAttribute("clid");
	var classname = rowHtml.classList[0];
	updateChecklistProgressFromInputElement(parentid, event.target, classname);
	event.stopPropagation();
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
}

//used to make sure we don't run a ton of refresh code constantly.
var __linkState = null;

/**
 * Update iframe visibility and where guide links will appear.
 * @param {string} newLinkLocation should iframe be visible
 */
//TODO: Split the link updating and iFrame updating into two separate functions for even less redundancy.
function updateIframe(newState){
	//If no settings are changing, exit this script to avoid tons of redundant updating.
	if(__linkState == newState){
		return;
	}
	if(window.debug){
		console.log("updating iframe to "+newState);
	}
	const sidePanel = document.getElementsByClassName("sidePanel")[0];
	const mainPanel = document.getElementsByClassName("mainPanel")[0];
	const divider = document.getElementById("dragMe");
	switch(newState){
	case LINK_LOCATION_MYFRAME:
		//iframe going from off to on

		//initialize sidebar if we have to
		let iframeContainer = document.getElementById("iframeContainer");
		if(iframeContainer == null){
			const sidebarContent = document.getElementById("sidebarContent");
			if(sidebarContent == null){
				console.error("can't find sidebarContent to insert iframe");
				return;
			}
			//initialize sidebar container, which we will hide situationally but only need to build once.
			let iframeContainer = document.createElement("DIV");
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
		}

		//make some room
		mainPanel.style.width = "55%"//TODO use setting
		//unhide side panels?
		divider.style = "";
		sidePanel.style = "";

		//update links
		var links = document.getElementsByTagName("A");
		for(var lnk of links){
			if(lnk.target == "_blank" || lnk.target == "externalSecondWindow"){
				lnk.target = "myframe";
			}
		}
		break;
	case LINK_LOCATION_NEWTAB:
		//turning off iframe
		//make some room
		mainPanel.style.width = ""//TODO use setting
		//hide side panels
		if(divider != null){
			divider.style.display = "none";
		}
		if(sidePanel != null){
			sidePanel.style.display = "none";
		}

		//update links
		var links = document.getElementsByTagName("A");
		for(var lnk of links){
			if(lnk.target == "myframe" || lnk.target == "externalSecondWindow"){
				lnk.target = "_blank";
			}
		}
		break;
	case LINK_LOCATION_SECONDWINDOW:
		//turning off iframe, move to second window
		//make some room
		mainPanel.style.width = ""//TODO use setting
		//hide side panels
		if(divider != null){
			divider.style.display = "none";
		}
		if(sidePanel != null){
			sidePanel.style.display = "none";
		}

		//update links
		var links = document.getElementsByTagName("A");
		for(var lnk of links){
			if(lnk.target == "myframe" || lnk.target == "_blank"){
				lnk.target = "externalSecondWindow";
			}
		}
		break;
	default:
		console.error("invalid link location. should be a constant.");
		break;
	}
	__linkState == newState;
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

const LINK_LOCATION_NEWTAB = "_blank";
const LINK_LOCATION_MYFRAME = "myframe";
const LINK_LOCATION_SECONDWINDOW = "externalsecondwindow";

/**
 * Update iframe and link locations to new states.
 * @param {*} event 
 */
function checkIframeSize(event){
	windowResizeId = null;
	//links can be 3 states:
	//newtab:
	// if iframe setting is "off"
	// iframe setting is "auto" but window is too small
	//myframe:
	// iframe setting is "on"
	// iframe setting is "auto" and window is wide enough
	//secondwindow:
	// iframe setting is "secondwindow"

	switch(settings?.iframeCheck){
		case "off":
			updateIframe(LINK_LOCATION_NEWTAB);
			break;
		case "auto":
			if(window.innerWidth >= settings.iframeMinWidth){
				updateIframe(LINK_LOCATION_MYFRAME);
			}
			else{
				updateIframe(LINK_LOCATION_NEWTAB);
			}
			break;
		case "on":
			updateIframe(LINK_LOCATION_MYFRAME);
			break;
		case "window":
			updateIframe(LINK_LOCATION_SECONDWINDOW);
			break;
		default:
			console.error("unknown iframeCheck option");
			break;
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