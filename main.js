var jsondata = {quest:null,book:null,skill:null,store:null}
var savedata;
var version = 2;
var totalweight;

var classes = [
	{name:"quest",standard:true,weight:50}
	,{name:"book",standard:true,weight:8}
	,{name:"skill",standard:true,weight:15}
	,{name:"store",standard:true,weight:5}	
	,{name:"misc",standard:false,weight:10}
]

// classes that have a standard layout and can use most of the generic functions.
function standardclasses(){
	return classes.filter(x=>x.standard).map(x=>x.name);
}

totalweight = classes.reduce((tot,c)=>tot+c.weight,0);




//functions that create the page
function init(){
	var questdata = fetch("./data/quests.js").then(response=>response.json()).then(bookdata => initQuests(bookdata.data));
	var bookdata = fetch("./data/books.js").then(response=>response.json()).then(bookdata => initBooks(bookdata.data));
	var skilldata = fetch("./data/skills.js").then(response=>response.json()).then(bookdata => initSkills(bookdata.data))
	var storedata = fetch("./data/stores.js").then(response=>response.json()).then(bookdata => initStores(bookdata.data))
	Promise.all([skilldata,bookdata,storedata])
	.then(()=>{
	if(loadProgressFromCookie() == false){
		resetProgress();
	}});
}

function initQuests(qdata){
	jsondata.quest = qdata
	initMulti(qdata,"quest","questline");
}
function initBooks(booksdata){
	jsondata.book = booksdata
	initMulti(booksdata,"book","skill");
}
function initSkills(skilldata){
	jsondata.skill = skilldata
	initMulti(skilldata,"skill","specialization");
}
function initStores(skilldata){
	jsondata.store = skilldata
	initMulti(skilldata,"store","city");
}
//common functions
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
			section.appendChild(categoryHtml);
			
			var categoryTitle = document.createElement("div");
			categoryTitle.classList.add("categoryTitle");
			categoryTitle.innerText = currentCategory;
			categoryHtml.appendChild(categoryTitle);
		}
		categoryHtml.appendChild(bhtml);
	}
}

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


//progress functions
function loadProgressFromCookie(){
	try{
		let progressValue = document.cookie
		.split('; ')
		.find(row => row.startsWith("progress="))
		.split('=')[1];
		savedata = JSON.parse(progressValue);
		if(savedata.version != version){
			alert("Save data is out of date. Percentages may be wrong.")
		}
		updateUIFromSaveData();
		recalculateProgressAndSave();
		return true;
	}
	catch{
		return false;
	}
}

function saveCookie(){
	//save for 10 years
	var expiry = new Date()
	expiry.setDate(expiry.getDate()+365*10);
	document.cookie = "progress="+JSON.stringify(savedata)+"; expires="+expiry.toUTCString()+"; SameSite = Lax";

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
			for(datum of jsondata[classname]){
				//add entry to savedata
				savedata[classname][datum.id] = false;
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

}

function updateSaveDataFromUI(){
	for (classname in standardclasses()) {
		for(id in savedata[classname]){
			savedata[classname][id] = document.getElementById("book"+id+"check").checked;
		}
	}
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