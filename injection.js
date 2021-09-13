
var linkedElements = [];

function LinkedElement(element, classname, id){
	this.element = element;
	this.classname = classname;
	this.id = id;
}


function initInjection(){
	replaceElements();
	linkNPCs();
	initIframe();
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
				elementjson = findOnTree(jsondata[classname],(x=>x.id == elementid));
				elementclass = classname;
				if(elementjson){found=true;}
				break;
			}
		}
		if(!found){
			if(checklistid?.startsWith("save")){
				elementid = checklistid.substring("save".length);
				elementjson = findOnTree(jsondata["save"], x=>x.id == elementid);
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
		var newElement = initInjectedElement(elementjson, elementclass)
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
		if(settings.iframeCheck){
			linky.target="myframe";
		}
		else{
			linky.target="_blank";
		}
		
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

function initInjectedElement(rowdata, classname){
	if(rowdata == null){
		console.log("null rowdata for class"+classname);
		return;
	}
	var rowhtml = document.createElement("span");
	rowhtml.classList.add(classname);
	rowhtml.classList.add("item");
	
	rowhtml.setAttribute("clid",classname+rowdata.id);
	
	//name
	var rName = document.createElement("span");
	rName.classList.add(classname+"Name");
	var linky = document.createElement("a");
	
	if(settings.minipageCheck && classname == "book"){
		linky.href="./data/minipages/"+classname+"/"+classname+".html?id="+rowdata.id;
	}
	else{
		if(rowdata.link){
			linky.href = rowdata.link;
		}
		else{
			linky.href="https://en.uesp.net/wiki/Oblivion:"+rowdata.name.replaceAll(" ","_");
		}
	}
	if(settings.iframeCheck){
		linky.target="myframe";
	}
	else{
		linky.target="_blank";
	}
	const titleClassname = classname[0].toUpperCase() + classname.slice(1);
	linky.innerText =  "[" + titleClassname + "] " + rowdata.name;
	rName.appendChild(linky);
	rowhtml.appendChild(rName);
	
	//checkbox
	var rcheck = document.createElement("input")
	if(rowdata.type){
		rcheck.type= rowdata.type;
		rcheck.addEventListener('change',checkboxClicked2);
		rcheck.size=4;
		if(rowdata.max){
			rcheck.max = rowdata.max;
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

function initIframe(){
if(settings.iframeCheck){
	//var iframeSpacer = document.createElement("div");
	//iframeSpacer.style.position="fixed";
	//iframeSpacer.style.width = "100%";
	//iframeSpacer.style.margin="1em";
	

	var myframe = document.createElement("iframe");
	myframe.name="myframe";
	myframe.id="myframe";
	myframe.style.float="right";
	myframe.style.position="fixed";
	myframe.style.marginLeft="70%";
	myframe.style.backgroundColor="#FBEFD5";
	myframe.style.border="1px solid black";
	myframe.style.marginRight="2em";
	
	myframe.height="320";
	myframe.width="512";
	//iframeSpacer.appendChild(myframe);
	document.body.prepend(myframe);
}
}