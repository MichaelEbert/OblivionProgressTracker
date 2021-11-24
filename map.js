//TODO: Figure out Random Gate tracking?
    //seperate counter for found random gates?
//TODO: Add pink circle for fixed gates (like guide)
//TODO: Add green plus for 2 fame gates
//TODO: add blue star for no-reroll gates

//TODO: add a legend overlay button (replace exploration button?)

//TODO: make it so that it zooms into middle of screen rather than top left corner? *Wishlist

//TODO: figure out how discovered locations are tracked and implement it.

//TODO: convert _TA from worldspace to map space.

"use strict";
export {initMap, worldSpaceToMapSpace, mapSpaceToScreenSpace, iconH, iconSwitch, icons};

import {Point} from "./map/point.mjs";
import {MapObject,MapIcon} from "./map/mapObject.mjs";


let _TA = [
    {"x":131470,"y":135656},
    {"x":128415,"y":133572},
    {"x":121678,"y":127784},
    {"x":129239,"y":125072},
    {"x":127902,"y":118634},
    {"x":131213,"y":98663},
    {"x":139963,"y":95061},
    {"x":137486,"y":92106},
    {"x":147693,"y":84351},
    {"x":139975,"y":79852},
    {"x":140451,"y":67302},
    {"x":144254,"y":64556},
    {"x":139296,"y":54685},
    {"x":133362,"y":64225},
    {"x":132378,"y":72254},
    {"x":126857,"y":72010},
    {"x":119838,"y":80270},
    {"x":110810,"y":95984},
    {"x":112329,"y":104595},
    {"x":112423,"y":108220},
    {"x":107872,"y":117135},
    {"x":100175,"y":105337},
    {"x":94565,"y":88203},
    {"x":75723,"y":83177},
    {"x":81088,"y":94412},
    {"x":78518,"y":106584},
    {"x":71612,"y":102223},
    {"x":61511,"y":100234},
    {"x":55326,"y":112149},
    {"x":45783,"y":121154},
    {"x":34561,"y":133259},
    {"x":28506,"y":119103},
    {"x":18554,"y":116327},
    {"x":15195,"y":106548},
    {"x":13009,"y":102949},
    {"x":17178,"y":95292},
    {"x":17538,"y":80749},
    {"x":28997,"y":81694},
    {"x":36376,"y":103358},
    {"x":47493,"y":107132},
    {"x":48479,"y":102739},
    {"x":50804,"y":87399},
    {"x":51021,"y":78384},
    {"x":60768,"y":75680},
    {"x":64743,"y":60965},
    {"x":64913,"y":56657},
    {"x":59243,"y":48008},
    {"x":44411,"y":52511},
    {"x":39456,"y":31533},
    {"x":22945,"y":29944},
    {"x":17295,"y":27357},
    {"x":21348,"y":24504},
    {"x":26217,"y":19226},
    {"x":34590,"y":12732},
    {"x":42999,"y":10811},
    {"x":38875,"y":19722},
    {"x":43872,"y":18081},
    {"x":51593,"y":18876},
    {"x":65479,"y":23876},
    {"x":76493,"y":15095},
    {"x":88670,"y":20963},
    {"x":87343,"y":28961},
    {"x":83900,"y":39702},
    {"x":75935,"y":55010},
    {"x":82196,"y":66339},
    {"x":96469,"y":63205},
    {"x":104676,"y":65675},
    {"x":98914,"y":49191},
    {"x":99206,"y":41665},
    {"x":110535,"y":36118},
    {"x":112410,"y":14763},
    {"x":107565,"y":12612},
    {"x":95277,"y":12621},
    {"x":100124,"y":3829},
    {"x":98201,"y":-10832},
    {"x":99217,"y":-23254},
    {"x":113406,"y":-23533},
    {"x":112467,"y":-19491},
    {"x":115283,"y":-14607},
    {"x":134790,"y":-22092},
    {"x":137947,"y":-17396},
    {"x":132921,"y":-5553},
    {"x":132777,"y":5416},
    {"x":132763,"y":10263},
    {"x":129077,"y":29267},
    {"x":126172,"y":44026},
    {"x":129172,"y":46685},
    {"x":141209,"y":42571},
    {"x":144474,"y":35249},
    {"x":153134,"y":47246},
    {"x":165768,"y":34317},
    {"x":149010,"y":12877},
    {"x":157631,"y":6311},
    {"x":161452,"y":-5599},
    {"x":174756,"y":3738},
    {"x":176575,"y":8025},
    {"x":189649,"y":-3042},
    {"x":196325,"y":-15451},
    {"x":180701,"y":-27563},
    {"x":173366,"y":-18930},
    {"x":172712,"y":-13537},
    {"x":157339,"y":-19871},
    {"x":152869,"y":-31081},
    {"x":152737,"y":-42777},
    {"x":162799,"y":-51156},
    {"x":178816,"y":-46692},
    {"x":181586,"y":-51958},
    {"x":177026,"y":-61028},
    {"x":171056,"y":-57810},
    {"x":166658,"y":-64464},
    {"x":168931,"y":-70622},
    {"x":164565,"y":-68293},
    {"x":157524,"y":-70683},
    {"x":153060,"y":-80157},
    {"x":147803,"y":-96811},
    {"x":128652,"y":-103754},
    {"x":132977,"y":-131827},
    {"x":117507,"y":-118018},
    {"x":109164,"y":-120857},
    {"x":111901,"y":-126115},
    {"x":98974,"y":-128406},
    {"x":106754,"y":-148739},
    {"x":122493,"y":-156127},
    {"x":124394,"y":-170500},
    {"x":104217,"y":-170124},
    {"x":89281,"y":-154047},
    {"x":79814,"y":-145008},
    {"x":85632,"y":-133406},
    {"x":77697,"y":-131254},
    {"x":82555,"y":-126520},
    {"x":81881,"y":-112732},
    {"x":72100,"y":-112809},
    {"x":79215,"y":-107792},
    {"x":76549,"y":-87857},
    {"x":82567,"y":-79482},
    {"x":90324,"y":-79591},
    {"x":92268,"y":-102371},
    {"x":96008,"y":-108157},
    {"x":108568,"y":-105591},
    {"x":112133,"y":-96023},
    {"x":118272,"y":-84451},
    {"x":125078,"y":-85678},
    {"x":127900,"y":-89560},
    {"x":135361,"y":-84739},
    {"x":145671,"y":-71491},
    {"x":140721,"y":-55958},
    {"x":123658,"y":-42816},
    {"x":116045,"y":-62410},
    {"x":99113,"y":-59975},
    {"x":83932,"y":-53992},
    {"x":83645,"y":-47010},
    {"x":68889,"y":-56073},
    {"x":44736,"y":-33008},
    {"x":58890,"y":-27120},
    {"x":67084,"y":-21085},
    {"x":70671,"y":-10766},
    {"x":60483,"y":3307},
    {"x":51458,"y":-10512},
    {"x":46925,"y":-1257},
    {"x":38917,"y":749},
    {"x":30400,"y":-2580},
    {"x":35066,"y":-17990},
    {"x":10274,"y":-21667},
    {"x":21639,"y":-6353},
    {"x":22058,"y":1388},
    {"x":9558,"y":1936},
    {"x":5221,"y":11052},
    {"x":-9464,"y":2234},
    {"x":-22022,"y":-3073},
    {"x":-29384,"y":-4940},
    {"x":-33713,"y":-2658},
    {"x":-41650,"y":-2911},
    {"x":-43115,"y":-14618},
    {"x":-56070,"y":-2018},
    {"x":-51974,"y":10147},
    {"x":-52000,"y":25291},
    {"x":-39729,"y":17862},
    {"x":-34188,"y":7364},
    {"x":-27252,"y":18871},
    {"x":-24816,"y":31200},
    {"x":-23112,"y":42324},
    {"x":-13291,"y":34720},
    {"x":-11667,"y":26882},
    {"x":2118,"y":30391},
    {"x":-5965,"y":41741},
    {"x":-6018,"y":49096},
    {"x":11043,"y":57007},
    {"x":1152,"y":63488},
    {"x":-2088,"y":62990},
    {"x":-14598,"y":67735},
    {"x":-30692,"y":62552},
    {"x":-46608,"y":62944},
    {"x":-47106,"y":53565},
    {"x":-39102,"y":48925},
    {"x":-43211,"y":44170},
    {"x":-55105,"y":43030},
    {"x":-60543,"y":50291},
    {"x":-56423,"y":55978},
    {"x":-67107,"y":64130},
    {"x":-63945,"y":69539},
    {"x":-75185,"y":69303},
    {"x":-75742,"y":53615},
    {"x":-67577,"y":45943},
    {"x":-67654,"y":29199},
    {"x":-77127,"y":22828},
    {"x":-91587,"y":22387},
    {"x":-97994,"y":7969},
    {"x":-84263,"y":6292},
    {"x":-84175,"y":-2392},
    {"x":-97074,"y":-5029},
    {"x":-105844,"y":-13128},
    {"x":-112897,"y":-6157},
    {"x":-113132,"y":1340},
    {"x":-108307,"y":9418},
    {"x":-111263,"y":24030},
    {"x":-116801,"y":18427},
    {"x":-129958,"y":15530},
    {"x":-128939,"y":-288},
    {"x":-130594,"y":-4228},
    {"x":-118286,"y":-15430},
    {"x":-129277,"y":-21857},
    {"x":-145906,"y":-32415},
    {"x":-151766,"y":-27079},
    {"x":-158325,"y":-38769},
    {"x":-165884,"y":-35925},
    {"x":-169688,"y":-42808},
    {"x":-178144,"y":-32679},
    {"x":-190992,"y":-23135},
    {"x":-194969,"y":-18042},
    {"x":-186045,"y":-10372},
    {"x":-173118,"y":-19279},
    {"x":-162375,"y":-16046},
    {"x":-166734,"y":2838},
    {"x":-161939,"y":9973},
    {"x":-169133,"y":12775},
    {"x":-174144,"y":6144},
    {"x":-189161,"y":2310},
    {"x":-194890,"y":3173},
    {"x":-198683,"y":-6236},
    {"x":-208980,"y":-10052},
    {"x":-212407,"y":1161},
    {"x":-202274,"y":10675},
    {"x":-193771,"y":13012},
    {"x":-182337,"y":26619},
    {"x":-178413,"y":29940},
    {"x":-171101,"y":36236},
    {"x":-156885,"y":29529},
    {"x":-149543,"y":18916},
    {"x":-147334,"y":29756},
    {"x":-135234,"y":27317},
    {"x":-134762,"y":38577},
    {"x":-138255,"y":48891},
    {"x":-117322,"y":58016},
    {"x":-103616,"y":52203},
    {"x":-112775,"y":44241},
    {"x":-108407,"y":38878},
    {"x":-100289,"y":39285},
    {"x":-85773,"y":37435},
    {"x":-89684,"y":43045},
    {"x":-84728,"y":55264},
    {"x":-90128,"y":59840},
    {"x":-95053,"y":74305},
    {"x":-78646,"y":88499},
    {"x":-60395,"y":90586},
    {"x":-50069,"y":82399},
    {"x":-35344,"y":78848},
    {"x":-23231,"y":83887},
    {"x":-31160,"y":97002},
    {"x":-21154,"y":96631},
    {"x":-7269,"y":90312},
    {"x":-14701,"y":108591},
    {"x":486,"y":108253},
    {"x":2819,"y":118873},
    {"x":-9552,"y":131479},
    {"x":-22330,"y":123857},
    {"x":-43796,"y":120585},
    {"x":-59309,"y":112434},
    {"x":-69353,"y":118006},
    {"x":-75134,"y":109759},
    {"x":-88830,"y":116281},
    {"x":-83085,"y":128442},
    {"x":-72113,"y":137415},
    {"x":-49098,"y":136530},
    {"x":-37923,"y":141601},
    {"x":-47329,"y":159680},
    {"x":-12396,"y":156721},
    {"x":-1823,"y":153124},
    {"x":6064,"y":150297},
    {"x":17588,"y":143178},
    {"x":9755,"y":152469},
    {"x":6418,"y":157370},
    {"x":13391,"y":160255},
    {"x":39083,"y":172021},
    {"x":46067,"y":166045},
    {"x":53880,"y":152660},
    {"x":43522,"y":149759},
    {"x":48022,"y":140655},
    {"x":54217,"y":133251},
    {"x":61327,"y":123768},
    {"x":71495,"y":120810},
    {"x":72173,"y":128528},
    {"x":82103,"y":129808},
    {"x":88106,"y":134540},
    {"x":91509,"y":133724},
    {"x":99704,"y":130284},
    {"x":111865,"y":138290},
    {"x":118870,"y":146791},
    {"x":138134,"y":142738}
]; //Test Array, remove this before finishing TSP work!*!*!*!*

