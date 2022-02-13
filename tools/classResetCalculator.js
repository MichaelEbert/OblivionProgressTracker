"use strict";

const ATTRIBUTES = {
    "strength"    : "Strength",
    "intelligence": "Intelligence",
    "willpower"   : "Willpower",
    "agility"     : "Agility",
    "speed"       : "Speed",
    "endurance"   : "Endurance",
    "personality" : "Personality",
    "luck"        : "Luck"
};

// TODO: fill this in with json values
// Using high elf female stats for now...
var racialAttributes = {
    "Strength": 30,
    "Intelligence": 50,
    "Willpower": 40,
    "Agility": 40,
    "Speed": 40,
    "Endurance": 30,
    "Personality": 40,
    "Luck": 50
};

// TODO: fill this in with json values
// Using Steed attributes for now.
var birthsignAttributes = {
    "Strength": 0,
    "Intelligence": 0,
    "Willpower": 0,
    "Agility": 0,
    "Speed": 20,
    "Endurance": 0,
    "Personality": 0,
    "Luck": 0
};

var favoredAttribute1Name = ATTRIBUTES.strength;
var favoredAttribute2Name = ATTRIBUTES.speed;
var resetLevel = 1;

var skillGovernAttributeMap = {};

var skillSpecializeMap = {};

var birthsign = "Steed";

async function init(){
    //make sure skill names n stuff are loaded first
    await loadJsonData("..");

    initCharacterFields();
    initAttributes();

    initSkills();
    

    //finally, after setup is done, update for the first time.
    onUpdate();
}

/**
 * Initialize the values in the "character" section of the calculator.
 */
function initCharacterFields(){
    const resetLevelField = document.getElementById("inputResetLevel");
    resetLevelField.addEventListener('change',()=>{
        resetLevel = resetLevelField.value;
        onUpdate();
    });
    //...and update initial value from html:
    resetLevel = resetLevelField.value;
}

/**
 * Populate attribute names in favored attribute dropdowns and add rows to base/leveled stats.
 * Additionally set up onChange formats for attributes.
 */
function initAttributes(){
    //attributes need to be populated in 3 places: favored attribute 1, favored attribute 2, and base/lvld stats.
    const favoredAttribute1Element = document.getElementById("inputAttr1");
    const favoredAttribute2Element = document.getElementById("inputAttr2");
    const attributeTable = document.getElementById("attributeTable");
    for(const attribName in ATTRIBUTES){
        const attrib = ATTRIBUTES[attribName];
        let e = document.createElement("OPTION");
        e.value = attrib;
        e.innerText = attrib;
        favoredAttribute1Element.appendChild(e);

        let f = document.createElement("OPTION");
        f.value = attrib;
        f.innerText = attrib;
        favoredAttribute2Element.appendChild(f);

        //for the table, we ahve to create more framework stuff.
        let tableRow = document.createElement("TR");

        let cellAttributeName = document.createElement("TD");
        cellAttributeName.innerText = attrib;
        tableRow.appendChild(cellAttributeName);

        let cellAttributeBase = document.createElement("TD");
        cellAttributeBase.id = attrib + "_base";
        cellAttributeBase.innerText = 0;
        tableRow.appendChild(cellAttributeBase);

        let cellAttributeLeveled = document.createElement("TD");
        cellAttributeLeveled.id = attrib + "_leveled";
        cellAttributeLeveled.innerText = 0;
        tableRow.appendChild(cellAttributeLeveled);

        attributeTable.appendChild(tableRow);
    }
    //while we're here, set up onChange() handlers to update favoredAttribute variables when they are changed in the html.
    favoredAttribute1Element.addEventListener('change', ()=>{
        favoredAttribute1Name = favoredAttribute1Element.value;
        onUpdate();
    });
    favoredAttribute2Element.addEventListener('change', ()=>{
        favoredAttribute2Name = favoredAttribute2Element.value;
        onUpdate();
    });
    //finally, set the default values of the skill elements.
    favoredAttribute1Element.value = favoredAttribute1Name;
    favoredAttribute2Element.value = favoredAttribute2Name;
}

//put skill checkboxes here first so we can sort them alphabetically
var skillCheckboxContainers = [];
var skillTableRows = [];


// Used for restricting # of skills to 7
var numSelectedSkills = 0;

/// Run when a major skill is changed.
function modifySkill(skillBox) {
    let isAdd = skillBox.checked;
    if (isAdd) {
	numSelectedSkills += 1;

	// If 7 skills are selected, gray out adding any more.
	if (numSelectedSkills >= 7) {
	    for (var checkbox of skillCheckboxContainers ){
		if (!checkbox.childNodes[0].checked) {
		    checkbox.childNodes[0].disabled = true;
		}
	    }
	}
    }
    else {
	// If less than 7 skills are selected, allow selection
	if (numSelectedSkills == 7) {
	    for (var checkbox of skillCheckboxContainers ){
		if (!checkbox.childNodes[0].checked) {
		    checkbox.childNodes[0].disabled = false;
		}
	    }
	}
	numSelectedSkills -= 1;
    }
    // Call general update for skill calculations
    onUpdate();
}

