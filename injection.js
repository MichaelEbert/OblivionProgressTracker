"use strict"
var linkedElements = [];

function LinkedElement(element, classname, id){
	this.htmlElement = element;
	this.classname = classname;
	this.id = id;
}

function init(){
	loadJsonData().then(()=>{
		loadProgressFromCookie();
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
		replaceElements();
		linkNPCs();
		window.addEventListener("resize",onWindowResize);
		actuallyResizeWindow();
	});
}

/**
 * Initial function to replace checkboxes n stuff.
 */
function replaceElements(){
	//TODO: incorporate NPC elements in to this general method.
	var replaceableParts = classes.filter(x=>x.name != "npc").flatMap(x=>Array.of(...document.getElementsByClassName(x.name)));

	for(let element of replaceableParts){
		const checklistid = element.getAttribute("clid");
		//step 1: get the target element data.
		var found = false;
		var cell = null;
		var elementclass = null;
		var elementid = null;
		for (const klass of classes){
			if(checklistid?.startsWith(klass.name)){
				elementid = parseInt(checklistid.substring(klass.name.length));
				cell = findOnTree(jsondata[klass.name],(x=>x.id == elementid));
				elementclass = klass.name;
				if(cell){found=true;}
				break;
			}
		}
		if(!found){
			if(checklistid?.startsWith("save")){
				elementid = checklistid.substring("save".length);
				cell = findOnTree(jsondata["save"], x=>x.id == elementid);
				elementclass = "save";
				found=true;
			}
		}
		if(!found){
			//try formId
			if(checklistid?.startsWith("0x")){
				for(var propname in jsondata){
					if(jsondata[propname]?.elements != null){
						var maybeJson = findOnTree(jsondata[propname], (x=>x.formId == checklistid));
						if(maybeJson != null){
							elementid = maybeJson.id;
							cell = maybeJson;
							elementclass = propname;
							found=true;
							break;
						}
					}
				}
			}
		}
		if(!found){
			//element didn't have a formid. search by name.
			//maybe we can look up by name
			let elementType = element?.classList[0];
			if(elementType != null){
				let elementName = element.innerText;
				let firstBracketPos = elementName.indexOf("[");
				if(firstBracketPos != -1){
					elementName = elementName.substring(0,firstBracketPos);
				}
				elementName = elementName.trim();
				var maybeCell = findOnTree(jsondata[elementType], x=>x.name?.toLowerCase() == elementName.toLowerCase());
				if(maybeCell != null){
					elementid = maybeCell.id;
					cell = maybeCell;
					elementclass = elementType;
					found = true;
				}
			}
		}

		if(!found){
			//skip this iteration and move to the next one.
			element.classList.remove("replaceable");
			element.classList.add("replaceableError");
			replaceableParts = document.getElementsByClassName("replaceable");
			let identifiedClass = element?.classList[0];
			let classStuff = {
				clid: checklistid,
				identifiedClass: element?.classList[0],
				contents: element?.innerText
			}
			console.warn("replaceable element not found in reference: ");
			console.warn(classStuff);
			
			continue;
		}
		//step 2: create the internal stuff.
		element.innerText = "";
		var newElement = initSingleCell(cell, elementclass)
		if(element.getAttribute("disabled") == "true"){
			newElement.children[1].disabled = true;
		}
		element.replaceWith(newElement);
		//step 3: load current data from cookies
		if(newElement == null || elementclass == null || elementid == null){
			debugger;
		}
		linkedElements.push(new LinkedElement(newElement, elementclass, elementid))
	}
	updateUIFromSaveData2();
}


/**
 * given a \<span class="npc"\>, attempt to get NPC data.
 * @param {HTMLElement} npcElement 
 */
