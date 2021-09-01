
var linkedElements = [];

function LinkedElement(element, classname, id){
	this.element = element;
	this.classname = classname;
	this.id = id;
}

function findRecursive(findfunc, elementList){
	for(element of elementList){
		if(element.id != undefined && element.id != null){
			if(findfunc(element)){
					return element;
			}
		}
		else{
			var mayberesult = findRecursive(findfunc, element.elements);
			if(mayberesult){
				return mayberesult;
			}
		}
	}
}

//initial function to replace element with checkbox n stuff.
function  replaceElements(){
	var replaceableParts = document.getElementsByClassName("replaceable");
	while(replaceableParts.length > 0){
		const element = replaceableParts[0];
		const checklistid = element.getAttribute("clid");
		//step 1: get the target element data.
		var found = false;
		var elementjson = null;
		var elementclass = null;
		var elementid = null;
		for (const classname of standardclasses()){
			if(checklistid?.startsWith(classname)){
				elementid = parseInt(checklistid.substring(classname.length));
				elementjson = findRecursive(x=>x.id == elementid, jsondata[classname].elements);
				elementclass = classname;
				found=true;
				break;
			}
		}
		if(!found){
			if(checklistid?.startsWith("save")){
				elementid = checklistid.substring("save".length);
				elementjson = findRecursive(x=>x.id == elementid, jsondata["save"].elements);
				elementclass = "save";
				found=true;
			}
		}

		if(!found){
			//skip this iteration and move to the next one.
			element.classList.remove("replaceable");
			element.classList.add("replaceableError");
			replaceableParts = document.getElementsByClassName("replaceable");
			continue;
		}
		//step 2: create the internal stuff.
		element.innerText = "";
		var newElement = initInjectedElement(elementjson, elementclass, elementid)
		element.replaceWith(newElement);
		//step 3: load current data from cookies
		linkedElements.push(new LinkedElement(newElement, elementclass, elementid))
	}
	updateUIFromSaveData2();
}

function linkNPCs(){
	var npcs = document.getElementsByClassName("npc");
	for(element of npcs){
		var linky = document.createElement("a");
		//TODO: NPC overrides
		linky.href="https://en.uesp.net/wiki/Oblivion:"+element.innerText;
		linky.innerText = element.innerText;
		element.innerText = "";
		element.appendChild(linky);
	}
}

function updateUIFromSaveData2(){
	//since these pages may contain multiple references to teh same object, we need to
	//do this from the element side, not from the data side.
	for(const linkedElement of linkedElements){
		var checkbox = Array.from(linkedElement.element.children).find(x=>x.tagName=="INPUT");
		if(checkbox.type=="checkbox"){
			checkbox.checked = savedata[linkedElement.classname][linkedElement.id];
			if(checkbox.checked){
				linkedElement.element.classList.add("checked");
			}
			else{
				linkedElement.element.classList.remove("checked");
			}
		}
		else{
			checkbox.value = savedata[linkedElement.classname][linkedElement.id];
		}
	}
}

function initInjectedElement(rowdata, classname, elementid){
	var rowhtml = document.createElement("span");
	rowhtml.classList.add(classname);
	rowhtml.setAttribute("clid",classname+elementid);
	
	//name
	var rName = document.createElement("span");
	rName.classList.add(classname+"Name");
	var linky = document.createElement("a");
	if(rowdata.link){
		linky.href = rowdata.link;
	}
	else{
		linky.href="https://en.uesp.net/wiki/Oblivion:"+rowdata.name.replaceAll(" ","_");
	}
	linky.innerText =  "[" + classname + "] " + rowdata.name;
	linky.target = "_blank";
	rName.appendChild(linky);
	rowhtml.appendChild(rName);
	
	//checkbox
	var rcheck = document.createElement("input")
	if(rowdata.type){
		rcheck.type= rowdata.type;
		rcheck.addEventListener('change',checkboxClicked2);
		rcheck.size=4;
	}
	else{
		rcheck.type="checkbox";
		rcheck.addEventListener('click',checkboxClicked2);
	}
	rcheck.classList.add(classname+"Check")
	rowhtml.appendChild(rcheck)
	
	return rowhtml;
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
	for (const classname of standardclasses()){
		if(parentid.startsWith(classname)){
			var rowid = parseInt(parentid.substring(classname.length));
			savedata[classname][rowid] = event.target.checked;
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
		
		if(event.target.id == "placesfoundcheck") {
			savedata["misc"]["placesfound"] = event.target.valueAsNumber;
		}
		if(event.target.id == "nirnrootcheck") {
			savedata["misc"]["nirnroot"] = event.target.valueAsNumber;
		}
	}
	// we need to update because there might be multiple instances of the same book on this page, and we want to check them all.
	updateUIFromSaveData2();
	saveProgress();
}