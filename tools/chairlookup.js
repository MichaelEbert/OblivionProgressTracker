//For testing purposes, an X coordinate of 23456 with all other coords blank gives you DLC and Test Cell results.
//23456, 346, 23623 shows notes in addition to dlc and test cells.

//object declarations
function Point3d(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
}

Point3d.prototype.toString = function(){
    return `${this.x},${this.y},${this.z}`;
}

function Furniture(name, location, cell, x, y, z, dlc, testCell, outdoors, notes){
    this.name = name;
    this.location = location;
    this.cell = cell;
    this.distance = 0;
    this.loc = new Point3d(x,y,z);
    this.dlc = dlc;
    this.testCell = testCell;
    this.outdoors = outdoors;
    this.notes = notes;
}

//Setting up the furnitures array for use in the other functions.
var furnitures = [];
async function init(){
    //Set up the initial furnitures array containing every chair using the JSON file to make Furniture objects.
    await fetch("chairs.json")
        .then(response => response.json())
        .then((data) => {
            for(const f of data){
                furnitures.push(new Furniture(f.name, f.location, f.cell, f.x, f.y, f.z, f.dlc, f.testCell, f.outdoors, f.notes));
            }
        }).catch(e => {console.log(e)});

    //Any new user input options need to be added here.
    document.getElementById("xIn").addEventListener('change',update);
    document.getElementById("yIn").addEventListener('change',update);
    document.getElementById("zIn").addEventListener('change',update);
    document.getElementById("dlcChairs").addEventListener('change',update);
    document.getElementById("testCellChairs").addEventListener('change',update);
    update();
}

function update(){
    //Take in user input and calculate distance of each chair from desired coords, then sort the data by nearest chairs.
    let x = document.getElementById("xIn").value ?? 0;
    let y = document.getElementById("yIn").value ?? 0;
    let z = document.getElementById("zIn").value ?? 0;
    let point = new Point3d(x,y,z);
    
    for(let f of furnitures){
        f.distance = dist3(point, f.loc);
    }

    furnitures.sort((x,y)=>x.distance - y.distance);

    //Create the table
    let newTable = document.createElement("TABLE");
    newTable.id = "table";
    let th = document.createElement("TR");
    for(const e of ["Name","Location","Cell","Distance","X","Y","Z","DLC","Test Cell","Outdoors","Notes"]){//Create the table headers
        let cell = document.createElement("TH");
        cell.innerText = e;
        th.appendChild(cell);
    }
    newTable.append(th);
    //Populate the table with the first 50 applicable chairs.
    var endCount = 50;
    for(let i = 0; i < endCount; i++){
        //Conditionals to skip filtered out chairs. Using verbose checks for empty/null strings because JavaScript is garbage and is giving an incorrect truthy value when using the variable itself as the conditional.
        if(document.getElementById("dlcChairs").checked == false && furnitures[i].dlc != "" && furnitures[i].dlc != null) {//if the user wants to skip DLC chairs and this is a DLC chair.
            endCount++; //Don't add the chair, skip and extend for loop iteration by 1.
        }
        else if(document.getElementById("testCellChairs").checked == false && furnitures[i].testCell != "" && furnitures[i].testCell != null) {//if the user wants to skip Test Cell chairs and this is a Test Cell chair.
            endCount++;
        }
        else{//if the chair doesn't apply to any of the filtered out parameters, add it to the list.
            newTable.appendChild(display(furnitures[i]));
        }
    }
    document.getElementById("table").replaceWith(newTable);
}


function dist3(a,b){//Calculates the distance between two points in three dimensional space.
    return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y)+(a.z-b.z)*(a.z-b.z));
}

//Makes a single table row out of a chair's data.
function display(furniture){
    let html = document.createElement("TR");
    for(const e of ["name","location","cell","distance"]){//Iterate through each Furniture key and add its value to the table row.
        let cell = document.createElement("TD");
        let value = furniture[e];
        if(typeof(value) == "number"){
            value = Math.round(value * 100) / 100; //2 decimal places
        }
        cell.innerText = value;
        html.appendChild(cell);
    }
    cell = document.createElement("TD");
    cell.innerText = Math.round(furniture.loc.x * 100) / 100;
    html.appendChild(cell);
    cell = document.createElement("TD");
    cell.innerText = Math.round(furniture.loc.y * 100) / 100;
    html.appendChild(cell);
    cell = document.createElement("TD");
    cell.innerText = Math.round(furniture.loc.z * 100) / 100;
    html.appendChild(cell);
    cell = document.createElement("TD");
    cell.innerText = furniture.dlc;
    html.appendChild(cell);
    for(const e of ["testCell", "outdoors"]){
        let cell = document.createElement("TD");
        let value = furniture[e];
        if(value){
            value = "✓";
        }
        cell.innerText = value;
        html.appendChild(cell);
    }
    cell = document.createElement("TD");
    cell.innerText = furniture.notes;
    html.appendChild(cell);
    return html;
}
