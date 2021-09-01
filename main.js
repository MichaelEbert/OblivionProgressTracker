//==========================
// Functions that generate the page
//===========================
function init(){
	loadJsonData().then(()=>{
		initMultiV2(jsondata.quest,"quest","questline");
		initMultiV2(jsondata.book,"book","skill");
		initMultiV2(jsondata.skill,"skill","specialization");
		initMultiV2(jsondata.store,"store","city");
		if(loadProgressFromCookie() == false){
			resetProgress();
	}});
}
//common functions

const classNamesForLevels = ["section","category","subcategory"]

function initMultiV2(multidata, classname, categoryName){
	if(multidata.version == 1){
		initMulti(multidata.elements,classname, categoryName);
	}
	else {
		var section = document.getElementById(classname+"section");
		initMultiV2internal(multidata.elements, classname, section,1);
	}
}

function initMultiV2internal(multidata, classname, parentNode, depth){
	for(datum of multidata) {
		//only leaf nodes have IDs
		if(datum.id != undefined && datum.id != null){
			parentNode.appendChild(initSingle(datum, classname));
		}
		else{
			// not a leaf node, so create a subtree, with a title n stuff.
			var subtreeName = datum.name.replaceAll(" ","_");
			var subtreeRoot = document.createElement("div");
			subtreeRoot.classList.add(classNamesForLevels[depth]);
			subtreeRoot.id = parentNode.id + "_" + subtreeName;
			
			var subtreeTitle = document.createElement("div");
			subtreeTitle.classList.add(classNamesForLevels[depth]+"Title");
			subtreeTitle.innerText = datum.name;
			subtreeRoot.appendChild(subtreeTitle);
			
			initMultiV2internal(datum.elements, classname, subtreeRoot, depth+1);
			parentNode.appendChild(subtreeRoot);
		}
	}
}

//init a non-leaf element
function initMulti(multidata, classname, categoryName){
	var section = document.getElementById(classname+"section");
	multidata.sort((a,b)=>{
		if(a[categoryName] < b[categoryName]){ return -1;}
		if(a[categoryName] > b[categoryName]){ return 1; }
		return 0;
	});
	// it MIGHT be better to just stick all the books in a sortable table.
	var currentCategory = "";
	//categoryHtml is a container so we can minimize 1 category at a time
	var categoryHtml;
	for (datum of multidata){
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

//init a single leaf element
function initSingle(rowdata, classname){
	var rowhtml = document.createElement("div")
	rowhtml.classList.add(classname)
	rowhtml.id = classname+rowdata.id.toString()
	
	//name
	var rName = document.createElement("span")
	rName.classList.add(classname+"Name")
	var linky = document.createElement("a");
	if(rowdata.link){
		linky.href = rowdata.link;
	}
	else{
		linky.href="https://en.uesp.net/wiki/Oblivion:"+rowdata.name.replaceAll(" ","_");
	}
	linky.innerText = rowdata.name;
	linky.target = "_blank";
	rName.appendChild(linky);
	rowhtml.appendChild(rName)
	
	//checkbox
	var rcheck = document.createElement("input")
	rcheck.type="checkbox"
	rcheck.classList.add(classname+"Check")
	rcheck.addEventListener('click',checkboxClicked);
	rcheck.id = rowhtml.id+"check"
	rowhtml.appendChild(rcheck)
	
	return rowhtml;
}

function resetProgressForTree(classname, jsonTreeList){
	for(element of jsonTreeList){
		if(element.id != undefined && element.id != null){
			savedata[classname][element.id] = false;
		}
		else{
			resetProgressForTree(classname, element.elements);
		}
	}
}

function resetProgress(shouldConfirm=false){
	var doit = true;
	if(shouldConfirm){
		doit = confirm("press OK to reset data");
	}
	if(doit){
		savedata = new Object();
		savedata.version = version;
		
		for(classname of standardclasses()){
			savedata[classname] = {};
			for(datalist of jsondata[classname]){
				resetProgressForTree(classname, datalist);
			}
		}
		
		savedata.locations = {};
		savedata.misc = {};
		savedata.misc.placesfound = 0;
		savedata.misc.nirnroot = 0;
		
		updateUIFromSaveData();
		recalculateProgressAndSave();
	}
}

function recalculateProgressAndSave(){
	//bleh theres a better way to do this
	var percentCompleteSoFar = 0.0;
	for (klass of classes) {
		if(klass.standard){
			var classtotal = 0;
			var classchecked = 0;
			for (id in savedata[klass.name]){
				if(savedata[klass.name][id] == true){
					classchecked += 1;
				}
				classtotal +=1;
			}
			
			//update overview and totals
			document.getElementById("overview"+klass.name).innerText = classchecked.toString() + "/" + classtotal.toString();
			percentCompleteSoFar += (classchecked/classtotal) * (klass.weight/totalweight);
		}
		else if (klass.name == "misc") {
			//TODO FIX
			var classtotal = 367;
			var classchecked = parseInt(savedata.misc.placesfound);
			document.getElementById("overviewplaces").innerText = classchecked.toString() + "/" + classtotal.toString();
			percentCompleteSoFar += (classchecked/classtotal) * (8/totalweight);
			
			classtotal = 306;
			classchecked = parseInt(savedata.misc.nirnroot);
			document.getElementById("overviewnirnroot").innerText = classchecked.toString() + "/" + classtotal.toString();
			percentCompleteSoFar += (classchecked/classtotal) * (2/totalweight);
		}
	}
	
	//round progress to 2 decimal places
	var progress = Math.round((percentCompleteSoFar * 100)*100)/100;
	document.getElementById("totalProgressPercent").innerHTML = progress.toString();
	saveCookie();
}

function updateUIFromSaveData(){
	for(classname of standardclasses()){
		for(id in savedata[classname]){
			var checkbox = document.getElementById(classname+id+"check");
			checkbox.checked = savedata[classname][id];
			setParentChecked(checkbox);
		}
	}
	
	document.getElementById("placesfoundcheck").value = savedata["misc"]["placesfound"];
	document.getElementById("nirnrootcheck").value = savedata["misc"]["nirnroot"];

}

function setParentChecked(checkbox){
	if(checkbox.checked){
		checkbox.parentElement.classList.add("checked");
	}
	else{
		checkbox.parentElement.classList.remove("checked");
	}
}

function checkboxClicked(event){
	var parentid = event.target.parentElement.id;

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
	recalculateProgressAndSave();
}