function getNpcData(npcElement){
	var maybeFormId = npcElement.getAttribute("clid");
	if(maybeFormId != null){
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
	var npcName = npcElement.innerText;
	var maybeNpcData = jsondata.npc?.elements.find(npc=>npc.name.toLowerCase() == npcName.toLowerCase())
	if(maybeNpcData != null){
		return maybeNpcData;
	}

	//npc data not found by name. could just be missing from our constants data, so provide name for auto-uesp.
	return {name:npcName};
}

/**
 * Create links for npc elements on page.
 */
function linkNPCs(){
	var npcs = document.getElementsByClassName("npc");
	for(var element of npcs){
		const npcData = getNpcData(element);
		if(npcData == null){
			continue;
		}
		const linky = createLinkElement(npcData, "npc", true);
		linky.addEventListener('click',pushNpcReferencesToMinipage);
		element.innerText = "";
		element.appendChild(linky);
	}
}

/**
 * Initialize the html for a single data cell.
 * @param {object} cell 
 * @param {string} classname 
 */
function initSingleCell(cell, classname){
	if(cell == null){
		console.error("null cell data for class"+classname);
		return;
	}
	var rowhtml = document.createElement("span");
	rowhtml.classList.add(classname);
	rowhtml.classList.add("item");
	
	rowhtml.setAttribute("clid",classname+cell.id);
	
	//name
	var rName = document.createElement("span");
	rName.classList.add(classname+"Name");
	
	rName.appendChild(createLinkElement(cell, classname));
	rowhtml.appendChild(rName);
	
	//checkbox
	var rcheck = document.createElement("input")
	if(cell.type){
		rcheck.type= cell.type;
		rcheck.addEventListener('change',checkboxClicked2);
		rcheck.size=4;
		if(cell.max){
			rcheck.max = cell.max;
		}
	}
	else{
		rcheck.type="checkbox";
		rcheck.addEventListener('click',checkboxClicked2);
	}
	rcheck.classList.add(classname+"Check")
	rcheck.classList.add("check")
	rowhtml.appendChild(rcheck)
	
	return rowhtml;
}


/**
 * create link element for a data cell. 
 * classname is for minipages. ex: book, npc, etc.
 * @param {object} cell 
 * @param {string} classname class name
 * @param {boolean} forceMinipage force minipage link, even if we don't have a usable id.
 */
function createLinkElement(cell, classname, forceMinipage=false){
	const linky = document.createElement("a");
	
	//so... uh... during transition from id to formid, we gotta do fallbacks n stuff.
	var usableId;
	if(cell.formId != null){
		usableId = cell.formId;
	}
	else{
		usableId = cell.id;
	}
	
	const useMinipage = settings.minipageCheck && (classname == "book" || classname == "npc") && (usableId != null || forceMinipage);
	if(useMinipage){
		linky.href ="./data/minipages/"+classname+"/"+classname+".html?id="+usableId;
		if(usableId == null){
			linky.href +="&name="+cell.name.replace(" ","_");
		}
	}
	else if(cell.link){
		linky.href = cell.link;
	}
	else{
		linky.href="https://en.uesp.net/wiki/Oblivion:"+cell.name.replaceAll(" ","_");
	}
	
	if(settings.iframeCheck){
		linky.target="myframe";
	}
	else{
		linky.target="_blank";
	}
	
	linky.innerText = cell.name;
	return linky;
}

/**
 * Updates UI elements from save data.
 * Call this when save data changes.
 * since these pages may contain multiple references to teh same object, we need to do this from the element side, not from the data side.
 */
function updateUIFromSaveData2(){
	for(const linkedElement of linkedElements){
		var checkbox = Array.from(linkedElement.htmlElement.children).find(x=>x.tagName=="INPUT");
		if(checkbox.type=="checkbox"){
			checkbox.checked = savedata[linkedElement.classname][linkedElement.id];
			if(checkbox.checked){
				linkedElement.htmlElement.classList.add("checked");
			}
			else{
				linkedElement.htmlElement.classList.remove("checked");
			}
		}
		else{
			checkbox.value = savedata[linkedElement.classname][linkedElement.id];
		}
	}
	let percentCompleteSoFar = recalculateProgress();
	//round progress to 2 decimal places
	var progress = Math.round((percentCompleteSoFar * 100)*100)/100;
	Array.of(...document.getElementsByClassName("totalProgressPercent")).forEach(element => {
		element.innerHTML = progress.toString();
		if(element.parentElement.className == "topbarSection"){
			element.parentElement.style = `background: linear-gradient(to right, green ${progress.toString()}%, red ${progress.toString()}%);`;
		}
	});

	if(settings.autoUploadCheck){
		uploadCurrentSave();
	}
}

function setParentChecked(item){
	if(item.checked){
		item.parentElement.classList.add("checked");
	}
	else{
		item.parentElement.classList.remove("checked");
	}
}

function checkboxClicked2(event){
	var parentid = event.target.parentElement.getAttribute("clid");

	//extract what it is from the parent id so we can update progress
	var found = false;
	for (const klass of progressClasses){
		if(parentid.startsWith(klass.name)){
			var rowid = parseInt(parentid.substring(klass.name.length));
			savedata[klass.name][rowid] = event.target.checked;
			setParentChecked(event.target);
			found=true;
			break;
		}
	}
	if(!found){
		if(parentid.startsWith("save")){
			var rowid = parentid.substring("save".length);
			savedata["save"][rowid] = event.target.valueAsNumber;
			found=true;
		}
	}
	if(!found){
		if(parentid.startsWith("misc")){
			var rowid = parentid.substring("misc".length);
			savedata["misc"][rowid] = event.target.checked;
			setParentChecked(event.target);
			found=true;
		}
	}
	if(!found){
		if(event.target.id == "placesfoundcheck") {
			savedata["misc"]["placesfound"] = event.target.valueAsNumber;
		}
		if(event.target.id == "nirnrootcheck") {
			savedata["misc"]["nirnroot"] = event.target.valueAsNumber;
		}
	}
	// we need to update because there might be multiple instances of the same book on this page, and we want to check them all.
	updateUIFromSaveData2();
	saveProgressToCookie();
}

var displayIframe = false;
/**
 * Update iframe visibility
 * @param {boolean} visible 
 */
function updateIframe(visible){
	//if we're not changing the visibility of the iframe, do nothing.
	if(visible == displayIframe){
		return;
	}
	if(visible){
		//iframe going from off to on
		if(document.getElementById("iframeContainer") != null){
			document.getElementById("iframeContainer").style.display = ""
		}
		else{
			var resizableContainer = document.createElement("div");
			resizableContainer.classList.add("resizableContainer");
			resizableContainer.id = "iframeContainer";

			var myframe = document.createElement("iframe");
			myframe.name="myframe";
			myframe.id="myframe";
			myframe.classList.add("iframe");
			
			resizableContainer.appendChild(myframe);
			var sidebar = document.getElementById("sidebarContainer");
			if(sidebar != null){
				sidebar.prepend(resizableContainer);
			}
			else{
				document.body.prepend(resizableContainer);
			}
		}
		
		//update all _blank links to open in iframe
		var links = document.getElementsByTagName("A");
		for(var lnk of links){
			if(lnk.target == "_blank"){
				lnk.target = "myframe";
			}
		}
	}
	else{
		//iframe going from on to off
		//just hide it because if we go back to large, we don't want to have to reload the iframe.
		document.getElementById("iframeContainer").style.display="none";

		//reset links to open in new tab, otherwise it looks like they're doing nothing.
		var links = document.getElementsByTagName("A");
		for(var lnk of links){
			if(lnk.target == "myframe"){
				lnk.target = "_blank";
			}
		}
	}
}

var windowResizeId = null;
function onWindowResize(event){
	//on window resize, we may want to hide sidebar.
	//only resize after being still for 50ms
	if(windowResizeId != null){
		clearTimeout(windowResizeId);
	}
	windowResizeId = setTimeout(actuallyResizeWindow,100,event);
}

function actuallyResizeWindow(event){
	windowResizeId = null;
	if(settings.iframeCheck == "on" || 
	(settings.iframeCheck == "auto" && window.innerWidth > 500)){
		updateIframe(true);
	}
	else{
		updateIframe(false);
	}
	console.log("update window size");

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
		if(link.innerText == cell.name){
			//TODO: or formId
			refs.push(getElementReferenceLocation(link));
		}
	}
	return refs;
}

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
