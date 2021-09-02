//==========================
// Functions that generate the page
//===========================
function init(){
	document.addEventListener("progressLoad",updateUIFromSaveData);
	loadJsonData().then(()=>{
		initMultiV2(jsondata.quest,"quest","questline");
		initMultiV2(jsondata.book,"book","skill");
		initMultiV2(jsondata.skill,"skill","specialization");
		initMultiV2(jsondata.store,"store","city");
		initMultiV2(jsondata.misc,"misc","");
		if(loadProgressFromCookie() == false){
			resetProgress();
	}});
}

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
		if(datum.id != null){
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
	var rowhtml = document.createElement("div");
	rowhtml.classList.add(classname);
	rowhtml.classList.add("item");
	rowhtml.id = classname+rowdata.id.toString();
	rowhtml.addEventListener('click',rowClicked);
	
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
	linky.innerText = rowdata.name;
	linky.target = "_blank";
	rName.appendChild(linky);
	rowhtml.appendChild(rName);
	
	//checkbox
	var rcheck = document.createElement("input")
	if(rowdata.type){
		rcheck.type= rowdata.type;
		rcheck.addEventListener('change',checkboxClicked);
		rcheck.size=4;
		if(rowdata.max){
			rcheck.max = rowdata.max;
		}
	}
	else{
		rcheck.type="checkbox";
		rcheck.addEventListener('click',checkboxClicked);
	}
	rcheck.classList.add(classname+"Check")
	rcheck.classList.add("check")
	rcheck.id = rowhtml.id+"check"
	rowhtml.appendChild(rcheck)
	
	//notes
	if(rowdata.notes){
		var notesIcon = document.createElement("span");
		notesIcon.title = rowdata.notes;
		notesIcon.innerText = "⚠"
		rowhtml.appendChild(notesIcon);
	}
	
	return rowhtml;
}


//==========================
// Functions that deal with progress
//===========================

//get the completed items and total items for a single ID'd element in the json.
function sumCompletionSingleElement(element,classname){
	var totalElements;
	var completedElements;
	if(element.type == "number"){
		completedElements = savedata[classname][element.id];
		if(element.max){
			totalElements = element.max;
		}
		else{
			totalElements = Math.max(1,completedElements);
		}
	}
	else{
		//we're a checkbox
		totalElements = 1;
		const completed = savedata[classname][element.id];
		if(completed){
			completedElements = 1;
		}
		else{
			completedElements = 0;
		}
	}
	return [completedElements,totalElements];	
}

//get the sum of completed items and total items under this element in the json.
//can't use runOnTree because we get 2 inner results and we cant add taht in 1 step
function sumCompletionItems(jsonNode,classname){
	if(jsonNode.id != null){
		return sumCompletionSingleElement(jsonNode,classname);
	}
	else{
		var completed = 0;
		var total = 0;
		for( element of jsonNode.elements){
			const innerResult = sumCompletionItems(element,classname);
			completed += innerResult[0];
			total += innerResult[1];
		}
		return [completed,total];
	}
}

// given a json node with a weight, sums the completion of all items
// under that node.
// additionally, updates subtotal HTML elements if it can find them.
function getSubtotalCompletion(subtotalJsonNode,classname){
	const weight = subtotalJsonNode.weight;
	const [items,total] = sumCompletionItems(subtotalJsonNode,classname);
	
	//try to find subtotals
	const overviewId = "overview"+classname+"_"+subtotalJsonNode.name.replaceAll(" ","_").toLowerCase();
	const maybeItem = document.getElementById(overviewId);
	if(maybeItem){
		//add this to correct subtotal slot
		maybeItem.innerText = items.toString() + "/" + total.toString();
	}
	
	// and finally, return weighted progress for total progress.
	return (items/total)*weight;
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
			percentCompleteSoFar += (classchecked/classtotal) * (klass.weight);
		}
		else if (klass.name == "misc") {
			// we need to start from the json because of nested weights
			var classtotal;
			var classchecked;
			var classweight;
			percentCompleteSoFar += runOnTree(jsondata.misc, e=>getSubtotalCompletion(e,"misc"), 0, e=>e.weight != null);

			//TODO FIX
			//classtotal = 367;
			//classchecked = parseInt(savedata.misc.placesfound);
			//document.getElementById("overviewplaces").innerText = classchecked.toString() + "/" + classtotal.toString();
			//percentCompleteSoFar += (classchecked/classtotal) * (8/totalweight);
			//
			//classtotal = 306;
			//classchecked = parseInt(savedata.misc.nirnroot);
			//document.getElementById("overviewnirnroot").innerText = classchecked.toString() + "/" + classtotal.toString();
			//percentCompleteSoFar += (classchecked/classtotal) * (2/totalweight);
		}
	}
	
	//we can turn percentCompleteSoFar into an actual percent here, instead of dividing by total in each segment, since
	// (a / total + b/total + c/total + ...) == (a+b+c+..)/total
	percentCompleteSoFar = percentCompleteSoFar / totalweight;
	
	//round progress to 2 decimal places
	var progress = Math.round((percentCompleteSoFar * 100)*100)/100;
	document.getElementById("totalProgressPercent").innerHTML = progress.toString();
	saveProgress();
}

function updateUIFromSaveData(){
	for(classname of standardclasses()){
		for(id in savedata[classname]){
			var checkbox = document.getElementById(classname+id+"check");
			checkbox.checked = savedata[classname][id];
			setParentChecked(checkbox);
		}
	}
	var classname = "misc";
	runOnTree(jsondata[classname], (element=>{
		const checkbox = document.getElementById(classname+element.id+"check");
		var x = savedata[classname][element.id]
		if(element.type == "number"){
			checkbox.value = x;
		}
		else{
			checkbox.checked = x;
			setParentChecked(checkbox);
		}
	}),0,(e=>e.id != null));
	
	recalculateProgressAndSave();
}

function setParentChecked(checkbox){
	if(checkbox.checked){
		checkbox.parentElement.classList.add("checked");
	}
	else{
		checkbox.parentElement.classList.remove("checked");
	}
}


function userInputData(htmlRowId, checkbox){
	var found=false;
	//extract what it is from the parent id so we can update progress
	for (const classname of standardclasses()){
		if(htmlRowId.startsWith(classname)){
			var rowid = parseInt(htmlRowId.substring(classname.length));
			savedata[classname][rowid] = checkbox.checked;
			setParentChecked(checkbox);
			found=true;
			break;
		}
	}
	if(!found){
		for(const classname of ["save","misc"]){
			if(htmlRowId.startsWith(classname)){
				var rowid = htmlRowId.substring(classname.length);
				if(checkbox.type == "checkbox"){
					savedata[classname][rowid] = checkbox.checked;
				}
				else{
					savedata[classname][rowid] = checkbox.valueAsNumber;
				}
				found=true;
				break;
			}
		}
	}
	recalculateProgressAndSave();
}


function checkboxClicked(event){
	var parentid = event.target.parentElement.id;
	userInputData(parentid, event.target);
}

// when user clicks on the row, not the checkbox
function rowClicked(event){
	var checkbox = Array.from(event.target.children).find(x=>x.tagName=="INPUT");
	if(checkbox.type == "number"){
		checkbox.focus();
		checkbox.select();
	}
	else{
		checkbox.checked = !checkbox.checked;
		userInputData(event.target.id, checkbox);
	}
}