function initSkills(){
    //populate 'major skill' checkboxes
    runOnTree(jsondata.skill, initSingleSkill);
    //children[1] is the label, so we can sort on that
    skillCheckboxContainers.sort((a,b)=>a.children[1].innerText > b.children[1].innerText);

    let majorSkillsCheckboxesElement = document.getElementById("majorSkillsCheckboxes");
    for(var container of skillCheckboxContainers){
        majorSkillsCheckboxesElement.appendChild(container);
	container.addEventListener('change', e => { // Monitor changes in these boxes.
	    modifySkill(e.target);
	});
    }

    //first sort by governing attrib, then by specialization
    skillTableRows.sort((a,b)=>a.children[0].innerText > b.children[0].innerText);
    //TODO: uncomment after we add specialization
    //skillTableRows.sort((a,b)=>a.children[1].innerText > b.children[1].innerText);

    const skillTable = document.getElementById("skillTable");
    for(var row of skillTableRows){
        skillTable.appendChild(row);
    }
}


function initSingleSkill(skill){
    //the checkbox and its text aren't associated, so we have to wrap them in another element so they're next to each other
    let skillCheckboxWrapper = document.createElement("DIV");

    //create the actual checkbox that can be clicked.
    let skillCheckbox = document.createElement("INPUT");
    skillCheckbox.type = "checkbox";
    //to reference this checkbox later, do document.getElementById with this ID
    skillCheckbox.id = "skill"+skill.formId;
    skillCheckboxWrapper.appendChild(skillCheckbox);

    //create the label for the checkbox.
    let skillName = document.createElement("LABEL");
    skillName.for = "skill"+skill.formId;
    skillName.innerText = skill.name;
    skillCheckboxWrapper.appendChild(skillName);

    //finally, put the label+checkbox combination in the majorSkillsCheckboxes section
    skillCheckboxContainers.push(skillCheckboxWrapper);

    //TODO: update the "skills" table with elements
    //other things you can get from the 'skill' object: skill.parent.name for specialization, skill.attribute for attribute.
    let skillRow = document.createElement("TR");
    let skillGov = document.createElement("TD");
    skillGov.innerText = skill.attribute.substring(0,3);
    skillRow.appendChild(skillGov);
    //TODO: create other cells in the skill table

    //as with the checkboxes, we want to sort these by governing attribute, so put them in an array and then sort them later.
    skillTableRows.push(skillRow);


    skillGovernAttributeMap[skill.formId] = skill.attribute;
    skillSpecializeMap[skill.formId] = skill.parent.name;
}

// called when user updates a value
function onUpdate(){
    // Determine which skills are major
    let majorSkillIds = [];
    for (var checkbox of skillCheckboxContainers ){
	if (checkbox.childNodes[0].checked) {
	    let m_id = checkbox.childNodes[0].id;
	    majorSkillIds.push(
		m_id.substring(5, m_id.length)); // strip out the "skill" prefix.
	}
    }
    console.log(majorSkillIds);

    // Determine the amount of skills with given governed stats.
    let attrLinkedSkills = {"Strength":0,
			    "Intelligence":0,
			    "Willpower":0,
			    "Agility":0,
			    "Speed":0,
			    "Endurance":0,
			    "Personality":0,
			    "Luck":0};
    
    for (let skid of majorSkillIds) {
	console.log(skid);
	attrLinkedSkills[skillGovernAttributeMap[skid]] += 1;
    }

    console.log(attrLinkedSkills);
    
    //update all attribute calculations
    for(let attribute in ATTRIBUTES){
	
        updateAttribute(ATTRIBUTES[attribute], attrLinkedSkills[ATTRIBUTES[attribute]]);
	
    }

    
    
}

function updateAttribute(attributeName, govStatModifier){
    //TODO: race values.
    let baseValue = racialAttributes[attributeName];
    if (attributeName != 'Luck') {
	if(favoredAttribute1Name == attributeName || favoredAttribute2Name == attributeName){
            baseValue +=5;
	}

	// Leveled states
	let leveledValue = Math.round(Math.min(100, baseValue + ((0.6  + 0.8 * govStatModifier) * (resetLevel-1))));

	//Add on birth values
	leveledValue += birthsignAttributes[attributeName];

	// Subtract vampirism cure.
	
	document.getElementById(attributeName+"_leveled").innerText = leveledValue;
    }
    else {
	let leveledValue = baseValue;
	document.getElementById(attributeName+"_leveled").innerText = leveledValue;
    }

    document.getElementById(attributeName+"_base").innerText = baseValue;
    
    
}
