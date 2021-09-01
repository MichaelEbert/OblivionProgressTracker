
//progress functions
var savedata;
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
		document.dispatchEvent(new Event("progressLoad"));
		return true;
	}
	catch{
		return false;
	}
}

function saveProgress(){
	saveCookie("progress",savedata);
}

function saveCookie(name,value){
	//save for 10 years
	var expiry = new Date()
	expiry.setDate(expiry.getDate()+365*10);
	document.cookie = name+"="+JSON.stringify(value)+"; expires="+expiry.toUTCString()+"; SameSite = Lax";

}

var jsondata = {quest:null,book:null,skill:null,store:null}
function loadJsonData(){
	var questdata = fetch("./data/quests.js").then(response=>response.json()).then(d => jsondata.quest = d);
	var bookdata = fetch("./data/books.js").then(response=>response.json()).then(d => jsondata.book = d);
	var skilldata = fetch("./data/skills.js").then(response=>response.json()).then(d => jsondata.skill = d);
	var storedata = fetch("./data/stores.js").then(response=>response.json()).then(d => jsondata.store = d);
	return Promise.all([questdata,skilldata,bookdata,storedata])
}

var version = 3;
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