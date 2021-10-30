let mapCanvasContext;
let img;
let canvas;

let zoomLevel = 1;

function initMap(){
    canvas = document.getElementById("canvas_Map");
    mapCanvasContext = canvas.getContext("2d");
    
    img = document.createElement("img");
    img.width = 3544;
    img.height = 2895;
    img.src = "images/Cyrodil_Upscaled.png";

    //intializing wrpr values.
    img.onload = function(){
        var wrpr = document.getElementById("wrapper_Map")
        wrpr.style.top = "548px"; //3em + 500px
        wrpr.style.width = "500px";
        wrpr.style.height = "125px";
        drawMap();
    }

    window.addEventListener("mousemove", resizeMap)
}

// Positions and sizes map correctly under the Iframe
function resizeMap(){
    var wrpr = document.getElementById("wrapper_Map");

    if(document.getElementById("iframeContainer")){
        var ifc = document.getElementById("iframeContainer");
        var w = ifc.clientWidth + "px";

        ifc.onclick = resizeMap;
        wrpr.onclick = resizeMap;
        window.removeEventListener("mousemove", resizeMap); //trim listener, it's served it's purpose.

        wrpr.style.width = w
        wrpr.style.top = (ifc.clientHeight + 48).toString() + "px";
        canvas.style.width = w
        canvas.style.height = wrpr.style.height;
    }
    drawMap();    

}

function drawMap(){
    var aspectw = 443;
    var aspecth = 362;
    mapCanvasContext.drawImage(img, 0, 0, (img.width * zoomLevel), (img.height * zoomLevel), 
                                    0, 0, canvas.width, canvas.height);
}