/**
 * The element that contains the canvas. We can use this to query for how much of the canvas the user can see.
 */
let viewport;
let canvas;
let ctx;

let zoomLevel = 1;
let minZoom = 0.2;
let maxZoom = 3.5;

/**
 * Offset from map to screen coordinates.
 */
let screenOriginInMapCoords = new Point(0,0);
let _iconH = 20;
function iconH(){return _iconH;};
let currentOverlay = "Locations"; // Locations, NirnRoute, Exploration.
let hoverLocation = "";
let drawTSP = true;//draw traveling salesman path. - should be a checkbox when we change over to UI being in HTML

//image objects
let map_topbar;
let overlay;

/**
 * Last position of the mouse. used for rendering mouseover stuff.
 */
var lastMouseLoc = new Point(0,0);
let mousedown = false;

let img_Map;
let icons = {};

async function initMap(){
    //load map cord data

    viewport = document.getElementById("wrapper_Map");

    canvas = document.createElement("CANVAS");
    canvas.id = "canvas_Map";
    canvas.width = 3544;
    canvas.height = 2895;
    viewport.appendChild(canvas);
    ctx = canvas.getContext("2d");
    initImgs().then(()=>{
        initTopbar();
        initOverlay();
        initListeners();

        //center map on imp city
        screenOriginInMapCoords = new Point(1700,885);

        drawFrame();
        console.log("map init'd");
    });
}

