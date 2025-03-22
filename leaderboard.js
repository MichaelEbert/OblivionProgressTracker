function Game(game, elements){
    this.game = game;
    this.elements = elements;
}

//Converting the leaderboard into an array of games, each with multiple leaderboard categories, each with array of runs for that category.
var games = [];
async function init(){
    //Set up the initial games->leaderboards->runs array using JSON file.
    await fetch("leaderboard.json")
        .then(response => response.json())
        .then((data) => {
            for(const g of data){
                games.push(new Game(g.game, g.elements));
            }
        }).catch(e => {console.log(e)});

    //Sort every speedrun array by fastest time, sort every casual array by earliest date.
    var gameDrop = document.getElementById("gameDrop"); //Set up the dropdowns while we are here.
    games.forEach(g => { //iterate through each game       
        //Populate the dropdown for game leaderboards with each new game we iterate through.
        var option = g.game;
        var element = document.createElement("option");
        element.textContent = option;
        element.value = option;
        if(option == "Oblivion"){ //Make Oblivion the default.
            element.selected = "selected";
        }
        gameDrop.appendChild(element);
        getCategoryDrop(); //update this now that gameDrop is set up.

        //Iterate through and sort all of the leaderboards
        g.elements.forEach(c => {    //iterate through each category
            var sortBy = c.sortBy;
            c.elements.sort(function(a, b) { //sort each category leaderboard by its default value.
                if(sortBy == "time"){
                    return timeReformat(a.time) - timeReformat(b.time);
                }
                else if(sortBy == "date"){
                    return dateReformat(a.date) - dateReformat(b.date);
                }
                else{
                    return 0;
                }
            });
        });
    });

    //Make "Show Obsolete" checked by default for now.
    document.getElementById("showObsolete").checked = true;

    //Make it so any user changeable form options will update the table.
    document.getElementById("gameDrop").addEventListener('change',gameUpdate); //this will update the categoryDrop first, triggering update as well.
    document.getElementById("categoryDrop").addEventListener('change',update); //otherwise, these skip the categoryDrop refresh to avoid Speedrun default.
    document.getElementById("showObsolete").addEventListener('change',update);
    update();
}

//When changing game, need to refresh the categoryDrop before updating.
function gameUpdate(){
    getCategoryDrop();
    update();
}

//The main updating function for whenever the user changes their filtering options.
function update(){
    //Take in the user input.
    let gameDrop = document.getElementById("gameDrop").value;
    let categoryDrop = document.getElementById("categoryDrop").value;
    let showObsolete = document.getElementById("showObsolete").checked;
    let leaderboard = games.find(g => g.game === gameDrop).elements.find(c => c.category === categoryDrop).elements; //searches the games array for the matching game and category to find the array of runs to display.

    //Create the table and headers
    let newTable = document.createElement("TABLE");
    newTable.id = "leaderboardTable";
    let th = document.createElement("TR");
    for(const e of ["#","Runner","Time","Route","Date","Link"]){//Create the table headers
        let cell = document.createElement("TH");
        cell.innerText = e;
        th.appendChild(cell);
    }
    newTable.append(th);

    //Populate the table with the first 100 runs from the current gameDrop and categoryDrop.
    var obsoleteArray = []; //for tracking which runners to filter out if user has showObsolete unchecked.

    //The leaderboard is already properly sorted during the init(), so we can take the first appearance of each runner if not showing obsolete runs.
    var rank = 1;
    leaderboard.forEach(r => {
        if(showObsolete == true){ //if the user doesn't want to filter out runs, show it no matter what.
            newTable.appendChild(display(r, rank));
            rank++;
        }
        else { //if the user wants to filter out runs.
            if(obsoleteArray.indexOf(r.runner) == -1){//Only add run if the name isn't already added to the leaderboard.
                newTable.appendChild(display(r, rank));
                obsoleteArray.push(r.runner); //add their name for future filtering.
                rank++;
            }
        }
    });

    //Replace the old table with the new one.
    document.getElementById("leaderboardTable").replaceWith(newTable);
}

//Makes a single table row out of a run's data.
function display(run, rank){
    let html = document.createElement("TR");
    //add the rank to the row before adding actual run data.
    run.rank = rank;
    for(const r of ["rank","runner","time","route","date","link"]){//Iterate through each Run key and add its value to the table row.
        let cell = document.createElement("TD");
        let value = run[r];
        if(r == "rank") {//ranks have medals for the top three runs.
            if(value == 1){ cell.innerText = '🥇'; }
            else if(value == 2){ cell.innerText = '🥈'; }
            else if(value == 3){ cell.innerText = '🥉'; }
            else { cell.innerText = value; }
        }
        else if(r == "link"){ //links needs to be an actual link element.
            let link = document.createElement('a');
            link.setAttribute('href', value);
            link.setAttribute('style', "text-decoration:none;");
            link.innerText = "🔗";
            cell.appendChild(link);
        }
        else{ //all other values are just text.
            cell.innerText = value;
        }
        html.appendChild(cell);
    }
    return html;
}

//Updates the categoryDrop to be the right sublist for the gameDrop selection.
function getCategoryDrop(){
    //Get the current game and category dropdowns.
    var gameDrop = document.getElementById("gameDrop").value;
    var categories = games.find(g => g.game === gameDrop).elements;
    var html = document.getElementById("categoryDrop");

    //Clear the options from the current list.
    for(var i = html.options.length - 1; i >= 0; i--){
        html.remove(i);
    }
    //Add all the new categories to the dropdown.
    categories.forEach(c => {
        var option = c.category;
        var element = document.createElement("option");
        element.textContent = option;
        element.value = option;
        if(option == "Speedrun"){ //Make Speedrun the default category.
            element.selected = "selected";
        }
        html.appendChild(element);
    });
}

//Converts the MM/DD/YYYY format of the leaderboard into YYYY/MM/DD then parsed as a Date.
function dateReformat(date){
    var arr = date.split("/");
    arr.forEach(x => { //Converts D or M or DD or MM. (ex. 3/4 to 03/04)
        if(x.length == 1){ x = "0" + x;}
    });

    //Reorder the corrected dates
    var day = arr[1], month = arr[0], year = arr[2];
    arr[0] = year;
    arr[1] = month;
    arr[2] = day;
    
    //Return as a parsed Date object for easy comparison.
    return Date.parse(arr.join("-"));
}

//Converts the HH:MM:SS durations to seconds for easier comparison.
function timeReformat(time){
    var arr = time.split(":");
    return ( (+arr[0]) * 60 * 60 ) + ( (+arr[1]) * 60 ) + (+arr[2]); 
}