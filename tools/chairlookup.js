

function Point3d(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
}

Point3d.prototype.toString = function(){
    return `${this.x},${this.y},${this.z}`;
}

function Furniture(x,y,z,cell, locationId, name){
    this.loc = new Point3d(x,y,z);
    this.name = name;
    this.cell = cell;
    this.cellname = cell.Name;
    this.locationId = locationId;
    this.distance = 0;
}

var furnitures = [];
var furnitureJson;
async function init(){
    furnitureJson = await fetch("https://fdh.one/assets/downloads/oblivion/chairs.json").then(x=>x.json());
    if(furnitureJson == null){debugger;}
    for(const locId of Object.keys(furnitureJson)){
        for(const furn of furnitureJson[locId].Furniture){
            furnitures.push(new Furniture(furn.X, furn.Y, furn.Z, furnitureJson[locId], locId, furn.Name));
        }
    }
    document.getElementById("xIn").addEventListener('change',update);
    document.getElementById("yIn").addEventListener('change',update);
    document.getElementById("zIn").addEventListener('change',update);
    update();
}

function update(){ 
    let x = document.getElementById("xIn").value ?? 0;
    let y = document.getElementById("yIn").value ?? 0;
    let z = document.getElementById("zIn").value ?? 0;
    let point = new Point3d(x,y,z);
    
    for(let f of furnitures){
        f.distance = dist3(point, f.loc);
    }

    furnitures.sort((x,y)=>x.distance - y.distance);

    let newTable = document.createElement("TABLE");
    newTable.id = "table";
    let th = document.createElement("TR");
    for(const e of ["Name","Cell Name","Location ID","Distance","X","Y","Z"]){
        let cell = document.createElement("TH");
        cell.innerText = e;
        th.appendChild(cell);
    }
    newTable.append(th);

    for(let i = 0; i < 50; i++){
        newTable.appendChild(display(furnitures[i]));
    }
    document.getElementById("table").replaceWith(newTable);
}


function dist3(a,b){
    return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y)+(a.z-b.z)*(a.z-b.z));
}

function display(furniture){
    let html = document.createElement("TR");
    for(const e of ["name","cellname","locationId","distance"]){
        let cell = document.createElement("TD");
        let value = furniture[e];
        if(typeof(value) == "number"){
            //3 decimal places
            value = Math.round(value * 1000) / 1000;
        }
        cell.innerText = value;
        html.appendChild(cell);
    }
    cell = document.createElement("TD");
    cell.innerText = furniture.loc.x;
    html.appendChild(cell);
    cell = document.createElement("TD");
    cell.innerText = furniture.loc.y;
    html.appendChild(cell);
    cell = document.createElement("TD");
    cell.innerText = furniture.loc.z;
    html.appendChild(cell);
    return html;
}