function drawFrame(){
    drawBaseMap();
    drawMapOverlay();
    //TODO: don't have topbar overlay map. or move topbar or something aaa idk
    map_topbar.draw(ctx);
}

/**
 * Draw base map image.
 */
function drawBaseMap(){
    //Background color behind map. //prevents map from ghosting.
    ctx.beginPath();
    ctx.fillStyle = "#FBEFD5";
    ctx.rect(0,0,viewport.clientWidth,viewport.clientHeight);
    ctx.fill();

    //main map image.
    ctx.drawImage(img_Map, screenOriginInMapCoords.x * zoomLevel, screenOriginInMapCoords.y * zoomLevel, (img_Map.width * zoomLevel), (img_Map.height * zoomLevel), 
                                    0, 0, img_Map.width, img_Map.height);
}


/*********************************
 * OVERLAY FUNCTIONS
 *  this is the icons n stuff on the map canvas.
 *********************************/
function initOverlay(){
    overlay = {
        locations : [],
        nirnroots : [],
        lastZoomLevel : zoomLevel
    }

    runOnTree(jsondata.location, function(loc){
        overlay.locations.push(new MapIcon(loc));
    });

    runOnTree(jsondata.nirnroot, function(loc){
        if(loc.cell == "Outdoors"){
            overlay.nirnroots.push(new MapIcon(loc));
        }
    });
}
/**
 * Draw icons on the map
 */
