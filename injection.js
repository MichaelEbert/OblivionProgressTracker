
var linkedElements = [];

function LinkedElement(element, classname, id){
	this.element = element;
	this.classname = classname;
	this.id = id;
}

//initial function to replace element with checkbox n stuff.
function  replaceElements(){
	var replaceableParts = document.getElementsByClassName("replaceable");
	while(replaceableParts.length > 0){
		const element = replaceableParts[0];
		const checklistid = element.getAttribute("clid");
		//step 1: get the target element data.
		var elementjson = null;
		var elementclass = null;
		var elementid = null;
		for (const classname of standardclasses()){
			if(checklistid?.startsWith(classname)){
				elementid = parseInt(checklistid.substring(classname.length));
				elementjson = jsondata[classname].find(x=>x.id == elementid);
				elementclass = classname;
				//break;
			}
		}

		if(elementclass == null || elementjson == null){
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

function updateUIFromSaveData2(){
	//since these pages may contain multiple references to teh same object, we need to
	//do this from the element side, not from the data side.
	for(const linkedElement of linkedElements){
			linkedElement.element.children[1].checked = savedata[linkedElement.classname][linkedElement.id];
			setParentChecked(linkedElement.element.children[1]);
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
	rcheck.type="checkbox"
	rcheck.classList.add(classname+"Check")
	rcheck.addEventListener('click',checkboxClicked2);
	rcheck.id = rowhtml.id+"check"
	rowhtml.appendChild(rcheck)
	
	return rowhtml;
}

function checkboxClicked2(event){
	var parentid = event.target.parentElement.getAttribute("clid");

	//extract what it is from the parent id so we can update progress
	for (const classname of standardclasses()){
		if(parentid.startsWith(classname)){
			var rowid = parseInt(parentid.substring(classname.length));
			savedata[classname][rowid] = event.target.checked;
			setParentChecked(event.target);
			break;
		}
	}
	if(event.target.id == "placesfoundcheck") {
		savedata["misc"]["placesfound"] = event.target.valueAsNumber;
	}
	if(event.target.id == "nirnrootcheck") {
		savedata["misc"]["nirnroot"] = event.target.valueAsNumber;
	}
	saveCookie();
}