let mapCanvasContext;

function initMap(){
    mapCanvasContext = document.getElementById("canvas_Map").getContext("2d");
    var img = document.createElement("img");
    img.src = "images/Cyrodil_Upscaled.png";
    img.onload = function(){
        mapCanvasContext.drawImage(img, 0, 0, 548, 500);
    }
    
    

    //lets us keep on listening until the iframe container loads, 
    //  since we copy our size from that for this.
    window.addEventListener("mousemove", positionMap); 
}

// Positions and sizes map correctly under the Iframe
// Also adds event listener for when Iframe is resized via onclick.
function positionMap(){
    if(document.getElementById("iframeContainer")){
        var ifc = document.getElementById("iframeContainer");
        ifc.onclick = positionMap;
        window.removeEventListener("mousemove", positionMap); //trim listener, it's served it's purpose.

        var c = document.getElementById("canvas_Map");
        c.style.top = (ifc.clientHeight + 48).toString() + "px";
        c.style.width = ifc.clientWidth + "px";

        mapCanvasContext.drawImage(img, 0, 0, ifc.clientHeight + 48, ifc.clientWidth);
    }
    else{
        var c = document.getElementById("canvas_Map")
        c.style.top = "548px"; //3em + 500px
        c.style.width = "500px";
        mapCanvasContext.drawImage(img, 0, 0, 548, 500);
    }
}