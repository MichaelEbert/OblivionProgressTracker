
//change my IDs to formIDs:
//step 1: make map of my ID=> formID. SAVE THIS FOR LATER.
//step 2: in quests.js, change x.id to x.formID
//

var oldQuests = {};
fetch("./data/quests.js").then(x=>x.json()).then(y=>oldQuests = y);

//need to paste in newQuests var in console because its not json
var newQuests = {};

//ugh gotta deal with like weird shit.
function runOnTree(rootNode, runFunc, startVal, isLeafFunc=elementsUndefinedOrNull){
	var newval = startVal;
	if(isLeafFunc(rootNode)){
		newval += runFunc(rootNode);
	}
	else{
		for(node of rootNode.elements){
			newval = runOnTree(node,runFunc,newval,isLeafFunc);
		}
	}
	return newval;
}

//ok new step 0: normalize data
function normalize(root,currentParents = []){
	if(root.elements == null){
		root.category = currentParents;
		return [root];
	}
	else{
		retval = [];
		for(e of root.elements){
			retval = retval.concat(normalize(e,currentParents.concat([root.name])));
		}
		return retval;
	}
}



function mapSingleQuest(oldJsonData){
	var newData = newBooks.find(x=>x.name == oldJsonData.name);
	if(newData == null){
		console.log("no match found for "+oldJsonData.name+"(id "+oldJsonData.id+")");
	}
	questToIdMapv3.push({id:oldJsonData.id,formId:"0x"+newData?.formId.toString(16).toUpperCase().padStart(8,"0")});
}

var questToIdMapv3 = [];
runOnTree(jsondata.quest, mapSingleQuest, 0);

//now copy questToIdMapv3 as your mapping.json file
// and run formattin:
// s/{\s*\r\n\s*"/{"/g
// s/,\r\n\s*"/,"/g
// s/"\r\n\s*}/"}/g

//ok now change questdata to use the formIDs.

var mapping;
fetch("./data/mapping_quest_v3.json").then(x=>x.json()).then(y=>mapping = y);

function replaceSingleElement(oldJsonData){
	oldJsonData.formId = mapping.find(m=>m.id == oldJsonData.id).formId;
}

runOnTree(jsondata.quest, replaceSingleElement, 0);
//now copy jsondata.xxx and format as v3 of json.
// s/\n\s*"/"/g
// s/"id":\s*\d*,//g
// s/\n\s*\}/}/g
