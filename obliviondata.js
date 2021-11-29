"use strict"
//This file contains functions that load static data, both reference data from Oblivion
// and guide-specific things, like UESP links and notes.
// This file also contains utility functions for navigating through this data.

var jsondata = {quest:null,book:null,skill:null,store:null}

/**
 * Total weight of all scored elements.
 */
var totalweight;

/**
 * Object that represents a type of json data.
 * eg., "quest","book", etc.
 * @param {string} name name of the class. Will be used to retrive json data.
 * @param {boolean} containsUserProgress Does this class contain elements that will be tracked as part of 100% progress?
 * @param {boolean} easyCompress is boolean and sequential? (see prop for details)
 * @param {number} completionWeight default weight for this class in completion.
 */
function JsonClass(name,containsUserProgress = false, easyCompress = false, completionWeight = 0){
	/**
	 * name of this class (used for property access n stuff)
	 */
	this.name = name;
	
	/**
	 * Does this class contain elements that will be tracked as part of 100% progress?
	 */
	this.containsUserProgress = containsUserProgress;
	
	/**
	 * in order to be "standard", all elements of this class must
     * 1) be a boolean property (so no "nirnroots collected")
     * 2) have a sequential numeric id (so no id="fame")
	 */
	this.standard = easyCompress;
	
	/**
	 * default weight for this class in completion.
	 * can be overridden in weight calculation later.
	 */
	this.weight = completionWeight;
}

const classes = [
	// name, containsUserProgress, isStandard, completionWeight
	new JsonClass("quest",true,true),
	new JsonClass("book",true,true),
	new JsonClass("skill",true,true),
	new JsonClass("store",true,true),
	new JsonClass("misc",true),
	new JsonClass("save",true),
	new JsonClass("npc",false),
	new JsonClass("fame",true),
	new JsonClass("nirnroot",true, true),
	new JsonClass("location",true, true)
];

/**
 * only classes that contribute to progress
 */
const progressClasses = classes.filter(c=>c.containsUserProgress);

/**
 * loads the "hives" (called that because they resemble windows registry hives)
 * into the "jsondata" variable.
 * @param {object} basedir base path to look for hive data in
 * @param {(x:JsonClass)=> boolean} classFilter only load classes that match this filter
 */
function loadJsonData(basedir=".",classFilter=(x=>true)){
	var promises = [];
	for(var klass of classes){
		if(classFilter(klass)){
			promises.push(generatePromiseFunc(basedir,klass));
		}
	}
	return Promise.allSettled(promises).then(()=>computeTotalWeight());
}

/**
 * returns an async function that fetches a json file and merges required data.
 * this needs to be a separate func because byref closure shenanigans
 * @param {string} basedir base path to look for hive data in
 * @param {JsonClass} klass 
 * @returns {Promise<void>} promise that does the needful
 */
function generatePromiseFunc(basedir, klass){
	return fetch(basedir+"/data/"+klass.name+".json")
			.then(resp=>resp.json())
			.then(hive=>mergeData(hive,basedir))
			.then(hive=>{
				jsondata[klass.name] = hive;
			})
			.catch(err =>console.log(err));
}

/**
 * Returns a function that gives the cell its sequential ID from its formID and the map of formID to sequentialID.
 * @param {*} mapping ID to formID json map
 */
function mergeCell(mapping){
	return (cell =>{
		let maybeMapping = mapping.find(x=>x.formId == cell.formId);
		if(maybeMapping != null){
			if(window.debug && cell.id != null){
				console.warn("cell has 2 IDs!");
				console.warn(cell);
			}
			cell.id = maybeMapping.id;

			if(window.debug && cell.tspID != null){
				console.warn("cell has 2 tspID values!");
				console.warn(cell);
			}
			cell.tspID = maybeMapping.tspID; //does this need a null/undefined check?
		}
	});
}

/**
 * Add parent links to a node tree.
 * @param {*} node 
 * @param {*} parent 
 */
function addParentLinks(node, parent){
	//recursively go through hive, adding parent links.
	node.parent = parent;

	//add a "hive" property that goes straight to the hive
	Object.defineProperty(node,"hive",{
		get: function(){
			let root = this;
			while(root.parent != null){
				root = root.parent;
			}
			return root;
		}
	});

	if(node.elements != null){
		for(const child of node.elements){
			addParentLinks(child, node);
		}
	}
	
}