function drawMapOverlay(){
    if(zoomLevel != overlay.lastZoomLevel){
        overlay.lastZoomLevel = zoomLevel;
        for(const locIcon of overlay.locations){
            locIcon.recalculateBoundingBox();
        }
        for(const icon of overlay.nirnroots){
            icon.recalculateBoundingBox();
        }
    }
    const mouseLocInMapCoords = screenSpaceToMapSpace(lastMouseLoc);
    //Overlay Else if chain
    if(currentOverlay == "Locations"){
        if(drawTSP){
            for(let i = 1; i < _TA.length; i++){
            
                let pp = mapSpaceToScreenSpace(worldSpaceToMapSpace(new Point(_TA[i - 1].x,_TA[i - 1].y)));
                let p = mapSpaceToScreenSpace(worldSpaceToMapSpace(new Point(_TA[i].x,_TA[i].y)));
                
                ctx.beginPath();
                ctx.lineWidth = 5;
                ctx.moveTo(pp.x, pp.y);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            }
        }
        
        let hloc = null; //tracks hovered location index to redraw it last.
        for(const locIcon of overlay.locations){
            //this call we don't have to include mouseLoc because if mouseLoc is true, we will redraw later.
            locIcon.draw(ctx);
            if(locIcon.contains(mouseLocInMapCoords)){
                hloc = locIcon;
            }
        }

        //last icon in array was just drawn, so redraw hovered icon so it appears on top of everything else.
        if(hloc != null){
            hloc.draw(ctx, mouseLocInMapCoords);
        }
    }
    else if(currentOverlay == "NirnRoute"){
        let hloc = null; //tracks hovered location index to redraw it last.
        for(const nirnIcon of overlay.nirnroots){
            nirnIcon.draw(ctx);
            if(nirnIcon.contains(mouseLocInMapCoords)){
                hloc = nirnIcon;
            }
        }
        if(hloc != null){
            hloc.draw(ctx, mouseLocInMapCoords);
        }
    }
    else if(currentOverlay == "Exploration"){//We may not really need this third overlay, since we can just draw the TSP underneath the normal icons.
        //traveling salesmen overlay.
        var x = viewport.clientWidth;
        var y = viewport.clientHeight;

        ctx.beginPath();
        ctx.fillStyle = "#FBEFD5";
        ctx.rect(x/2 - 125, y/2 - 75, 250, 150);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "#E5D9B9";
        ctx.rect(x/2 - 100, y/2 - 50, 200, 100);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.font = "16px Arial";
        ctx.fillText("Not yet implemented. :(", x/2 , y/2);
        ctx.fill();
    }
}

