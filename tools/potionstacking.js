//Object declarations
function Effect(name, type){
    this.name = name;
    this.type = type;
}
function Ingredient(name, formId, effects, dlc, useless, notes){
    this.name = name;
    this.formId = formId;
    this.effects = effects; //Will be an array with the four effects.
    this.dlc = dlc;
    this.useless = useless;
    this.notes = notes;
}
function Potion(ingredients, stackCount){
    this.ingredients = ingredients; //an array of up to four Ingredients.
    this.stackCount = stackCount; 
}
//Setup of object arrays and execution of actual calculations.
var optionList = [];
var effects = [];
var ingredients = [];
async function init(){
    //Parse all positive effects from the JSON into the options for the positive effect dropdown.
    optionList = document.getElementById('positiveEffect').options;
    await fetch("effects.json")
        .then(response => response.json())
        .then((data) => {
            for(const eff of data){
                if(eff.type == "positive"){
                    optionList.add(new Option(eff.effect, eff.type, false));
                }
                effects.push(new Effect(eff.effect, eff.type));
            }
        }).catch(e => {console.log(e)});
    //Parse all ingredients from the JSON file into an array.
    await fetch("ingredients.json")
        .then(response => response.json())
        .then((data) => {
            for(const ing of data){
                let tempEffects = [];
                for(const eff of ["effect1","effect2","effect3","effect4"]){//Generate the effects array for the ingredient.
                    tempEffects.push(new Effect(ing[eff], findEffectTypeByName(ing[eff])));
                }
                ingredients.push(new Ingredient(ing.name, ing.formId, tempEffects, ing.dlc, ing.useless, ing.notes));
            }
        }).catch(e => {console.log(e)});
    //Any new user input options need to be added here.
    document.getElementById("positiveEffect").addEventListener('change',update);
    document.getElementById("dlcIngredients").addEventListener('change',update);
    document.getElementById("uselessIngredients").addEventListener('change',update);
    update();
}

function update(){
    var bestPotions = []; //Will have the top X number of potions.
    //Make a temp array of ingredients that removes any the user wants to filter out.
    var newIngredients = ingredients;
    if(!document.getElementById("dlcIngredients").checked){//If the user wants to filter out DLC ingredients
        newIngredients = newIngredients.filter(ing => ing.dlc == "" || ing.dlc == null); //filter to return only ingredients with no DLC specified.
    }
    if(!document.getElementById("uselessIngredients").checked){//If the user wants to filter out quest item/script effect/test ingredients.
        newIngredients = newIngredients.filter(ing => ing.useless == "" || ing.useless == null); //filter to return only ingredients with no useless traits specified.
    }

    //Recursive approach:
    //Find the first combination of two ingredients that both have the positive effect.
    //Find each combination of other two ingredients that can be added to those.
        //For each combination of four ingredients, calculate the resulting potion effects and calculate the stacking order.
        //Add the results to an array of the best potion combinations, only adding if the highest possible stack count is in the top three results.
    //Find the next combination of two starting ingredients, and repeat recursively until all combinations have been tested against the top 3 results.
    //Display results.
}

//Takes an effect name and returns its type. (positive, negative, instant, script)
function findEffectTypeByName(name){
    var effect = effects.find(eff => eff.name == name); //find the first effect that matches the name. No duplicate effect names, so this always works.
    if(effect){//some ingredients do not have all 4 effects, need to check for null.
        return effect.type;
    }
}

//checks against the ongoing array of top 3 potions to determine if the new one replaces another one, then returns an updated array.
function checkPotion(potion, bestPotions){
    var add = '';
    bestPotions.sort(); //sorted with lowest value as first index.
    for(p in bestPotions){
        if(p.stackCount < potion.stackCount){add = 'true';}//set a boolean to true if at least one of the best potions is smaller than the one being checked.
    }
    if(add){
        bestPotions.push(potion);
        bestPotions.shift(); //remove the first (lowest) value from the array.
    }//add the potion if it is in the top 3.
    return bestPotions.sort();
}