/**
 * turn a bunch of json data from different files into a single js object.
 * @param {Object} hive base hive data
 * @param {string} basedir base dir to get files from
 */
async function mergeData(hive, basedir="."){
	if(window.debug){
		console.log("merging "+hive.name+" with version "+hive.version);
	}

	if(hive.version <= 3){
		hive.classname = hive.name;
	}
	if(hive.version >= 3){
		//jsonTree is by formId. load IDs.
		try{
			const mapFilename = "mapping_"+hive.classname.toLowerCase()+"_v"+hive.version+".json";
			const mapJson = await fetch(basedir+"/data/"+mapFilename).then(resp=>resp.json());
			if(hive.classname == "nirnroot" && window.debug){
				//debugger;
			}
			runOnTree(hive, mergeCell(mapJson));
			
			console.log("merged "+hive.classname);
		}
		catch(ex){
			if(window.debug){
				console.error("error for "+hive.classname);
				console.error(ex);
			}
		}//there may not be any other data, so just continue in that case.
	}
	runOnTree(hive, (cell)=>cell.onUpdate = []);
	addParentLinks(hive, null);
	return hive;
}

/**
 * compute total weight. Needed so we can get a percentage.
 */
function computeTotalWeight(){
	totalweight = 0;
	for(const klass of progressClasses){
		try{
			const hive = jsondata[klass.name];
			if(hive == null){
				// class data not loaded
				continue;
			}
			if(hive.version >= 2){
				totalweight += runOnTree(hive,(e=>parseInt(e.weight)),0,(e=>e.weight != null));
			}
			else{
				totalweight += klass.weight;
			}
		}
		catch (err){
			console.error("Problem computing weight for class "+klass.name+": "+err);
		}
	}	
}

//========================
// Utility functions
//========================

/**
 * @returns {boolean} is node.elements undefined or null?
 * @param {*} node 
 */
function elementsUndefinedOrNull(node){
	// in JS, undefined == null (but not undefined === null)
	return (node.elements == null);
}

/**
 * find an element of the tree.
 * @param {*} root root node to run on
 * @param {(x:object)=>boolean} findfunc function that returns 'true' if element matches.
 * @param {(x:object)=>boolean} isLeafFunc function to determine if this element is a leaf node and should be searched.
 */
function findOnTree(root,findfunc,isLeafFunc=elementsUndefinedOrNull){
	if(isLeafFunc(root)){
		if(findfunc(root)){
			return root;
		}
		else{
			return null;
		}
	}
	else{
		if(root?.elements == null){
			debugger;
		}
		for(const e of root.elements){
			const mayberesult = findOnTree(e, findfunc, isLeafFunc);
			if(!(mayberesult == null)){
				return mayberesult;
			}
		}
	}
}

/**
 * run a function on leaves in a tree and sum the results.
 * @param {*} rootNode root node to run on
 * @param {(x:object)=>boolean} runFunc function to run on leaves
 * @param {*} startVal starting value of result
 * @param {(x:object)=>boolean} isLeafFunc function to determine if leaf. default is elements prop null or undefined.
 */
function runOnTree(rootNode, runFunc, startVal, isLeafFunc=elementsUndefinedOrNull){
	var newval = startVal;
	if(isLeafFunc(rootNode)){
		newval += runFunc(rootNode);
	}
	else{
		if(rootNode.elements == null){
			debugger;
		}
		for(const node of rootNode.elements){
			newval = runOnTree(node,runFunc,newval,isLeafFunc);
		}
	}
	return newval;
}

/**
 * Find the cell with the given formID.
 * @param {} formId 
 * @param {*} classHint optional class hint.
 */
function findCell(formId, classHint = null){
	let classesToSearch;
	if(classHint != null){
		classesToSearch = classes.filter(x=>x.name == classHint);
	}
	else{
		classesToSearch = classes;
	}

	let cell = null;
	for(const klass of classesToSearch){
		cell = findOnTree(jsondata[klass.name], x=>x.formId == formId);
		if(cell != null){
			break;
		}
	}
	return cell;
}