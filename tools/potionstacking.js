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
    console.log(ingredients);
    //Any new user input options need to be added here.
    document.getElementById("positiveEffect").addEventListener('change',update);
    document.getElementById("dlcIngredients").addEventListener('change',update);
    document.getElementById("uselessIngredients").addEventListener('change',update);
    update();
}

function update(){
    var bestPotions = []; //Will have the top X number of potions.
    //Recursive approach:
    //Find the first combination of two ingredients that both have the positive effect.
    //Find each combination of other two ingredients that can be added to those.
        //For each combination of four ingredients, calculate the resulting potion effects and calculate the stacking order.
        //Add the results to an array of the best potion combinations, only adding if the highest possible stack count is in the top three results.
}

//Takes an effect name and returns its type. (positive, negative, instant, script)
function findEffectTypeByName(name){
    var effect = effects.find(eff => eff.name == name); //find the first effect that matches the name. No duplicate effect names, so this always works.
    if(effect){//some ingredients do not have all 4 effects, need to check for null.
        return effect.type;
    }
}