/**
 * Handle click on the overlay layer.
 * @param {Point} lastMouseLoc screen space coordinates of mouse click
 * @returns if click was handled (ie, something was clicked on)
 */
function overlayClick(clickLoc){
    //overlay coordinates are all in map space, so we convert to that before checking.
    const clickLocInMapSpace = screenSpaceToMapSpace(clickLoc);
    if(currentOverlay == "Locations"){
        for(const icon of overlay.locations){
            if(icon.contains(clickLocInMapSpace)){
                console.log("location "+icon.cell.formId+"("+icon.cell.name+") clicked");
                return true;
            }
        }
    }
    else if(currentOverlay == "NirnRoute"){
        for(const icon of overlay.nirnroots){
            if(icon.contains(clickLocInMapSpace)){
                console.log("nirnroot "+icon.cell.formId+" clicked");
                return true;
            }
        }
    }
    return false;
}

/*********************************
 * TOPBAR FUNCTIONS
 *  this is the "topbar" on the map canvas.
 *********************************/

function initTopbar(){
    function MapButton(ordinal,y,height,text){
        MapObject.call(this);
        this.ordinal = ordinal;
        //this.minX and this.maxX calculated by recalculateBoundingBox
        this.minY = y;
        this.maxY = y+height;
        this.name = text;
        this.recalculateBoundingBox();
        
    }
    MapButton.prototype = Object.create(MapObject.prototype);
    MapButton.prototype.draw = function(ctx){
        let width = this.width();
        let height = this.height();
        ctx.beginPath();
        if(currentOverlay == this.name){
            ctx.fillStyle = "#ccc";
        }
        else{
            ctx.fillStyle = "#E5D9B9";
        }
        ctx.fillRect(this.minX, this.minY, width, height);

        //and now text
        ctx.beginPath();
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.font = "16px Arial"
        ctx.fillText(this.name, this.minX + (width/2), this.minY + 16);
    }
    MapButton.prototype.recalculateBoundingBox = function(){
        this.minX = 8 + (map_topbar.width()/3)*this.ordinal;
        this.maxX = this.minX + (map_topbar.width() - 16)/3;
    }

    map_topbar = new MapObject();
    map_topbar.buttons = [];
    map_topbar.minX = 0;
    map_topbar.minY = 0;
    map_topbar.maxX = viewport.clientWidth;
    map_topbar.maxY = 32;

    map_topbar.buttons.push(new MapButton(0, 6, 20, "Locations"));
    map_topbar.buttons.push(new MapButton(1, 6, 20, "NirnRoute"));
    map_topbar.buttons.push(new MapButton(2, 6, 20, "Exploration"));

    map_topbar.draw = function(ctx){
        let wX = viewport.clientWidth;

        //update our width here for hit detection
        if(this.maxX != wX){
            this.maxX = wX;
            for(const btn of this.buttons){
                btn.recalculateBoundingBox();
            }
        }
        

        //overlay background
        ctx.beginPath();
        ctx.fillStyle = "#FBEFD5";
        ctx.rect(0,0, wX,32);
        ctx.fill();

        //overlay buttons
        for(const btn of this.buttons){
            btn.draw(ctx);
        }

        //overlay button dividers.
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.rect(wX/3, 6, 1, 20);
        ctx.rect(wX/3*2, 6, 1, 20);
        ctx.fill();
    }

    map_topbar.click = function topbarClick(coords){
        if(!this.contains(coords)){
            return false;
        }
        
        for(const btn of this.buttons){
            if(btn.contains(coords)){
                currentOverlay = btn.name;
                return true;
            }
        }
        return false;
    }
}



