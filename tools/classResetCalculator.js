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

const vampStats = ["0xFFFFFFEE", // acrobatics
		   "0xFFFFFFE1", // athletics
		   "0xFFFFFFEA", // destruction
		   "0xFFFFFFE5", //hand to hand
		   "0xFFFFFFEB", //Illusion
		   "0xFFFFFFEC", //Mysticism
		   "0xFFFFFFF3" //Sneak
		  ];

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

var racialSkills = {
};


var birthsignAttributes = {
    "Health": 0,
    "Magicka": 100,
    "Fatigue": 0,
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

var specialization = "Combat";

var skillGovernAttributeMap = {};

var skillSpecializeMap = {};

var birthsign = "Apprentice";

var vampFlag = false;
const vampFortifySkillAmount = 20;


var birthsignAttributeMap = {};

var raceSkillMap = {};
var raceAttributeMap = {
    "m":{},
    "f":{},
};
var currentRace = "High Elf";
var currentGender = "f";
var skillNameFormIDMap = {};


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


    const cureVampField = document.getElementById("cureVamp");
    cureVampField.addEventListener('change',()=>{
	vampFlag = cureVampField.checked;
	onUpdate();
    });
    vampFlag = cureVampField.checked;


    // Populate Birthsign
    const birthsignElement = document.getElementById("inputBirthsign");
    for (var bs of jsondata.birthsign.elements) {
	let bsName = bs.name;
	let birthsignOption = document.createElement("Option");
	birthsignOption.value = bsName;
	birthsignOption.innerText = bsName;
	birthsignElement.appendChild(birthsignOption);
	
	birthsignAttributeMap[bsName] = bs.attributes;
    }
    // Update listeners.
    birthsignElement.addEventListener('change', e => {
	//update birthsign attributes
	birthsign = e.target.value;
	birthsignAttributes = birthsignAttributeMap[birthsign];
	onUpdate();
    });
    birthsignElement.value = birthsign;
    birthsignAttributes = birthsignAttributeMap[birthsign];


    // Populate racial data
    const raceElement = document.getElementById("inputRace");
    const genderElement = document.getElementById("inputGender")
    for (var race of jsondata.race.elements[0].racevalues) {
	let raceName = race.name;
	let raceOption = document.createElement("Option");
	raceOption.value = raceName;
	raceOption.innerText = raceName;
	raceElement.appendChild(raceOption);

	raceSkillMap[raceName] = race.skills; //Note: skills are identical for both genders.

	raceAttributeMap["m"][raceName] = race.attributes;
    }
    for (var race of jsondata.race.elements[1].racevalues) { // fill in female values.
	let raceName = race.name;
	raceAttributeMap["f"][raceName] = race.attributes;
    }
    // Update listeners
    raceElement.addEventListener("change", e => {
	currentRace = e.target.value;
	racialAttributes = raceAttributeMap[currentGender][currentRace];
	racialSkills = raceSkillMap[currentRace];
	onUpdate();
    });
    raceElement.value = currentRace;
    genderElement.addEventListener("change", e => {
	currentGender = e.target.value;
	racialAttributes = raceAttributeMap[currentGender][currentRace];
	onUpdate();
    });
    genderElement.value = currentGender;
    racialSkills = raceSkillMap[currentRace];
    racialAttributes = raceAttributeMap[currentGender][currentRace];
    
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
    const specializationElement = document.getElementById("inputSpecialization")
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


    // Log specialization values.
    specializationElement.addEventListener('change', ()=>{
	specialization = specializationElement.value;
	onUpdate();
    });
    specializationElement.value = specialization;
						
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
    //skillTableRows.sort((a,b)=>a.children[0].innerText > b.children[0].innerText);
    skillTableRows.sort((a,b)=>a.id > b.id);
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
    
    // Skill Type
    let skillType = document.createElement("TD");
    skillType.id = "typeSkill_"+skill.formId;
    skillRow.appendChild(skillType);

    // Skill Name
    let skillNameE = document.createElement("TD");
    skillNameE.innerText = skill.name;
    skillRow.appendChild(skillNameE);

    let skillBase = document.createElement("TD");
    skillBase.innerText = 0;
    skillBase.id = "baseSkill_"+skill.formId;
    skillRow.appendChild(skillBase);

    let skillLeveled = document.createElement("TD");
    skillLeveled.innerText = 0;
    skillLeveled.id = "leveledSkill_"+skill.formId;
    skillRow.appendChild(skillLeveled);
    
    
    

    //as with the checkboxes, we want to sort these by governing attribute, so put them in an array and then sort them later.
    skillTableRows.push(skillRow);


    skillGovernAttributeMap[skill.formId] = skill.attribute;
    skillSpecializeMap[skill.formId] = skill.parent.name;
    skillNameFormIDMap[skill.formId] = skill.name;
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
	attrLinkedSkills[skillGovernAttributeMap[skid]] += 1;
    }

    //update all attribute calculations
    for(let attribute in ATTRIBUTES){
	
        updateAttribute(ATTRIBUTES[attribute], attrLinkedSkills[ATTRIBUTES[attribute]]);
	
    }

    // Update skill value calculations
    for (let skillId in skillSpecializeMap ) {
	updateSkills(skillId, majorSkillIds);
    }

    
    
}

function updateAttribute(attributeName, govStatModifier){
    //TODO: race values.
    let baseValue = racialAttributes[attributeName] ;
    if (attributeName != 'Luck') {
	if(favoredAttribute1Name == attributeName || favoredAttribute2Name == attributeName){
            baseValue +=5;
	}

	// Leveled states
	let leveledValue = Math.round(Math.min(100, baseValue + ((0.6  + 0.8 * govStatModifier) * (resetLevel-1)))) + birthsignAttributes[attributeName];

	// TODO: Subtract vampirism cure...
	
	document.getElementById(attributeName+"_leveled").innerText = leveledValue;
    }
    else {
	let leveledValue = baseValue + birthsignAttributes[attributeName];
	document.getElementById(attributeName+"_leveled").innerText = leveledValue;
    }

    document.getElementById(attributeName+"_base").innerText = baseValue;
    
    
}


function updateSkills(skillId, majorSkillIds) {
    
    let baseValue = 5 + racialSkills[skillNameFormIDMap[skillId]]; // TODO: modify this based on race.
    
    let multiplier = 0.1;
    let specFlag = skillSpecializeMap[skillId] == specialization;
    let majFlag = majorSkillIds.includes(skillId);
    if (specFlag) {
	multiplier += 0.5
	baseValue += 5;
    }

    if (majFlag){
	multiplier += 0.9;
	baseValue += 20;
    }

    let typeStr = "m";
    if (majFlag && specFlag) {
	typeStr = "M+S";
    }
    else if (specFlag) {
	typeStr = "S";
    }
    else if (majFlag){
	typeStr = "M";
    }
    

    let leveledValue = Math.round(Math.min(100, baseValue + multiplier * (resetLevel-1)));

    // Under/Overflow stats if vamp flag is active
    if (vampFlag && vampStats.includes(skillId)) {
	leveledValue -= vampFortifySkillAmount;
	if (leveledValue < 0) {// value has underflowed
	    leveledValue = 256 + leveledValue;
	}
    }

    
    document.getElementById("baseSkill_" + skillId).innerText = baseValue;
    document.getElementById("leveledSkill_" + skillId).innerText = leveledValue;
    document.getElementById("typeSkill_" + skillId).innerText = typeStr;
}
