function colorToClass(color){
	if(color == "#274e13"){
		return "npc";
	}
	else if(color == "#7f6000"){
		return "spellname";
	}
	else if(color == "#660000"){
		return "quest";
	}
	else if(color == "#ff00ff"){
		return "book";
	}
	else if(color == "#1155cc"){
		return "nirnroot";
	}
	else{
		return undefined;
	}
}

function doNotCollapse(tagName){
	const dontCollapseTags = ["OL","UL","LI","#text"];
	for(tag of dontCollapseTags){
		if(tagName == tag){
			return true;
		}
	}
	return false;
}

function collapseHtml(root){
	if(root.children.length == 0){
		return;
	}
	else{
		for(var c of root.children){
			collapseHtml(c);
		}
		
		if(doNotCollapse(root.nodeName)){
			return;
		}
		if(root.children.length == 1){
			const onlyChild = root.children[0];
			if(root.color != null && colorToClass(root.color)){
				//create a new span node with the selected text
				var newSpan = document.createElement("span");
				newSpan.innerText = onlyChild.innerText;
				newSpan.classList.add(colorToClass(root.color));
				root.replaceWith(newSpan);
			}
			else{
				root.replaceWith(onlyChild);	
			}
		}
	}
}

function removeUselessSpans(root){
	var targets = document.getElementsByTagName("SPAN");
	var i = 0;
	while(targets.length > i){
		var d = targets[i];
		if(d.classList.length == 0){
			d.replaceWith(document.createTextNode(d.innerText));
			targets = document.getElementsByTagName("SPAN");
			i = 0;
		}
		else{
			i += 1;
		} 
	}
}

//call this to do the stuff
function doIt(){
	collapseHtml(document.body);
	removeUselessSpans(document.body);
}

// regex's to make stuff nicer:
//remove excess font tags:
//s/<font[^>]*>//g
//s/<\/font>//g

//move LI end tags to end of line
//s/\r\n(\s*)<\/li>/<\/li>\r\n$1/g

//move spaces outside of spans
//s/<\/span><span[^>]*>//g
//%s/ <\/span>/<\/span> /g
//s/(<span[^>]*>) / $1/g

//replace quest stuff with titles
//s/^<span class="quest">(.*)<\/span>/<\/div>\r\n\r\n<div class="category">\r\n<div class="categoryTitle">$1<\/div>/g


//generate custom formIDs for gate closures.
let startNumber = {};
let saveStartNumber = {};
let miscData = {};
let miscCustomData = {};
let mapData = {};
let mapCustomData = {};
startNumber = 0xFFFFFF50;
saveStartNumber = 33;
miscData = await fetch("./data/misc.json").then(x=>x.json());
miscCustomData = await fetch("./data/misc_custom.json").then(x=>x.json());
mapData = await fetch("./data/location.json").then(x=>x.json());
mapCustomData = await fetch("./data/location_custom.json").then(x=>x.json());

function idNumberToString(idNumber){
	return "0x"+idNumber.toString(16).toUpperCase();
}

function addIdNumber(mapGateObject){
	//first, get the custom data for this map object.
	let mapCustomObject = mapCustomData.find(x=>x.formId == mapGateObject.formId);
	if(mapCustomObject == null){
		console.debug("map custom object for "+mapGateObject.formId+" not found");
		mapCustomObject = {};
		mapCustomObject.formId = mapGateObject.formId;
		mapCustomData.push(mapCustomObject);
	}
	//then, add close id link
	const gateCloseId = idNumberToString(startNumber);
	startNumber += 1;
	mapCustomObject.gateCloseLink = gateCloseId;

	//then set miscdata id to close id.
	let gateClose = findOnTree(miscData, (x=>x.formId == mapGateObject.formId));
	if(gateClose == null){
		debugger;
	}
	gateClose.formId = gateCloseId;
	//then add to misc_custom
	let customObject = {};
	customObject.formId = gateCloseId;
	customObject.id = saveStartNumber;
	saveStartNumber +=1;
	miscCustomData.push(customObject);
}

// runOnTree(mapData.elements[8], addIdNumber);