/*********************************
 * GENERAL FUNCTIONS
 *  this is the "topbar" on the map canvas.
 *********************************/
/**
 * Move the map by the specified amount
 * @param {Point} delta delta x and y to move the map, in screen space coords
 */
function moveMap(delta){
    //increment based on mouse movement
    if(delta){
        screenOriginInMapCoords.x -= delta.x;
        screenOriginInMapCoords.y -= delta.y;
    }
    
    //clamp values to prevent moving map off screen.
    if(screenOriginInMapCoords.x < 0) screenOriginInMapCoords.x = 0;
    if(screenOriginInMapCoords.y < 0) screenOriginInMapCoords.y = 0;

    const currentMapWidth = img_Map.width / zoomLevel;
    const currentMapHeight = img_Map.height / zoomLevel;
    const maxScreenOriginX = Math.max(0,currentMapWidth - viewport.clientWidth);
    const maxScreenOriginY = Math.max(0,currentMapHeight - viewport.clientHeight);
    screenOriginInMapCoords.x = Math.min(screenOriginInMapCoords.x, maxScreenOriginX);
    screenOriginInMapCoords.y = Math.min(screenOriginInMapCoords.y, maxScreenOriginY);
}

async function initImgs(){
    return new Promise((resolve, reject) =>{
        var iconsToInit = [
            "Ayleid",
            "Camp",
            "Fort",
            "Gate",
            "Cave",
            "Inn",
            "Settlement",
            "Mine",
            "Landmark",
            "Shrine",
            "Nirnroot",
            "Check",
            "X"
        ];
    
        iconsToInit.forEach(function(i){
            icons[i] = document.createElement("IMG");
            icons[i].width = 48;
            icons[i].height = 48;
            icons[i].src = "images/Icon_" + i + ".png";
            }
        )

        img_Map = document.createElement("img");
        img_Map.width = 3544;
        img_Map.height = 2895;
        img_Map.src = "images/Cyrodil_Upscaled.webp";
        img_Map.onload = function(){
            resolve();
        };

        img_Map.onerror = function(){
            reject(this);
        };  
    });
}

function onMouseClick(mouseLoc){
    if(window.debug){
        console.log("click at screen: " + mouseLoc+", map: "+screenSpaceToMapSpace(mouseLoc));
    }
    let handled = map_topbar.click(mouseLoc);
    if(!handled){
        handled = overlayClick(mouseLoc);
    }
    if(handled){
        drawFrame();
    }
}

function initListeners(){
    const CLICK_LIMIT_PIXELS = 8;
    const CLICK_LIMIT_DOWN_MS = 150;

    /**
     * mouse down location
     */
    let mouseDownLoc = {x:null,y:null}
    let clickStartTime;
    let isDown = false;
    viewport.addEventListener("mousedown", function(event){
        mouseDownLoc = new Point(event.offsetX, event.offsetY);
        lastMouseLoc = new Point(event.offsetX, event.offsetY);
        clickStartTime = Date.now();
        isDown = true;
    });
    viewport.addEventListener("mousemove",function(event){
        //if mouse is down, we're dragging. probably.
        // if user moves mouse while clicking, map will drag slightly. oh well.
        lastMouseLoc = new Point(event.offsetX, event.offsetY);
        if(isDown){
            moveMap({x:event.movementX, y:event.movementY});
        }
        // regardless of whether we are down or not, we need to redraw the scene?
        // TODO: only redraw if we dragged or move on to or off of an icon?
        drawFrame();
    });
    viewport.addEventListener("mouseup", function(event){
        lastMouseLoc = new Point(event.offsetX, event.offsetY);
        isDown = false;
        //yay we get to interpret clicks on our own! /s
        if(Math.abs(mouseDownLoc.x - event.offsetX) < CLICK_LIMIT_PIXELS &&
            Math.abs(mouseDownLoc.y - event.offsetY) < CLICK_LIMIT_PIXELS &&
            Date.now() - clickStartTime < CLICK_LIMIT_DOWN_MS){
                onMouseClick(lastMouseLoc);
        }
        //TODO: handle double clicks
    });
    viewport.onmouseout = function(){isDown = false;};
    viewport.onwheel = function(e){    
        
        e.preventDefault();
        const zoomPoint = new Point(e.offsetX, e.offsetY);
        if(e.deltaY > 0){ 
        updateZoom(0.2, zoomPoint);
        }
        else {
            updateZoom(-0.2, zoomPoint);
        }
        
        drawFrame();
    };
}

