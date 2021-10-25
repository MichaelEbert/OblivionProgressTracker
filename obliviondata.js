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
 * @param {boolean} shouldSave should this class be included in save data?
 * @param {boolean} isStandard is boolean and sequential? (see prop for details)
 * @param {number} completionWeight default weight for this class in completion.
 */
function JsonClass(name,shouldSave = false, isStandard = false, completionWeight = 0){
	/**
	 * name of this class (used for property access n stuff)
	 */
	this.name = name;
	
	/**
	 * should this class be included in save data?
	 * false for classes with no user input (eg., npcs)
	 */
	this.shouldSave = shouldSave;
	
	/**
	 * in order to be "standard", all elements of this class must
     * 1) be a boolean property (so no "nirnroots collected")
     * 2) have a sequential numeric id (so no id="fame")
	 */
	this.standard = isStandard;
	
	/**
	 * default weight for this class in completion.
	 * can be overridden in weight calculation later.
	 */
	this.weight = completionWeight;
}

const classes = [
	// name, shouldSave, isStandard, completionWeight
	new JsonClass("quest",true,true),
	new JsonClass("book",true,true),
	new JsonClass("skill",true,true),
	new JsonClass("store",true,true),
	new JsonClass("misc",true),
	new JsonClass("save",true),
	new JsonClass("npc",false),
	new JsonClass("fame",false)
];

/**
 * @returns {JsonClass[]} classes that have a standard layout and can use most of the generic functions.
 */
function standardClasses(){
	return classes.filter(x=>x.standard).map(x=>x.name);
}

/**
 * only classes that can be changed (and thus should be saved) contribute to progress
 */
const progressClasses = classes.filter(c=>c.shouldSave);

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
 * imma call single leaf nodes "cells" because its memorable
 * @param {*} mapping ID to formID json map
 */
function mergeCell(mapping){
	return (cell =>{
		cell.id = mapping.find(x=>x.formId == cell.formId).id;
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
	if(hive.version >= 3){
		//jsonTree is by formId. load IDs.
		try{
			const mapFilename = "mapping_"+hive.name.toLowerCase()+"_v"+hive.version+".json";
			const mapJson = await fetch(basedir+"/data/"+mapFilename).then(resp=>resp.json());
			runOnTree(hive, mergeCell(mapJson));
			
			console.log("merged "+hive.name);
		}
		catch{}//there may not be any other data, so just continue in that case.
	}
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

//
//rootNode: 
//runFunc: 
//startVal: 
//isLeafFunc: 
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
		for(const node of rootNode.elements){
			newval = runOnTree(node,runFunc,newval,isLeafFunc);
		}
	}
	return newval;
}