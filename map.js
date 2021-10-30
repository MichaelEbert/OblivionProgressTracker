let mapCanvasContext;
let img;
let canvas;

let zoomLevel = 1;
let mapX = 0;
let mapY = 0;

let mousedown = false;

let debug = true; //makes iframe and guide small by default for map function testing.

function initMap(){
    canvas = document.getElementById("canvas_Map");
    mapCanvasContext = canvas.getContext("2d");
    
    img = document.createElement("img");
    img.width = 3544;
    img.height = 2895;
    img.src = "images/Cyrodil_Upscaled.png";

    //default wrapper values.
    var wrpr = document.getElementById("wrapper_Map");

    wrpr.onmousedown = function(){
        mousedown = true;
        console.log(mousedown);
    };

    wrpr.onmouseup = function(){
        mousedown = false;
        console.log(mousedown);
    };

    wrpr.onmousemove = function(){
        if(mousedown){
            moveMap();
        }
    }

    //Init wrapper values.
    img.onload = drawMap();

    //keeping checking until iframe is loaded. //is there a better way for this?
    window.onmousemove = function(){
        if(document.getElementById("iframeContainer")){
            document.getElementById("iframeContainer").onclick = resizeMap();
            window.removeEventListener("mousemove", resizeMap); //trim listener, it's served it's purpose.
        }
    };
}

// Positions and sizes map correctly under the Iframe
function resizeMap(){
    if(document.getElementById("iframeContainer")){
        var wrpr = document.getElementById("wrapper_Map");    
        var ifc = document.getElementById("iframeContainer");

        if(debug){
            ifc.style.width = "1000px";
            ifc.style.height = "25px";
            wrpr.style.height = "580px";
        }

        

        wrpr.style.width = ifc.clientWidth + "px";
        wrpr.style.top = (ifc.clientHeight + 48).toString() + "px";
    }
    drawMap();    
}

function drawMap(){
    var aspectw = 443;
    var aspecth = 362;
    mapCanvasContext.drawImage(img, mapX, mapY, (img.width * zoomLevel), (img.height * zoomLevel), 
                                    0, 0, img.width, img.height);
}

function moveMap(){
    mapX++;
    drawMap();
}