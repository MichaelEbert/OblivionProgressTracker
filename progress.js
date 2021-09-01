
//progress functions
var savedata;

function saveCookie(name,value){
	//save for 10 years
	var expiry = new Date()
	expiry.setDate(expiry.getDate()+365*10);
	document.cookie = name+"="+JSON.stringify(value)+"; expires="+expiry.toUTCString()+"; SameSite = Lax";

}

function loadCookie(name){
	try{
		let progressValue = document.cookie
		.split('; ')
		.find(row => row.startsWith("progress="))
		.split('=')[1];
		return JSON.parse(progressValue);
		
	}
	catch{
		return false;
	}
}

function loadProgressFromCookie(){
	var compressed = loadCookie("progress");
	
	if(compressed){
		//expand cookie data back to nice, usable form.
		savedata = {};
		for(propname in compressed){
			if(propname == "quest" || propname == "book" || propname == "store" || propname == "skill"){
				savedata[propname] = {};
				var elements = compressed[propname];
				var i = 0;
				while(i < elements.length){
					if(elements[i] != null){
						savedata[propname][i] = (elements[i] == 1);
					}
					i+=1;
				}
			}
			else{
				savedata[propname] = compressed[propname];
			}
		}
		
		if(savedata.version != version){
			alert("Save data is out of date. Percentages may be wrong.")
		}
		document.dispatchEvent(new Event("progressLoad"));
		return true;
	}
	else{
		return false;
	}
}

function saveProgress(){
	//savedata is in the format where IDs are an associative array of boolean values. 
	//change this to linear array of int values so its smaller.
	compressed = {};
	compressed.version = savedata.version;
	for(propname in savedata){
		if(propname == "quest" || propname == "book" || propname == "store" || propname == "skill"){
			compressed[propname] = [];
			var elements = savedata[propname];
			for(elementPropName in elements){
				compressed[propname][parseInt(elementPropName)] = elements[elementPropName] == 1 ?1:0;
			}
		}
		else{
			compressed[propname] = savedata[propname];
		}
	}	
	saveCookie("progress",compressed);
}



var jsondata = {quest:null,book:null,skill:null,store:null}
function loadJsonData(){
	var questdata = fetch("./data/quests.js").then(response=>response.json()).then(d => jsondata.quest = d);
	var bookdata = fetch("./data/books.js").then(response=>response.json()).then(d => jsondata.book = d);
	var skilldata = fetch("./data/skills.js").then(response=>response.json()).then(d => jsondata.skill = d);
	var storedata = fetch("./data/stores.js").then(response=>response.json()).then(d => jsondata.store = d);
	var savedata = fetch("./data/saves.js").then(response=>response.json()).then(d => jsondata.save = d);
	return Promise.all([questdata,skilldata,bookdata,storedata,savedata])
}

var version = 4;
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
			resetProgressForTree(classname, jsondata[classname].elements);
		}
		
		savedata.save={};
		savedata.misc = {};
		savedata.misc.placesfound = 0;
		savedata.misc.nirnroot = 0;
		
		updateUIFromSaveData();
		recalculateProgressAndSave();
	}
}