//This file contains functions that load static data, both reference data from Oblivion
// and guide-specific things, like UESP links and notes.
// This file also contains utility functions for navigating through this data.

export {totalweight, jsondata, getJsonData, classes, progressClasses, loadJsonData, findOnTree, runOnTree, findCell}

var jsondata = null

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
	// containsUserProgress means that it will show in the main checklist page (and save in userdata, sync with server, etc.)
	new JsonClass("quest",true,true),
	new JsonClass("skill",true,true),
	new JsonClass("store",true,true),
	new JsonClass("book",true,true),
	new JsonClass("misc",true),
	new JsonClass("npc",false),
	new JsonClass("fame",true),
	new JsonClass("location",true, true),
	new JsonClass("nirnroot",true, true),
	new JsonClass("save",true),
	new JsonClass("locationPrediscovered",false),
	new JsonClass("wayshrine",false),
	new JsonClass("glitch",false),
	//used in class reset calculator only
	new JsonClass("race", false),
	new JsonClass("birthsign", false)
];

function getJsonData(){
	return jsondata;
}

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
async function loadJsonData(basedir=".",classFilter=(x=>true)){
	var promises = [];
	let localJsonData = {};
	for(var klass of classes){
		if(classFilter(klass)){
			//be sure to *execute* the function, not just generate it
			promises.push(generatePromiseFunc(basedir,klass, localJsonData)().catch(e=>{
				console.log(e);
				debugger;
			}));
		}
	}
	return Promise.allSettled(promises).then((_)=>{
		if(window.debug?.async){
			console.log(promises);
		}
		window.jsondata = localJsonData;
		jsondata = localJsonData;
		try{
			runOnTree(jsondata.location, linkOblivionGate);
		}
		catch(e){
			console.warn("linking oblivion gates failed:"+e);
		}
		computeTotalWeight();
	});
}

/**
 * returns an async function that fetches a json file and merges required data.
 * this needs to be a separate func because byref closure shenanigans
 * @param {string} basedir base path to look for hive data in
 * @param {JsonClass} klass 
 * @returns {Promise<void>} promise that does the needful
 */
function generatePromiseFunc(basedir, klass, outDataObject){
	return async function()
	{
		let baseFile = fetch(basedir+"/data/"+klass.name+".json")
			.then(resp=>resp.json())
			.catch((e=>{
				console.error("Error in "+klass.name+".json:");
				console.error(e);
			}));
		let customFile = fetch(basedir+"/data/"+klass.name+"_custom.json")
			.then(resp=>
				{
					if(resp.status == 404){
						return null;
					}
					return resp.json();
				})
			.catch((e=>{
				console.error("Error in "+klass.name+".json:");
				console.error(e);
			}));
		let hive = await mergeData(baseFile, customFile);
		hive.class = klass;
		outDataObject[klass.name] = hive;
		if(window.debug?.async){
			console.log("set "+hive.classname+" jsondata");
		}
	};
}

/**
 * Returns a function that gives the cell its sequential ID from its formID and the map of formID to sequentialID.
 * @param {*} mapping ID to formID json map
 */
function mergeCell(mapping){
	return (cell =>{
		let maybeMapping = mapping.find(x=>x.formId === cell.formId);
		if(maybeMapping != null){
			for(const propname in maybeMapping){
				cell[propname] = maybeMapping[propname]
			}
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
	if(node.parent == null){
		node.hive = node;
	}
	else{
		node.hive = node.parent.hive;
	}

	if(node.elements != null){
		for(const child of node.elements){
			addParentLinks(child, node);
		}
	}
	
}

//bad hack to backlink close gates to their locations
function linkOblivionGate(cell){
	if(cell.gateCloseLink != null){
		let otherCell = findCell(cell.gateCloseLink, "misc");
		if(otherCell != null){
			otherCell.location = cell;
		}
	}
}


/**
 * turn a bunch of json data from different files into a single js object.
 * @param {Object} hive base hive data
 * @param {string} basedir base dir to get files from
 */
async function mergeData(hivePromise, customdataPromise){
	let hive = await hivePromise;
	if(window.debug?.async){
		console.log("merging "+hive.name+" with version "+hive.version);
	}


	if(hive.version <= 3){
		hive.classname = hive.name;
	}
	if(hive.version >= 3){
		//jsonTree is by formId. load IDs.
		try{
			const customData = await customdataPromise;
			if(customData != null){
				runOnTree(hive, mergeCell(customData));
			}
			if(window.debug?.async){
				console.log("merged "+hive.classname);
			}
		}
		catch(ex){
			if(window.debug?.async){
				console.error("error when merging custom data for "+hive.classname);
				console.error(ex);
			}
		}//there may not be any other data, so just continue in that case.
	}
	//all leaf cells will be used, so set their onUpdate to empty array.
	runOnTree(hive, (cell)=>cell.onUpdate = []);
	addParentLinks(hive, null);
	if(window.debug?.async?.class==hive?.classname){
		debugger;
	}
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
				if(window.debug?.async){
					console.log(klass.name + " is not loaded!");
				}
				continue;
			}
			if(hive.version >= 2){
				totalweight += runOnTree(hive,(e=>parseFloat(e.weight)),0,(e=>e.weight != null));
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
function findOnTree(root,findfunc){
	if(findfunc(root)){
		return root;
	}

	if(root?.elements == null){
		return null;
	}
	
	for(const e of root.elements){
		const mayberesult = findOnTree(e, findfunc);
		if(!(mayberesult == null)){
			return mayberesult;
		}
	}
}

/**
 * run a function on leaves in a tree and sum the results.
 * @param {*} rootNode root node to run on
 * @param {(x:object)=>boolean} runFunc function to run on nodes
 * @param {*} startVal starting value of result
 * @param {(x:object)=>boolean} isLeafFunc function to determine if func should be run on this node. default is elements prop null or undefined.
 * @param skipLeafs everything under the "isLeafFunc" nodes be skipped?
 */
function runOnTree(rootNode, runFunc, startVal, isLeafFunc=elementsUndefinedOrNull, skipLeafs = false){
	var newval = startVal;
	if(isLeafFunc(rootNode)){
		newval += runFunc(rootNode);
		if(skipLeafs){
			return newval;
		}
	}
	if(rootNode.elements != null){
		for(const node of rootNode.elements){
			newval = runOnTree(node,runFunc,newval,isLeafFunc);
		}
	}
	return newval;
}

/**
 * Find the cell with the given formID.
 * @param {String} formId 
 * @param {String} classHint optional class name to search.
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
	//try to find with sequentialID. used for saves.
	if(cell == null && classHint != null){
		for(const klass of classesToSearch){
			cell = findOnTree(jsondata[klass.name], x=>x.id == formId);
		}
	}
	return cell;
}

window.findCell = findCell;