function updateZoom(deltaZ, zoomPoint){
    const ICON_NATIVE_HEIGHT = 20;
    let oldZoom = zoomLevel;
    zoomLevel += deltaZ;
    //clamp zoom
    if(zoomLevel > maxZoom) zoomLevel = maxZoom;
    if(zoomLevel < minZoom) zoomLevel = minZoom;

    if(oldZoom == zoomLevel){
        return;
    }

    //adjust icon size
    var m_iconH = ICON_NATIVE_HEIGHT / zoomLevel;
    if(zoomLevel > 1.75)m_iconH = ICON_NATIVE_HEIGHT / zoomLevel * 2;
    else if(zoomLevel > 1.5)m_iconH = ICON_NATIVE_HEIGHT / zoomLevel * 1.5;
    else if(zoomLevel > 1.25)m_iconH = ICON_NATIVE_HEIGHT / zoomLevel * 1.25;
    _iconH = m_iconH;

    //make map zoom in to zoomPoint.
    //1: calculate current zoomPoint in map coords
    //2. calculate where that point is on the new map
    //3. calculate where the corner needs to be to set that point as the center
    let oldCenterMapCoord = screenSpaceToMapSpace(zoomPoint);
    let newCenterMapCoord = oldCenterMapCoord.multiply(oldZoom/zoomLevel);
    let newCornerMapCoord = newCenterMapCoord.subtract(zoomPoint);

    //moveMap takes a delta, so we subtract new from old. 
    moveMap(screenOriginInMapCoords.subtract(newCornerMapCoord));
}

//converts worldspace cords into map coords.
//this is a pixel measurement from upper left of map image.
function worldSpaceToMapSpace(point){
    //first, we convert world space into map space.
    var MapW = img_Map.width;
    var MapH = img_Map.height;
    const worldW = 480000;
    const worldH = 400000;
    
    //world coords are -240,000 to 240,000 in the x direction
    //and -200,000 to 200,000 in the y direction

    //for most things, we store the "map coords", and then that gets converted to viewport(aka canvas) coords with simple vector addition at draw time.

    //first, convert to positive number between 0 and 1.
    let fraction_x = (Math.round(point.x) + worldW / 2) / worldW;
    let fraction_y = (-Math.round(point.y) + worldH / 2) / worldH;

    //then adjust for the new map height/width.
    let map_x = (MapW * fraction_x) / zoomLevel;
    let map_y = (MapH * fraction_y) / zoomLevel;

    return new Point(map_x, map_y);
}

/**
 * Convert a point in map space to a point in screen space.
 * @param {Point} mapSpacePoint 
 * @returns {Point} screen space point
 */
function mapSpaceToScreenSpace(mapSpacePoint){
    return mapSpacePoint.subtract(screenOriginInMapCoords);
}

/**
 * Convert a point in screen space to a point in map space.
 * @param {Point} screenSpacePoint 
 * @returns {Point} map space point
 */
function screenSpaceToMapSpace(screenSpacePoint){
    return screenSpacePoint.add(screenOriginInMapCoords);
}

function iconSwitch(Input){
    switch (Input) {
        case "Ayleid":return icons.Ayleid;
        case "Camp": return icons.Camp;
        case "Cave": return icons.Cave;
        case "Fort": return icons.Fort;
        case "Gate": return icons.Gate;
        case "Inn": return icons.Inn;
        case "Landmark": return icons.Landmark;
        case "Mine": return icons.Mine;
        case "Settlement": return icons.Settlement;
        case "Shrine": return icons.Shrine;
        case "Nirnroot": return icons.Nirnroot;
            
        default: 
            console.warn("Element has invalid iconname: " + Input + ".");
            return icons.X;
    }
}