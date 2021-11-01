let mapCanvasContext;
let canvas;
let wrapper;

let zoomLevel = 1;
let minZoom = 0.2;
let maxZoom = 3.5;
let mapX = 0;
let mapY = 0;

let mousedown = false;

let imgElem_Map;
let testIcon;

let debug = true; //makes iframe and guide small by default for map function testing.

function initMap(){
    canvas = document.getElementById("canvas_Map");
    mapCanvasContext = canvas.getContext("2d");
    
    imgElem_Map = document.createElement("img");
    imgElem_Map.width = 3544;
    imgElem_Map.height = 2895;
    imgElem_Map.src = "images/Cyrodil_Upscaled.png";

    testIcon = document.createElement("IMG");
    testIcon.width = 48;
    testIcon.height = 48;
    testIcon.src = "leyawiin_html_391c730c90a3a992.png";
    testIcon.onload = drawMap();

    //center map on imp city
    mapX = imgElem_Map.width/2.1;
    mapY = imgElem_Map.height/3.2;

    wrapper = document.getElementById("wrapper_Map");
    wrapper.onmousedown = function(){mousedown = true;};
    wrapper.onmouseup = function(){mousedown = false;};
    wrapper.onmouseout = function(){mousedown = false;};
    wrapper.onmousemove = function(e){
        if(mousedown){
            moveMap(e);
        }
    };
    wrapper.onwheel = function(e){zoomMap(e)};

    //attaches width to width of iframe
    window.addEventListener("mousemove", iFrameCheck);
}

function drawMap(){
    //maybe useful for placing icons.
    var aspectw = 443;
    var aspecth = 362;

    mapCanvasContext.drawImage(imgElem_Map, mapX, mapY, (imgElem_Map.width * zoomLevel), (imgElem_Map.height * zoomLevel), 
                                    0, 0, imgElem_Map.width, imgElem_Map.height);
    //draw all icons
    for(let i = 0; i < locs.length;i++){
        drawIcons(locs[i].approxX, locs[i].approxY);
    }
}

function drawIcons(iconX = 0.5, iconY = 0.5){

    var MapW = imgElem_Map.width;
    var MapH = imgElem_Map.height;
    var iconWH = 36 / zoomLevel;
    var worldW = 480000;
    var worldH = 400000;

    iconX = (iconX + worldW / 2) / worldW;
    iconY = (-iconY + worldH / 2) / worldH;

    mapCanvasContext.drawImage(testIcon, ((MapW * iconX) - mapX) / zoomLevel - iconWH, 
                                         ((MapH * iconY) - mapY) / zoomLevel - iconWH, iconWH, iconWH);
}

function moveMap(event){
    //increment based on mouse movement
    if(event){
        mapX -= event.movementX * zoomLevel;
        mapY -= event.movementY * zoomLevel;
    }
    
    //clamp values to prevent moving map off screen.
    if(mapX < 0) mapX = 0;
    if(mapY < 0) mapY = 0;
    var wStyle = document.getElementById("wrapper_Map").style;
    var wX = wStyle.width.slice(0,wStyle.width.length-2);
    var wY = wStyle.height.slice(0,wStyle.height.length-2);
    if(mapX >= imgElem_Map.width - (wX * zoomLevel)) mapX = imgElem_Map.width - (wX * zoomLevel);
    if(mapY >= imgElem_Map.height - (wY * zoomLevel)) mapY = imgElem_Map.height - (wY * zoomLevel);

    drawMap();
}

function zoomMap(event){
    event.preventDefault();
    if(event.deltaY > 0) zoomLevel += 0.2;
    else zoomLevel += -0.2;
    
    //TODO: make it so that it zooms into middle of screen rather than top left corner?

    //clamp zoom
    if(zoomLevel > maxZoom) zoomLevel = maxZoom;
    if(zoomLevel < minZoom) zoomLevel = minZoom;
    console.log(zoomLevel);
    moveMap();
}

//attaches width to width of iframe
function iFrameCheck(){
    if(document.getElementById("iframeContainer")){
        document.getElementById("iframeContainer").onclick = resizeMap;
        window.removeEventListener("mousemove", iFrameCheck); //trim listener, it's served it's purpose.
        resizeMap();
    }
}

//matches width of map to Iframe width
function resizeMap(){
    if(document.getElementById("iframeContainer")){
        var ifc = document.getElementById("iframeContainer");

        if(debug){
            ifc.style.width = "1000px";
            ifc.style.height = "25px";
            wrapper.style.height = "580px";
        }

        wrapper.style.width = ifc.clientWidth + "px";
        wrapper.style.top = (ifc.clientHeight + 48).toString() + "px";
    }
    drawMap();    
}

const locs = [
    {"name":"Atrene Camp","approxX":-198683,"approxY":-6236,"x":-198683.375,"y":-6236.9453125,"z":4376,"formId":0x000175fb},
    {"name":"Varus Camp","approxX":-182337,"approxY":26619,"x":-182336.640625,"y":26619.6328125,"z":5245.7900390625,"formId":0x000175e3},
    {"name":"Bodean Camp","approxX":-174144,"approxY":6144,"x":-174144,"y":6144,"z":6157.33984375,"formId":0x000175f5},
    {"name":"Last Chance Camp","approxX":-171101,"approxY":36236,"x":-171101.140625,"y":36235.875,"z":8106.0166015625,"formId":0x0017cf9e},
    {"name":"Troll Candle Camp","approxX":-158325,"approxY":-38769,"x":-158324.75,"y":-38769.46484375,"z":3088.58349609375,"formId":0x000175f7},
    {"name":"Camp Ales","approxX":-147334,"approxY":29756,"x":-147334.265625,"y":29756.009765625,"z":12671.814453125,"formId":0x000175f3},
    {"name":"Mortal Camp","approxX":-129277,"approxY":-21857,"x":-129277.359375,"y":-21857.94921875,"z":7074.98095703125,"formId":0x000175cd},
    {"name":"Gnoll's Meeting Camp","approxX":-118286,"approxY":-15430,"x":-118285.6796875,"y":-15430.2451171875,"z":4960.5126953125,"formId":0x00181c32},
    {"name":"Dagny's Camp","approxX":-116801,"approxY":18427,"x":-116800.640625,"y":18427.6328125,"z":7688,"formId":0x000175f9},
    {"name":"Ra'sava Camp","approxX":-112897,"approxY":-6157,"x":-112897.4296875,"y":-6157.3271484375,"z":7182.25390625,"formId":0x000175f1},
    {"name":"Brotch Camp","approxX":-112775,"approxY":44241,"x":-112775.1171875,"y":44241.81640625,"z":12690.37109375,"formId":0x000175e1},
    {"name":"Valley View Camp","approxX":-100289,"approxY":39285,"x":-100288.671875,"y":39285.1796875,"z":13344,"formId":0x000175eb},
    {"name":"Fat Ramp Camp","approxX":-84175,"approxY":-2392,"x":-84175.1640625,"y":-2392.25341796875,"z":6821.49853515625,"formId":0x00181c31},
    {"name":"gro-Bak Camp","approxX":-41650,"approxY":-2911,"x":-41650.765625,"y":-2911.6630859375,"z":5418.310546875,"formId":0x000175ef},
    {"name":"Collarbone Camp","approxX":-29384,"approxY":-4940,"x":-29384.01171875,"y":-4940.2119140625,"z":7095.74462890625,"formId":0x00181c2f},
    {"name":"Sweetwater Camp","approxX":43872,"approxY":18081,"x":43872.22265625,"y":18081.267578125,"z":1888,"formId":0x000175df},
    {"name":"Bawnwatch Camp","approxX":83645,"approxY":-47010,"x":83644.953125,"y":-47010.578125,"z":353.95703125,"formId":0x00071310},
    {"name":"Hidden Camp","approxX":91509,"approxY":133724,"x":91509.8203125,"y":133724.4375,"z":25408,"formId":0x000175d3},
    {"name":"Fisherman's Rock","approxX":96008,"approxY":-108157,"x":96008.3046875,"y":-108156.96875,"z":771.939453125,"formId":0x00086076},
    {"name":"Crestbridge Camp","approxX":107565,"approxY":12612,"x":107564.640625,"y":12611.9072265625,"z":502.7273864746094,"formId":0x000177b2},
    {"name":"Wind Range Camp","approxX":112423,"approxY":108220,"x":112423.1015625,"y":108219.8515625,"z":9520,"formId":0x000175d1},
    {"name":"Bogwater","approxX":124394,"approxY":-170500,"x":124394.234375,"y":-170500.171875,"z":2657.044921875,"formId":0x00093480},
    {"name":"Walker Camp","approxX":129239,"approxY":125072,"x":129239.2890625,"y":125071.671875,"z":16799.41015625,"formId":0x000175e9},
    {"name":"Aerin's Camp","approxX":131470,"approxY":135656,"x":131469.59375,"y":135656.015625,"z":19289.1640625,"formId":0x0017cf9c},
    {"name":"Trossan Camp","approxX":132763,"approxY":10263,"x":132762.515625,"y":10263.9375,"z":6472,"formId":0x000175db},
    {"name":"Carbo's Camp","approxX":133362,"approxY":64225,"x":133362.4375,"y":64225.70703125,"z":1539.5439453125,"formId":0x000175d7},
    {"name":"Black Dog Camp","approxX":140721,"approxY":-55958,"x":140721.4375,"y":-55958.7109375,"z":576,"formId":0x000175e5},
    {"name":"Sercen Camp","approxX":141209,"approxY":42571,"x":141209.328125,"y":42570.95703125,"z":5710.841796875,"formId":0x0017cf9f},
    {"name":"Marsh-Punk Camp","approxX":157524,"approxY":-70683,"x":157524.109375,"y":-70683.4765625,"z":3737.615234375,"formId":0x000175ed},
    {"name":"Seran Camp","approxX":168931,"approxY":-70622,"x":168931.015625,"y":-70622.84375,"z":1786.860595703125,"formId":0x0017cf9d},
    {"name":"Nayon Camp","approxX":173366,"approxY":-18930,"x":173366.40625,"y":-18930.095703125,"z":1656,"formId":0x000175dd},
    {"name":"Garnet Camp","approxX":181586,"approxY":-51958,"x":181585.546875,"y":-51958.0390625,"z":4816,"formId":0x000175e7},
    {"name":"Hrota Cave","approxX":-194969,"approxY":-18042,"x":-194969.234375,"y":-18042.4609375,"z":3730.38427734375,"formId":0x0001570b},
    {"name":"Brittlerock Cave","approxX":-169133,"approxY":12775,"x":-169132.578125,"y":12774.4716796875,"z":5793.453125,"formId":0x0001589a},
    {"name":"Smoke Hole Cave","approxX":-165884,"approxY":-35925,"x":-165883.546875,"y":-35925.1015625,"z":3818.081787109375,"formId":0x00015a38},
    {"name":"Mongrel's Tooth Cave","approxX":-135234,"approxY":27317,"x":-135233.5625,"y":27316.744140625,"z":9280.396484375,"formId":0x00015a33},
    {"name":"Sandstone Cavern","approxX":-128939,"approxY":-288,"x":-128938.71875,"y":-287.5042724609375,"z":7263.8828125,"formId":0x0001598a},
    {"name":"Fyrelight Cave","approxX":-97074,"approxY":-5029,"x":-97074.3046875,"y":-5028.591796875,"z":5509.0693359375,"formId":0x000158be},
    {"name":"Broken Promises Cave","approxX":-95053,"approxY":74305,"x":-95053.0703125,"y":74304.5546875,"z":13245.6845703125,"formId":0x000ad393},
    {"name":"Fallen Rock Cave","approxX":-91587,"approxY":22387,"x":-91586.765625,"y":22386.779296875,"z":7027.6552734375,"formId":0x000158bf},
    {"name":"Wind Cave","approxX":-90128,"approxY":59840,"x":-90128,"y":59840,"z":11217.416015625,"formId":0x000644fd},
    {"name":"Rock Bottom Caverns","approxX":-84728,"approxY":55264,"x":-84727.84375,"y":55263.828125,"z":11170.482421875,"formId":0x0002a829},
    {"name":"Bleak Flats Cave","approxX":-77127,"approxY":22828,"x":-77127.328125,"y":22828.4140625,"z":6269.29052734375,"formId":0x00048996},
    {"name":"Black Rock Caverns","approxX":-75134,"approxY":109759,"x":-75133.8046875,"y":109759.3046875,"z":16321.6142578125,"formId":0x0001598e},
    {"name":"Nonwyll Cavern","approxX":-69353,"approxY":118006,"x":-69353.03125,"y":118006.0625,"z":18932.5546875,"formId":0x00015902},
    {"name":"Goblin Jim's Cave","approxX":-67654,"approxY":29199,"x":-67654.390625,"y":29198.474609375,"z":6706.4873046875,"formId":0x00015a27},
    {"name":"Redguard Valley Cave","approxX":-60543,"approxY":50291,"x":-60543.46875,"y":50290.5,"z":8832.4755859375,"formId":0x0002aa16},
    {"name":"Serpent Hollow Cave","approxX":-56423,"approxY":55978,"x":-56423.16796875,"y":55977.51171875,"z":10993.65625,"formId":0x000159f9},
    {"name":"Bloodcrust Cavern","approxX":-56070,"approxY":-2018,"x":-56069.57421875,"y":-2018.3338623046875,"z":6853.00146484375,"formId":0x00015708},
    {"name":"Shadow's Rest Cavern","approxX":-43796,"approxY":120585,"x":-43795.73828125,"y":120584.6953125,"z":17295.7734375,"formId":0x00015a31},
    {"name":"Grayrock Cave","approxX":-39729,"approxY":17862,"x":-39729.0234375,"y":17862.185546875,"z":3535.8623046875,"formId":0x00015701},
    {"name":"Howling Cave","approxX":-33713,"approxY":-2658,"x":-33713.51171875,"y":-2657.66357421875,"z":5653.06298828125,"formId":0x00015898},
    {"name":"Breakneck Cave","approxX":-30692,"approxY":62552,"x":-30692.45703125,"y":62551.5,"z":6972.50341796875,"formId":0x00015a28},
    {"name":"Greenmead Cave","approxX":-27252,"approxY":18871,"x":-27252.38671875,"y":18871.232421875,"z":2556.41796875,"formId":0x00015244},
    {"name":"Yellow Tick Cave","approxX":-23231,"approxY":83887,"x":-23230.5546875,"y":83886.96875,"z":7309.77734375,"formId":0x00015a01},
    {"name":"Haynote Cave","approxX":-23112,"approxY":42324,"x":-23111.611328125,"y":42324.44921875,"z":5170.140625,"formId":0x00015a2b},
    {"name":"Glademist Cave","approxX":-14701,"approxY":108591,"x":-14701.1259765625,"y":108590.7109375,"z":14403.458984375,"formId":0x001883a0},
    {"name":"Echo Cave","approxX":-12396,"approxY":156721,"x":-12396.2041015625,"y":156721.1875,"z":28289.46875,"formId":0x00015247},
    {"name":"Felgageldt Cave","approxX":-11667,"approxY":26882,"x":-11667.2041015625,"y":26881.923828125,"z":2135.45751953125,"formId":0x000159d5},
    {"name":"Underpall Cave","approxX":-9552,"approxY":131479,"x":-9552.3935546875,"y":131478.984375,"z":21761.998046875,"formId":0x00015a39},
    {"name":"Nisin Cave","approxX":-9464,"approxY":2234,"x":-9463.642578125,"y":2234.016357421875,"z":3840,"formId":0x000159fb},
    {"name":"Boreal Stone Cave","approxX":-1823,"approxY":153124,"x":-1822.64794921875,"y":153124.234375,"z":27992.00390625,"formId":0x00038f40},
    {"name":"Outlaw Endre's Cave","approxX":2819,"approxY":118873,"x":2819.46826171875,"y":118873.4453125,"z":15586.1015625,"formId":0x0001598f},
    {"name":"Capstone Cave","approxX":9755,"approxY":152469,"x":9755.41015625,"y":152469.078125,"z":26700.43359375,"formId":0x000159b3},
    {"name":"Dzonot Cave","approxX":11043,"approxY":57007,"x":11043.2509765625,"y":57006.7109375,"z":31.13861083984375,"formId":0x0001598c},
    {"name":"Fingerbowl Cave","approxX":15195,"approxY":106548,"x":15194.9326171875,"y":106548.3828125,"z":8865.732421875,"formId":0x00189790},
    {"name":"Sinkhole Cave","approxX":17538,"approxY":80749,"x":17537.76171875,"y":80748.9921875,"z":767.4365844726562,"formId":0x000159b1},
    {"name":"Bruma Caverns","approxX":17588,"approxY":143178,"x":17588.189453125,"y":143177.703125,"z":26052.873046875,"formId":0x000ca3f5},
    {"name":"Unmarked Cave","approxX":18554,"approxY":116327,"x":18554.12890625,"y":116326.8125,"z":13647.5087890625,"formId":0x00015703},
    {"name":"Pothole Caverns","approxX":21639,"approxY":-6353,"x":21639.21875,"y":-6353.0693359375,"z":1791.1336669921875,"formId":0x0018843c},
    {"name":"Horn Cave","approxX":26217,"approxY":19226,"x":26216.81640625,"y":19226.435546875,"z":1781.7591552734375,"formId":0x00015a36},
    {"name":"Imperial City Sewers - North Exit","approxX":28997,"approxY":81694,"x":28997.162109375,"y":81693.875,"z":39.650390625,"formId":0x000c50d5},
    {"name":"Toadstool Hollow","approxX":34561,"approxY":133259,"x":34560.84765625,"y":133258.609375,"z":19932.244140625,"formId":0x00015707},
    {"name":"Charcoal Cave","approxX":34590,"approxY":12732,"x":34590.26171875,"y":12732.291015625,"z":3594.359375,"formId":0x000156fc},
    {"name":"Mingo Cave","approxX":38917,"approxY":749,"x":38917.14453125,"y":748.6376342773438,"z":6148.95068359375,"formId":0x000159fa},
    {"name":"Serpent's Trail","approxX":39083,"approxY":172021,"x":39083.14453125,"y":172020.53125,"z":30439.49609375,"formId":0x0000c1f0},
    {"name":"Fatback Cave","approxX":39456,"approxY":31533,"x":39456.1171875,"y":31532.76171875,"z":30.065673828125,"formId":0x000156fe},
    {"name":"Imperial Sewer - South East Exit","approxX":44411,"approxY":52511,"x":44411.3515625,"y":52510.9453125,"z":20.708099365234375,"formId":0x000c50d3},
    {"name":"Bloodmayne Cave","approxX":44736,"approxY":-33008,"x":44736,"y":-33008,"z":688,"formId":0x000158bd},
    {"name":"Moss Rock Cavern","approxX":47493,"approxY":107132,"x":47492.6640625,"y":107132.15625,"z":5172.3095703125,"formId":0x0001598b},
    {"name":"Sideways Cave","approxX":51021,"approxY":78384,"x":51020.72265625,"y":78383.8359375,"z":541.75390625,"formId":0x0006c602},
    {"name":"Robber's Glen Cave","approxX":51458,"approxY":-10512,"x":51457.83203125,"y":-10511.5849609375,"z":4584.09375,"formId":0x00015924},
    {"name":"Red Ruby Cave","approxX":54217,"approxY":133251,"x":54217.30078125,"y":133250.96875,"z":21497.529296875,"formId":0x00015a2a},
    {"name":"Memorial Cave","approxX":59243,"approxY":48008,"x":59242.8203125,"y":48008.28125,"z":211.15380859375,"formId":0x00015704},
    {"name":"Frostfire Glade","approxX":61327,"approxY":123768,"x":61326.57421875,"y":123767.984375,"z":17516.8984375,"formId":0x00024b3d},
    {"name":"Wellspring Cave","approxX":64743,"approxY":60965,"x":64743.171875,"y":60965.41015625,"z":408.443359375,"formId":0x00053fe2},
    {"name":"Shinbone Cave","approxX":65479,"approxY":23876,"x":65479.3125,"y":23875.734375,"z":151.62696838378906,"formId":0x000156ff},
    {"name":"Veyond Cave","approxX":70671,"approxY":-10766,"x":70670.859375,"y":-10766.2333984375,"z":879.208740234375,"formId":0x00015a34},
    {"name":"The Beast's Maw","approxX":71495,"approxY":120810,"x":71495.2890625,"y":120809.8125,"z":17559.93359375,"formId":0x000159ff},
    {"name":"Rockmilk Cave","approxX":79215,"approxY":-107792,"x":79214.8515625,"y":-107792.3828125,"z":1864,"formId":0x00015895},
    {"name":"Silver Tooth Cave","approxX":82103,"approxY":129808,"x":82103.3125,"y":129808.109375,"z":23376.720703125,"formId":0x000156fd},
    {"name":"Undertow Cavern","approxX":85632,"approxY":-133406,"x":85631.625,"y":-133405.71875,"z":1224.26953125,"formId":0x000159f7},
    {"name":"Cracked Wood Cave","approxX":87343,"approxY":28961,"x":87343.2421875,"y":28960.509765625,"z":1064,"formId":0x0000ab54},
    {"name":"Reedstand Cave","approxX":90324,"approxY":-79591,"x":90323.9609375,"y":-79590.671875,"z":519.58447265625,"formId":0x00015a29},
    {"name":"Barren Cave","approxX":94565,"approxY":88203,"x":94565.2578125,"y":88203.2265625,"z":6264.39794921875,"formId":0x00015706},
    {"name":"Timberscar Hollow","approxX":95277,"approxY":12621,"x":95276.7109375,"y":12620.5322265625,"z":1151.2119140625,"formId":0x0000ab53},
    {"name":"Muck Valley Cavern","approxX":96469,"approxY":63205,"x":96469.2578125,"y":63204.8125,"z":2870.462890625,"formId":0x00015246},
    {"name":"Amelion Tomb","approxX":98974,"approxY":-128406,"x":98974.0625,"y":-128406.28125,"z":123.9716796875,"formId":0x000158bc},
    {"name":"Newt Cave","approxX":100124,"approxY":3829,"x":100124.4140625,"y":3829.1474609375,"z":192.91067504882812,"formId":0x00015a03},
    {"name":"Tidewater Cave","approxX":104217,"approxY":-170124,"x":104217.40625,"y":-170124.125,"z":713.2057495117188,"formId":0x0004fae1},
    {"name":"Darkfathom Cave","approxX":106754,"approxY":-148739,"x":106754.109375,"y":-148738.703125,"z":1102.638671875,"formId":0x00035a97},
    {"name":"Lake Arrius Caverns","approxX":107872,"approxY":117135,"x":107872.296875,"y":117134.96875,"z":12749.9208984375,"formId":0x0001e903},
    {"name":"Wenderbek Cave","approxX":110535,"approxY":36118,"x":110535.1640625,"y":36117.9609375,"z":2054.44873046875,"formId":0x0001570f},
    {"name":"Quickwater Cave","approxX":112329,"approxY":104595,"x":112329.3046875,"y":104594.7734375,"z":8272.658203125,"formId":0x000159fd},
    {"name":"Bramblepoint Cave","approxX":115283,"approxY":-14607,"x":115282.984375,"y":-14607.314453125,"z":3105.149169921875,"formId":0x00015a2e},
    {"name":"Vahtacen","approxX":126857,"approxY":72010,"x":126857.1015625,"y":72010.03125,"z":485.60498046875,"formId":0x000175ae},
    {"name":"Kingscrest Cavern","approxX":128415,"approxY":133572,"x":128415.0859375,"y":133572.203125,"z":17631.267578125,"formId":0x00015a35},
    {"name":"Fieldhouse Cave","approxX":128652,"approxY":-103754,"x":128651.671875,"y":-103753.8671875,"z":3150.57177734375,"formId":0x00015a00},
    {"name":"Crayfish Cave","approxX":129077,"approxY":29267,"x":129076.7578125,"y":29266.849609375,"z":1362.7662353515625,"formId":0x00015702},
    {"name":"Swampy Cave","approxX":132378,"approxY":72254,"x":132377.953125,"y":72254.28125,"z":13.88720703125,"formId":0x00047545},
    {"name":"Sage Glen Hollow","approxX":132921,"approxY":-5553,"x":132921.390625,"y":-5553.26708984375,"z":4423.2734375,"formId":0x00015a02},
    {"name":"Onyx Caverns","approxX":132977,"approxY":-131827,"x":132977.25,"y":-131827.40625,"z":3629.3564453125,"formId":0x000ad373},
    {"name":"Dark Fissure","approxX":140451,"approxY":67302,"x":140450.640625,"y":67302.4140625,"z":7853.0966796875,"formId":0x00015a37},
    {"name":"Bedrock Cave","approxX":152869,"approxY":-31081,"x":152869.265625,"y":-31080.876953125,"z":4097.77783203125,"formId":0x00015a32},
    {"name":"Shattered Scales Cave","approxX":153060,"approxY":-80157,"x":153059.859375,"y":-80156.65625,"z":1085.8544921875,"formId":0x000159fe},
    {"name":"Bloodrun Cave","approxX":164565,"approxY":-68293,"x":164564.96875,"y":-68293.234375,"z":1360.107421875,"formId":0x0018857c},
    {"name":"Kindred Cave","approxX":166658,"approxY":-64464,"x":166658.4375,"y":-64464.1328125,"z":1078.978515625,"formId":0x00189850},
    {"name":"Redwater Slough","approxX":171056,"approxY":-57810,"x":171055.96875,"y":-57809.7109375,"z":414.56005859375,"formId":0x0017c44a},
    {"name":"Lost Boy Cavern","approxX":172712,"approxY":-13537,"x":172711.828125,"y":-13537.4345703125,"z":3102.671875,"formId":0x00015700},
    {"name":"Arrowshaft Cavern","approxX":174756,"approxY":3738,"x":174755.953125,"y":3737.835693359375,"z":9679.6796875,"formId":0x00015a2f},
    {"name":"Leafrot Cave","approxX":178816,"approxY":-46692,"x":178815.734375,"y":-46692.1875,"z":1434.4892578125,"formId":0x00015245},
    {"name":"Crowhaven","approxX":-208980,"approxY":-10052,"x":-208980.34375,"y":-10052.236328125,"z":5591.2861328125,"formId":0x0001750d},
    {"name":"Fort Sutch","approxX":-193771,"approxY":13012,"x":-193770.9375,"y":13012.2490234375,"z":3534.34033203125,"formId":0x000174f4},
    {"name":"Fort Strand","approxX":-178144,"approxY":-32679,"x":-178144.1875,"y":-32678.93359375,"z":2059.93359375,"formId":0x00017511},
    {"name":"Fort Wariel","approxX":-166734,"approxY":2838,"x":-166734.359375,"y":2838.212890625,"z":8291.7939453125,"formId":0x00017519},
    {"name":"Fort Hastrel","approxX":-156885,"approxY":29529,"x":-156884.59375,"y":29529.2890625,"z":8808.92578125,"formId":0x000174c5},
    {"name":"Fort Linchal","approxX":-129958,"approxY":15530,"x":-129957.828125,"y":15530.0341796875,"z":6326.29931640625,"formId":0x000174d4},
    {"name":"Fort Ontus","approxX":-117322,"approxY":58016,"x":-117321.578125,"y":58015.7265625,"z":22486.6015625,"formId":0x000174fc},
    {"name":"Fort Istirus","approxX":-105844,"approxY":-13128,"x":-105844,"y":-13128,"z":5729.080078125,"formId":0x000174d0},
    {"name":"Fort Dirich","approxX":-89684,"approxY":43045,"x":-89684.5,"y":43044.78125,"z":10305.673828125,"formId":0x00017501},
    {"name":"Fort Rayles","approxX":-88830,"approxY":116281,"x":-88829.5625,"y":116281.234375,"z":21961.53125,"formId":0x000174ec},
    {"name":"Fort Carmala","approxX":-63945,"approxY":69539,"x":-63944.56640625,"y":69538.59375,"z":8290.931640625,"formId":0x0001751d},
    {"name":"Sancre Tor","approxX":-49098,"approxY":136530,"x":-49098.48046875,"y":136530.25,"z":23815.3828125,"formId":0x00026ebd},
    {"name":"Fort Wooden Hand","approxX":-39102,"approxY":48925,"x":-39102.33203125,"y":48925.25390625,"z":7736,"formId":0x00017508},
    {"name":"Fort Ash","approxX":-35344,"approxY":78848,"x":-35344,"y":78848,"z":9214.0498046875,"formId":0x0007812d},
    {"name":"Fort Vlastarus","approxX":-34188,"approxY":7364,"x":-34187.671875,"y":7364.43798828125,"z":4634.24755859375,"formId":0x000174c4},
    {"name":"Fort Coldcorn","approxX":-21154,"approxY":96631,"x":-21154.306640625,"y":96630.5703125,"z":8393.2265625,"formId":0x000174bd},
    {"name":"Fort Nikel","approxX":-14598,"approxY":67735,"x":-14597.90234375,"y":67734.8203125,"z":1718.506591796875,"formId":0x00017510},
    {"name":"Fort Empire","approxX":-7269,"approxY":90312,"x":-7269.455078125,"y":90312.2734375,"z":2617.302001953125,"formId":0x000174d8},
    {"name":"Fort Virtue","approxX":-5965,"approxY":41741,"x":-5965.140625,"y":41741.23828125,"z":560.969482421875,"formId":0x000174cc},
    {"name":"Fort Roebeck","approxX":5221,"approxY":11052,"x":5221.1396484375,"y":11052.3212890625,"z":602.2584228515625,"formId":0x000174e8},
    {"name":"Fort Black Boot","approxX":10274,"approxY":-21667,"x":10274.2236328125,"y":-21667.20703125,"z":6228.4130859375,"formId":0x00017520},
    {"name":"Fort Caractacus","approxX":17178,"approxY":95292,"x":17178.177734375,"y":95292.109375,"z":4018.522216796875,"formId":0x00017504},
    {"name":"Fort Homestead","approxX":22945,"approxY":29944,"x":22944.869140625,"y":29944.0234375,"z":1185.6044921875,"formId":0x0001750c},
    {"name":"Fort Alessia","approxX":51593,"approxY":18876,"x":51592.76171875,"y":18875.822265625,"z":1376,"formId":0x00017515},
    {"name":"Fort Variela","approxX":60483,"approxY":3307,"x":60483.12890625,"y":3306.502197265625,"z":2933.9755859375,"formId":0x000174d5},
    {"name":"Fort Urasek","approxX":60768,"approxY":75680,"x":60768,"y":75680,"z":1287.498291015625,"formId":0x0006d76c},
    {"name":"Fort Chalman","approxX":61511,"approxY":100234,"x":61511.38671875,"y":100234.359375,"z":3452.1103515625,"formId":0x000174f0},
    {"name":"Fort Magia","approxX":64913,"approxY":56657,"x":64912.7109375,"y":56657.33203125,"z":1071.38671875,"formId":0x000174c8},
    {"name":"Fathis Aren's Tower","approxX":68889,"approxY":-56073,"x":68889.2890625,"y":-56073.05078125,"z":2210.44775390625,"formId":0x000c431a},
    {"name":"Fort Horunn","approxX":72173,"approxY":128528,"x":72172.6484375,"y":128527.875,"z":20542.541015625,"formId":0x000174dd},
    {"name":"Fort Nomore","approxX":82567,"approxY":-79482,"x":82566.8359375,"y":-79482.3046875,"z":2053.0517578125,"formId":0x000174d9},
    {"name":"Fort Sejanus","approxX":83900,"approxY":39702,"x":83899.84375,"y":39701.90234375,"z":1366.4110107421875,"formId":0x000174e4},
    {"name":"Fort Redman","approxX":92268,"approxY":-102371,"x":92268.1953125,"y":-102371.0625,"z":154.69091796875,"formId":0x000174fa},
    {"name":"Fort Aurus","approxX":98201,"approxY":-10832,"x":98200.6640625,"y":-10832.12890625,"z":646.9326782226562,"formId":0x000174e9},
    {"name":"Arkved's Tower","approxX":98914,"approxY":49191,"x":98914.375,"y":49191.40625,"z":6220.8828125,"formId":0x0008dc45},
    {"name":"Fort Irony","approxX":99113,"approxY":-59975,"x":99112.625,"y":-59975.19140625,"z":1650.580078125,"formId":0x000174e1},
    {"name":"Fort Grief","approxX":99217,"approxY":-23254,"x":99217.359375,"y":-23254.283203125,"z":118.57403564453125,"formId":0x0001fe0d},
    {"name":"Fort Cedrian","approxX":112410,"approxY":14763,"x":112410.0859375,"y":14762.9873046875,"z":102.072509765625,"formId":0x0001751c},
    {"name":"Fort Doublecross","approxX":117507,"approxY":-118018,"x":117506.8671875,"y":-118017.796875,"z":3097.363525390625,"formId":0x000174f1},
    {"name":"Fort Blueblood","approxX":122493,"approxY":-156127,"x":122492.6953125,"y":-156126.71875,"z":2739.8740234375,"formId":0x000174fd},
    {"name":"Fort Farragut","approxX":131213,"approxY":98663,"x":131212.53125,"y":98663.40625,"z":10282.150390625,"formId":0x000174f6},
    {"name":"Fort Flecia","approxX":137947,"approxY":-17396,"x":137946.6875,"y":-17396.345703125,"z":3052.162109375,"formId":0x000174e0},
    {"name":"Fort Naso","approxX":139296,"approxY":54685,"x":139296.28125,"y":54684.52734375,"z":11507.6611328125,"formId":0x000174c1},
    {"name":"Fort Facian","approxX":144474,"approxY":35249,"x":144473.734375,"y":35248.734375,"z":6080.443359375,"formId":0x000174c9},
    {"name":"Fort Scinia","approxX":147693,"approxY":84351,"x":147692.859375,"y":84351.1875,"z":9415.34375,"formId":0x00017518},
    {"name":"Fort Teleman","approxX":147803,"approxY":-96811,"x":147802.578125,"y":-96810.5546875,"z":3181.6787109375,"formId":0x000174f9},
    {"name":"Fort Gold-Throat","approxX":152737,"approxY":-42777,"x":152737.46875,"y":-42776.84765625,"z":1728.551513671875,"formId":0x000174ed},
    {"name":"Fort Entius","approxX":157631,"approxY":6311,"x":157631.203125,"y":6310.8916015625,"z":217.70407104492188,"formId":0x000174e5},
    {"name":"Fort Redwater","approxX":177026,"approxY":-61028,"x":177025.84375,"y":-61028.48828125,"z":247.365234375,"formId":0x000174c0},
    {"name":"Fort Cuptor","approxX":180701,"approxY":-27563,"x":180700.875,"y":-27562.611328125,"z":629.66064453125,"formId":0x000174d1},
    {"name":"Oblivion Gate - Anvil","approxX":-202117,"approxY":-23049,"x":-202116.984375,"y":-23049.359375,"z":1984.185791015625,"formId":0x000cd414},
    {"name":"Oblivion Gate","approxX":-187164,"approxY":14116,"x":-187164,"y":14116,"z":4401.69970703125,"formId":0x0000cd09},
    {"name":"Oblivion Gate","approxX":-165840,"approxY":-23920,"x":-165840,"y":-23920,"z":4715.48046875,"formId":0x00014d1a},
    {"name":"Oblivion Gate - Kvatch","approxX":-144798,"approxY":-17910,"x":-144797.609375,"y":-17910,"z":11384,"formId":0x0000cef7},
    {"name":"Oblivion Gate","approxX":-122279,"approxY":25777,"x":-122278.7578125,"y":25777.234375,"z":9939.15625,"formId":0x000038cc},
    {"name":"Oblivion Gate","approxX":-99123,"approxY":14940,"x":-99123.4453125,"y":14940.896484375,"z":6736.02685546875,"formId":0x000039ca},
    {"name":"Oblivion Gate","approxX":-71309,"approxY":28821,"x":-71309.6640625,"y":28821.486328125,"z":7354.58837890625,"formId":0x000039d3},
    {"name":"Oblivion Gate - Chorrol","approxX":-63444,"approxY":84905,"x":-63444.46484375,"y":84905.078125,"z":14485.0517578125,"formId":0x0000cefb},
    {"name":"Oblivion Gate","approxX":-56868,"approxY":63627,"x":-56868.6484375,"y":63627.83203125,"z":10424.4833984375,"formId":0x000038fe},
    {"name":"Oblivion Gate - Skingrad","approxX":-52058,"approxY":2307,"x":-52058.8828125,"y":2307.29296875,"z":7921.98046875,"formId":0x0000cefd},
    {"name":"Oblivion Gate","approxX":28954,"approxY":756,"x":28954.708984375,"y":756.0094604492188,"z":3915.65087890625,"formId":0x00003967},
    {"name":"Oblivion Gate","approxX":65340,"approxY":-6272,"x":65340.78515625,"y":-6272.42431640625,"z":3573.4091796875,"formId":0x00003937},
    {"name":"Oblivion Gate - Bravil","approxX":71302,"approxY":-27351,"x":71302.84375,"y":-27351.19921875,"z":1311.589599609375,"formId":0x0000cef9},
    {"name":"Oblivion Gate","approxX":79155,"approxY":147790,"x":79155.90625,"y":147790.4375,"z":34291.40625,"formId":0x00003986},
    {"name":"Oblivion Gate - Leyawiin","approxX":103901,"approxY":-138643,"x":103900.828125,"y":-138642.96875,"z":101.931640625,"formId":0x0000cefc},
    {"name":"Oblivion Gate - Cheydinhal","approxX":109041,"approxY":96580,"x":109041.125,"y":96580.0234375,"z":8303.8447265625,"formId":0x0000cef8},
    {"name":"Oblivion Gate","approxX":123858,"approxY":-146772,"x":123858.0625,"y":-146772.140625,"z":3110.958984375,"formId":0x000038a9},
    {"name":"Oblivion Gate","approxX":137895,"approxY":-132036,"x":137895.46875,"y":-132036,"z":3372.5546875,"formId":0x000038b4},
    {"name":"Oblivion Gate","approxX":-202682,"approxY":2772,"x":-202682.015625,"y":2772.20703125,"z":7250.033203125,"formId":0x00014d15},
    {"name":"Oblivion Gate","approxX":-195584,"approxY":25312,"x":-195584,"y":25312,"z":5903.7333984375,"formId":0x00014d17},
    {"name":"Oblivion Gate","approxX":-178032,"approxY":-17136,"x":-178032,"y":-17136,"z":5813.900390625,"formId":0x000cd413},
    {"name":"Oblivion Gate","approxX":-176704,"approxY":-45888,"x":-176704,"y":-45888,"z":4154.90234375,"formId":0x00014d1c},
    {"name":"Oblivion Gate","approxX":-158288,"approxY":-49936,"x":-158288,"y":-49936,"z":1258.9091796875,"formId":0x00014d1b},
    {"name":"Oblivion Gate","approxX":-157200,"approxY":18304,"x":-157200,"y":18304,"z":8570.6318359375,"formId":0x00014d18},
    {"name":"Oblivion Gate","approxX":-153120,"approxY":1104,"x":-153120,"y":1104,"z":8101.52587890625,"formId":0x00014d19},
    {"name":"Oblivion Gate","approxX":-144642,"approxY":35127,"x":-144642.40625,"y":35127.25,"z":14221.052734375,"formId":0x000038cd},
    {"name":"Oblivion Gate","approxX":-141688,"approxY":-38153,"x":-141688.46875,"y":-38153.93359375,"z":4594.79296875,"formId":0x000039ec},
    {"name":"Oblivion Gate","approxX":-138719,"approxY":3580,"x":-138719.34375,"y":3580.222412109375,"z":6590.3837890625,"formId":0x000038c6},
    {"name":"Oblivion Gate","approxX":-124680,"approxY":51015,"x":-124679.9375,"y":51015.44140625,"z":19464.28125,"formId":0x000038ce},
    {"name":"Oblivion Gate","approxX":-113698,"approxY":67841,"x":-113697.609375,"y":67841.1171875,"z":22967.55859375,"formId":0x000038d9},
    {"name":"Oblivion Gate","approxX":-97306,"approxY":35481,"x":-97306.6171875,"y":35481.5703125,"z":14065.466796875,"formId":0x000038f0},
    {"name":"Oblivion Gate","approxX":-97225,"approxY":47135,"x":-97225.4921875,"y":47135.1328125,"z":10016,"formId":0x000038ef},
    {"name":"Oblivion Gate","approxX":-96906,"approxY":104883,"x":-96906.8984375,"y":104883.28125,"z":19756.65625,"formId":0x000038da},
    {"name":"Oblivion Gate","approxX":-91234,"approxY":3718,"x":-91234.4296875,"y":3718.262939453125,"z":7131.19921875,"formId":0x000039ea},
    {"name":"Oblivion Gate","approxX":-89115,"approxY":73890,"x":-89115.4765625,"y":73890.7578125,"z":13447.99609375,"formId":0x000038eb},
    {"name":"Oblivion Gate","approxX":-88500,"approxY":-4857,"x":-88500.296875,"y":-4857.7685546875,"z":6879.716796875,"formId":0x000039eb},
    {"name":"Oblivion Gate","approxX":-82744,"approxY":17039,"x":-82744.453125,"y":17039.19140625,"z":6071.5419921875,"formId":0x000039e8},
    {"name":"Oblivion Gate","approxX":-81777,"approxY":115572,"x":-81777.25,"y":115571.8828125,"z":18850.98046875,"formId":0x000038db},
    {"name":"Oblivion Gate","approxX":-80713,"approxY":101013,"x":-80713.9296875,"y":101013.203125,"z":16388.630859375,"formId":0x000038e6},
    {"name":"Oblivion Gate","approxX":-64758,"approxY":131895,"x":-64758.07421875,"y":131894.90625,"z":28264.6171875,"formId":0x000038e8},
    {"name":"Oblivion Gate","approxX":-60732,"approxY":154710,"x":-60732.00390625,"y":154710,"z":39402.0234375,"formId":0x000039b5},
    {"name":"Oblivion Gate","approxX":-54407,"approxY":13421,"x":-54407.82421875,"y":13421.7900390625,"z":5960,"formId":0x000039d2},
    {"name":"Oblivion Gate","approxX":-40015,"approxY":352,"x":-40015.6484375,"y":352.3001708984375,"z":5904.6474609375,"formId":0x000039d1},
    {"name":"Oblivion Gate","approxX":-38932,"approxY":86099,"x":-38932.1015625,"y":86099.03125,"z":8886.6298828125,"formId":0x000038f6},
    {"name":"Oblivion Gate","approxX":-36621,"approxY":-11096,"x":-36621.91796875,"y":-11096.4921875,"z":4412.56396484375,"formId":0x000039cf},
    {"name":"Oblivion Gate","approxX":-34853,"approxY":38165,"x":-34853.390625,"y":38165.9375,"z":5656.03125,"formId":0x00003907},
    {"name":"Oblivion Gate","approxX":-31233,"approxY":147296,"x":-31233.712890625,"y":147295.5625,"z":32618.748046875,"formId":0x0000398c},
    {"name":"Oblivion Gate","approxX":-24185,"approxY":71908,"x":-24184.955078125,"y":71908.671875,"z":5970.158203125,"formId":0x00003909},
    {"name":"Oblivion Gate","approxX":-17078,"approxY":-21541,"x":-17078.7578125,"y":-21540.98046875,"z":1944.7525634765625,"formId":0x000039cd},
    {"name":"Oblivion Gate","approxX":-14143,"approxY":-4828,"x":-14143.8671875,"y":-4828.109375,"z":4100.81396484375,"formId":0x000039cc},
    {"name":"Oblivion Gate","approxX":-6422,"approxY":16537,"x":-6422.3359375,"y":16537.86328125,"z":3539.8193359375,"formId":0x00003906},
    {"name":"Oblivion Gate","approxX":-4068,"approxY":101697,"x":-4068.29541015625,"y":101696.8984375,"z":7480.5556640625,"formId":0x0000390d},
    {"name":"Oblivion Gate","approxX":-3718,"approxY":-14847,"x":-3718.635498046875,"y":-14846.99609375,"z":1602.52294921875,"formId":0x000039d0},
    {"name":"Oblivion Gate","approxX":4519,"approxY":-6568,"x":4519.4384765625,"y":-6568.65185546875,"z":5658.001953125,"formId":0x000039cb},
    {"name":"Oblivion Gate","approxX":6950,"approxY":146041,"x":6950.13720703125,"y":146040.859375,"z":27929.857421875,"formId":0x0000398e},
    {"name":"Oblivion Gate","approxX":19522,"approxY":15566,"x":19522.796875,"y":15566,"z":861.2145385742188,"formId":0x00003905},
    {"name":"Oblivion Gate","approxX":23751,"approxY":-13401,"x":23751.7578125,"y":-13401.4912109375,"z":3393.137939453125,"formId":0x000039ce},
    {"name":"Oblivion Gate","approxX":24688,"approxY":106748,"x":24688.044921875,"y":106748.328125,"z":5673.93994140625,"formId":0x00003915},
    {"name":"Oblivion Gate","approxX":37360,"approxY":129259,"x":37360.03515625,"y":129258.78125,"z":16870.337890625,"formId":0x0000392d},
    {"name":"Oblivion Gate","approxX":41950,"approxY":-19567,"x":41950.703125,"y":-19567.396484375,"z":1573.10205078125,"formId":0x000038ff},
    {"name":"Oblivion Gate","approxX":47761,"approxY":40065,"x":47761.296875,"y":40065.87890625,"z":1046.1181640625,"formId":0x0000394b},
    {"name":"Oblivion Gate","approxX":56591,"approxY":94192,"x":56591.36328125,"y":94192.9375,"z":972.89453125,"formId":0x00003957},
    {"name":"Oblivion Gate","approxX":60370,"approxY":10705,"x":60370.37890625,"y":10705.7890625,"z":749.8057250976562,"formId":0x00003940},
    {"name":"Oblivion Gate","approxX":70120,"approxY":86578,"x":70119.90625,"y":86578.171875,"z":6127.6884765625,"formId":0x00003959},
    {"name":"Oblivion Gate","approxX":73392,"approxY":112305,"x":73392.5078125,"y":112305.15625,"z":15809.4482421875,"formId":0x00003930},
    {"name":"Oblivion Gate","approxX":78361,"approxY":63702,"x":78360.9609375,"y":63702.08984375,"z":4228.16552734375,"formId":0x0000395a},
    {"name":"Oblivion Gate","approxX":79368,"approxY":26356,"x":79368.453125,"y":26356.552734375,"z":2253.021484375,"formId":0x000039f8},
    {"name":"Oblivion Gate","approxX":79807,"approxY":-100902,"x":79807.3828125,"y":-100901.5234375,"z":1167.18798828125,"formId":0x000038ac},
    {"name":"Oblivion Gate","approxX":84738,"approxY":2703,"x":84738.546875,"y":2703,"z":1374.48046875,"formId":0x00003963},
    {"name":"Oblivion Gate","approxX":86505,"approxY":47589,"x":86505.4921875,"y":47589.53125,"z":1953.819091796875,"formId":0x000039f7},
    {"name":"Oblivion Gate","approxX":89265,"approxY":103633,"x":89264.96875,"y":103633.015625,"z":9363.0068359375,"formId":0x00003910},
    {"name":"Oblivion Gate","approxX":95452,"approxY":130578,"x":95452.109375,"y":130578.1015625,"z":26763.9453125,"formId":0x0000398d},
    {"name":"Oblivion Gate","approxX":97544,"approxY":-131665,"x":97544.7265625,"y":-131665.234375,"z":29.634918212890625,"formId":0x000038ae},
    {"name":"Oblivion Gate","approxX":103806,"approxY":-112618,"x":103805.7265625,"y":-112618.4921875,"z":3458.81494140625,"formId":0x000038b6},
    {"name":"Oblivion Gate","approxX":105043,"approxY":27394,"x":105043,"y":27394,"z":3535.63720703125,"formId":0x000039f9},
    {"name":"Oblivion Gate","approxX":108514,"approxY":-164944,"x":108514.0859375,"y":-164943.59375,"z":2604.11572265625,"formId":0x000038b0},
    {"name":"Oblivion Gate","approxX":108602,"approxY":-75450,"x":108601.5625,"y":-75450.484375,"z":1165.19921875,"formId":0x000038be},
    {"name":"Oblivion Gate","approxX":112205,"approxY":71510,"x":112205.0078125,"y":71510,"z":5568.92529296875,"formId":0x000039ee},
    {"name":"Oblivion Gate","approxX":112313,"approxY":147535,"x":112312.734375,"y":147534.796875,"z":20846.32421875,"formId":0x000039c7},
    {"name":"Oblivion Gate","approxX":114047,"approxY":-152194,"x":114046.703125,"y":-152194.21875,"z":3351.04052734375,"formId":0x000038af},
    {"name":"Oblivion Gate","approxX":117339,"approxY":-100272,"x":117339.4609375,"y":-100272.1484375,"z":5049.607421875,"formId":0x000038b8},
    {"name":"Oblivion Gate","approxX":120244,"approxY":109173,"x":120244.40625,"y":109172.6484375,"z":7965.109375,"formId":0x000039f6},
    {"name":"Oblivion Gate","approxX":120426,"approxY":59564,"x":120425.6640625,"y":59564.27734375,"z":1458.111328125,"formId":0x000039f1},
    {"name":"Oblivion Gate","approxX":121398,"approxY":-57809,"x":121398.0234375,"y":-57809.16796875,"z":530.7861328125,"formId":0x000039fc},
    {"name":"Oblivion Gate","approxX":122884,"approxY":-176245,"x":122883.8046875,"y":-176245.421875,"z":556.5523071289062,"formId":0x000038b1},
    {"name":"Oblivion Gate","approxX":123737,"approxY":14447,"x":123736.8203125,"y":14447.638671875,"z":3688.542236328125,"formId":0x000039fa},
    {"name":"Oblivion Gate","approxX":125117,"approxY":-7560,"x":125117.40625,"y":-7560.609375,"z":5709.4462890625,"formId":0x000039fb},
    {"name":"Oblivion Gate","approxX":126487,"approxY":76324,"x":126486.5625,"y":76324.40625,"z":1759.54638671875,"formId":0x000039f5},
    {"name":"Oblivion Gate","approxX":131954,"approxY":-167651,"x":131953.5,"y":-167650.625,"z":2828.9384765625,"formId":0x000038b2},
    {"name":"Oblivion Gate","approxX":136996,"approxY":-41331,"x":136996.328125,"y":-41331.25,"z":7238.322265625,"formId":0x000039fd},
    {"name":"Oblivion Gate","approxX":139882,"approxY":-100916,"x":139882.40625,"y":-100915.8828125,"z":3161.3505859375,"formId":0x000038bb},
    {"name":"Oblivion Gate","approxX":140024,"approxY":103001,"x":140023.546875,"y":103000.765625,"z":18227.2109375,"formId":0x000039c8},
    {"name":"Oblivion Gate","approxX":145248,"approxY":22778,"x":145248,"y":22778,"z":9326.732421875,"formId":0x000039ff},
    {"name":"Oblivion Gate","approxX":148977,"approxY":-86885,"x":148977.03125,"y":-86885.8515625,"z":1663.474609375,"formId":0x000038c5},
    {"name":"Oblivion Gate","approxX":159579,"approxY":30387,"x":159579.296875,"y":30387.236328125,"z":4435.63427734375,"formId":0x000039c9},
    {"name":"Oblivion Gate","approxX":172344,"approxY":-9250,"x":172344.25,"y":-9250.568359375,"z":2600.05224609375,"formId":0x000039fe},
    {"name":"Oblivion Gate","approxX":180034,"approxY":-39331,"x":180033.875,"y":-39331.51953125,"z":2981.9814453125,"formId":0x00003a00},
    {"name":"Oblivion Gate","approxX":201985,"approxY":-9193,"x":201985.125,"y":-9193.9267578125,"z":7805.17333984375,"formId":0x00003a02},
    {"name":"Brina Cross Inn","approxX":-186045,"approxY":-10372,"x":-186044.890625,"y":-10371.9736328125,"z":6910.9130859375,"formId":0x000177af},
    {"name":"Gottshaw Inn","approxX":-162375,"approxY":-16046,"x":-162374.578125,"y":-16046.017578125,"z":6389.66455078125,"formId":0x00091cff},
    {"name":"Wawnet Inn","approxX":-2088,"approxY":62990,"x":-2087.55126953125,"y":62989.71484375,"z":1116.809326171875,"formId":0x000ac546},
    {"name":"Faregyl Inn","approxX":22058,"approxY":1388,"x":22058,"y":1388,"z":1401.06005859375,"formId":0x00017798},
    {"name":"Inn of Ill Omen","approxX":30400,"approxY":-2580,"x":30399.548828125,"y":-2580.041259765625,"z":3949.86474609375,"formId":0x0001779a},
    {"name":"Roxey Inn","approxX":48479,"approxY":102739,"x":48478.87890625,"y":102738.875,"z":3035.64404296875,"formId":0x0005b00d},
    {"name":"The Drunken Dragon Inn","approxX":127900,"approxY":-89560,"x":127900.0390625,"y":-89559.96875,"z":6228.16552734375,"formId":0x000177a9},
    {"name":"Imperial Bridge Inn","approxX":134790,"approxY":-22092,"x":134789.953125,"y":-22092.314453125,"z":726.4288330078125,"formId":0x000177aa},
    {"name":"Cloud Top","approxX":-83085,"approxY":128442,"x":-83084.8125,"y":128442.3359375,"z":28500.12109375,"formId":0x000cd31f},
    {"name":"Shadeleaf Copse","approxX":-52000,"approxY":25291,"x":-51999.9296875,"y":25290.755859375,"z":6529.37353515625,"formId":0x00094040},
    {"name":"Old Bridge","approxX":17295,"approxY":27357,"x":17295.072265625,"y":27357.0859375,"z":97.7421875,"formId":0x00051f87},
    {"name":"Dragonclaw Rock","approxX":46067,"approxY":166045,"x":46067.7734375,"y":166044.765625,"z":25972.09375,"formId":0x000174dc},
    {"name":"Harcane Grove","approxX":46925,"approxY":-1257,"x":46925.2578125,"y":-1257.9022216796875,"z":3814.912841796875,"formId":0x0000a3b6},
    {"name":"Gnoll Mountain","approxX":53880,"approxY":152660,"x":53879.88671875,"y":152660.375,"z":34486.7265625,"formId":0x00188f45},
    {"name":"Mouth of the Panther","approxX":116045,"approxY":-62410,"x":116044.6640625,"y":-62410.26953125,"z":389.9296875,"formId":0x00071318},
    {"name":"Dive Rock","approxX":138134,"approxY":142738,"x":138133.703125,"y":142738.453125,"z":34187.2890625,"formId":0x000c55ed},
    {"name":"Hero Hill","approxX":139975,"approxY":79852,"x":139974.5,"y":79851.6953125,"z":5065.65771484375,"formId":0x00051443},
    {"name":"Bleak Mine","approxX":-189161,"approxY":2310,"x":-189160.578125,"y":2310.29833984375,"z":5404.60302734375,"formId":0x0001752b},
    {"name":"Bellator's Folly","approxX":-151766,"approxY":-27079,"x":-151765.96875,"y":-27079.279296875,"z":8163.23486328125,"formId":0x00017547},
    {"name":"Shattered Mine","approxX":-149543,"approxY":18916,"x":-149542.859375,"y":18915.6875,"z":8031.4208984375,"formId":0x0001754f},
    {"name":"Dasek Moor","approxX":-145906,"approxY":-32415,"x":-145905.75,"y":-32415.501953125,"z":5643.19287109375,"formId":0x00017514},
    {"name":"Infested Mine","approxX":-138255,"approxY":48891,"x":-138255.328125,"y":48890.87109375,"z":15222.7021484375,"formId":0x00017546},
    {"name":"Echo Mine","approxX":-108407,"approxY":38878,"x":-108407.078125,"y":38877.8828125,"z":14144,"formId":0x00017543},
    {"name":"Cursed Mine","approxX":-84263,"approxY":6292,"x":-84262.5859375,"y":6291.837890625,"z":6514.5439453125,"formId":0x00017542},
    {"name":"Pillaged Mine","approxX":-78646,"approxY":88499,"x":-78646.28125,"y":88499.234375,"z":13912.84765625,"formId":0x0001752f},
    {"name":"Crumbling Mine","approxX":-60395,"approxY":90586,"x":-60394.96875,"y":90585.9453125,"z":14062.224609375,"formId":0x0001755a},
    {"name":"Derelict Mine","approxX":-51974,"approxY":10147,"x":-51973.5546875,"y":10147.240234375,"z":6907.298828125,"formId":0x00017556},
    {"name":"Plundered Mine","approxX":43522,"approxY":149759,"x":43521.5859375,"y":149759.328125,"z":25664.474609375,"formId":0x00017553},
    {"name":"Flooded Mine","approxX":67084,"approxY":-21085,"x":67083.9375,"y":-21085.337890625,"z":856.9793090820312,"formId":0x0001752e},
    {"name":"Exhausted Mine","approxX":71612,"approxY":102223,"x":71612.2734375,"y":102222.5234375,"z":7522.77392578125,"formId":0x0001754e},
    {"name":"Empty Mine","approxX":75935,"approxY":55010,"x":75934.6328125,"y":55010.3046875,"z":2209.240234375,"formId":0x0001754b},
    {"name":"Forsaken Mine","approxX":89281,"approxY":-154047,"x":89281.3046875,"y":-154046.734375,"z":491.42333984375,"formId":0x00017536},
    {"name":"Gutted Mine","approxX":99704,"approxY":130284,"x":99704.25,"y":130283.546875,"z":26367.70703125,"formId":0x0001752a},
    {"name":"Desolate Mine","approxX":100175,"approxY":105337,"x":100174.7265625,"y":105336.75,"z":9318.775390625,"formId":0x00017533},
    {"name":"Barren Mine","approxX":118272,"approxY":-84451,"x":118271.5,"y":-84451.53125,"z":3836.75,"formId":0x00017552},
    {"name":"Squandered Mine","approxX":129172,"approxY":46685,"x":129172.28125,"y":46685.44140625,"z":5874.935546875,"formId":0x0001753e},
    {"name":"Haunted Mine","approxX":135361,"approxY":-84739,"x":135361.21875,"y":-84738.65625,"z":1862.0740966796875,"formId":0x0001754a},
    {"name":"Rickety Mine","approxX":137486,"approxY":92106,"x":137486.4375,"y":92106.1171875,"z":12340.275390625,"formId":0x0001753f},
    {"name":"Doomed Mine","approxX":144254,"approxY":64556,"x":144254.328125,"y":64556.36328125,"z":7207.158203125,"formId":0x00017557},
    {"name":"Deserted Mine","approxX":149010,"approxY":12877,"x":149009.625,"y":12876.869140625,"z":6655.041015625,"formId":0x0001753b},
    {"name":"Collapsed Mine","approxX":176575,"approxY":8025,"x":176575,"y":8025.08544921875,"z":10977.3544921875,"formId":0x0001753a},
    {"name":"Abandoned Mine","approxX":196325,"approxY":-15451,"x":196325.265625,"y":-15451.310546875,"z":3656.892822265625,"formId":0x00017537},
    {"name":"Beldaburo","approxX":-212407,"approxY":1161,"x":-212407.4375,"y":1160.614501953125,"z":2655.038818359375,"formId":0x00017578},
    {"name":"Niryastare","approxX":-178413,"approxY":29940,"x":-178413.171875,"y":29940.384765625,"z":5550.689453125,"formId":0x00017568},
    {"name":"Garlas Agea","approxX":-173118,"approxY":-19279,"x":-173117.828125,"y":-19279.12890625,"z":4548.80712890625,"formId":0x000ad44e},
    {"name":"Trumbe","approxX":-161939,"approxY":9973,"x":-161939.171875,"y":9973.4765625,"z":6116.765625,"formId":0x00017563},
    {"name":"Varondo","approxX":-134762,"approxY":38577,"x":-134761.578125,"y":38576.75390625,"z":17757.232421875,"formId":0x0001757b},
    {"name":"Miscarcand","approxX":-113132,"approxY":1340,"x":-113132,"y":1340,"z":6971.30419921875,"formId":0x000175af},
    {"name":"Talwinque","approxX":-111263,"approxY":24030,"x":-111262.7890625,"y":24030.06640625,"z":8906.12109375,"formId":0x00017583},
    {"name":"Nonungalo","approxX":-103616,"approxY":52203,"x":-103615.890625,"y":52202.6328125,"z":10968.0380859375,"formId":0x000a0d17},
    {"name":"Wendir","approxX":-75185,"approxY":69303,"x":-75185.171875,"y":69302.828125,"z":10507.6591796875,"formId":0x00017359},
    {"name":"Lipsand Tarn","approxX":-72113,"approxY":137415,"x":-72113.5,"y":137414.515625,"z":33953.79296875,"formId":0x0011c8a2},
    {"name":"Elenglynn","approxX":-67577,"approxY":45943,"x":-67577.1875,"y":45942.671875,"z":7906.2529296875,"formId":0x0001757f},
    {"name":"Hrotanda Vale","approxX":-59309,"approxY":112434,"x":-59309.5390625,"y":112434.046875,"z":16412.23046875,"formId":0x00017567},
    {"name":"Narfinsel","approxX":-46608,"approxY":62944,"x":-46608,"y":62944,"z":8459.6630859375,"formId":0x0001758c},
    {"name":"Silorn","approxX":-43115,"approxY":-14618,"x":-43114.7421875,"y":-14617.93359375,"z":3534.5595703125,"formId":0x0001756f},
    {"name":"Ninendava","approxX":-37923,"approxY":141601,"x":-37923.515625,"y":141601.109375,"z":26051.951171875,"formId":0x0001735b},
    {"name":"Lindai","approxX":-31160,"approxY":97002,"x":-31159.658203125,"y":97001.875,"z":9244.05859375,"formId":0x00017598},
    {"name":"Ceyatatar","approxX":-24816,"approxY":31200,"x":-24816,"y":31200,"z":3653.701904296875,"formId":0x00017574},
    {"name":"Moranda","approxX":-22330,"approxY":123857,"x":-22330.001953125,"y":123857.1640625,"z":15760.306640625,"formId":0x00017353},
    {"name":"Nornalhorst","approxX":-22022,"approxY":-3073,"x":-22022.431640625,"y":-3072.726806640625,"z":5892.08447265625,"formId":0x0001755f},
    {"name":"Fanacasecul","approxX":-6018,"approxY":49096,"x":-6018.392578125,"y":49096.31640625,"z":435.0080261230469,"formId":0x0001758f},
    {"name":"Piukanda","approxX":486,"approxY":108253,"x":486.1808776855469,"y":108253.3515625,"z":10740.0595703125,"formId":0x00017594},
    {"name":"Vindasel","approxX":2118,"approxY":30391,"x":2118.09716796875,"y":30390.572265625,"z":651.7816162109375,"formId":0x000175a6},
    {"name":"Rielle","approxX":6418,"approxY":157370,"x":6417.95263671875,"y":157370.078125,"z":27792.09375,"formId":0x00017588},
    {"name":"Nenyond Twyll","approxX":9558,"approxY":1936,"x":9557.951171875,"y":1936.2042236328125,"z":3975.63232421875,"formId":0x00017580},
    {"name":"Wenyandawik","approxX":35066,"approxY":-17990,"x":35066.07421875,"y":-17989.93359375,"z":2996.690185546875,"formId":0x0001720a},
    {"name":"Sercen","approxX":36376,"approxY":103358,"x":36375.9921875,"y":103358.015625,"z":2520.884033203125,"formId":0x00017587},
    {"name":"Sardavar Leed","approxX":38875,"approxY":19722,"x":38875.44140625,"y":19722.244140625,"z":1523.248779296875,"formId":0x00017209},
    {"name":"Anga","approxX":45783,"approxY":121154,"x":45783.1796875,"y":121153.8515625,"z":13097.779296875,"formId":0x0001735f},
    {"name":"Vilverin","approxX":50804,"approxY":87399,"x":50803.87109375,"y":87399.3203125,"z":409.95947265625,"formId":0x0006b588},
    {"name":"Anutwyll","approxX":58890,"approxY":-27120,"x":58890.1875,"y":-27120.376953125,"z":1216.538818359375,"formId":0x00017570},
    {"name":"Culotte","approxX":76493,"approxY":15095,"x":76493.1875,"y":15095.349609375,"z":362.7022705078125,"formId":0x00017357},
    {"name":"Telepe","approxX":77697,"approxY":-131254,"x":77697.4140625,"y":-131253.953125,"z":2233.9501953125,"formId":0x00017584},
    {"name":"Belda","approxX":81088,"approxY":94412,"x":81088.2734375,"y":94411.984375,"z":10690.080078125,"formId":0x00017577},
    {"name":"Nagastani","approxX":82196,"approxY":66339,"x":82196.046875,"y":66338.8671875,"z":4635.47705078125,"formId":0x000ad3e5},
    {"name":"Bawn","approxX":83932,"approxY":-53992,"x":83931.703125,"y":-53991.5625,"z":787.6802978515625,"formId":0x00017564},
    {"name":"Sedor","approxX":88106,"approxY":134540,"x":88106.0703125,"y":134539.59375,"z":26066.625,"formId":0x000a3520},
    {"name":"Nornal","approxX":99206,"approxY":41665,"x":99205.59375,"y":41665.0078125,"z":5069.95556640625,"formId":0x000175a9},
    {"name":"Veyond","approxX":111901,"approxY":-126115,"x":111900.9375,"y":-126114.7578125,"z":1808.5927734375,"formId":0x000175ad},
    {"name":"Arpenia","approxX":112133,"approxY":-96023,"x":112133.4140625,"y":-96023.3359375,"z":2389.44677734375,"formId":0x000175aa},
    {"name":"Nenalata","approxX":113406,"approxY":-23533,"x":113406.4453125,"y":-23532.900390625,"z":79.0096435546875,"formId":0x00017597},
    {"name":"Morahame","approxX":123658,"approxY":-42816,"x":123658,"y":-42816.40625,"z":1503.491943359375,"formId":0x00017573},
    {"name":"Atatar","approxX":125078,"approxY":-85678,"x":125078,"y":-85678.3125,"z":6036.291015625,"formId":0x00017593},
    {"name":"Fanacas","approxX":127902,"approxY":118634,"x":127902.0859375,"y":118633.765625,"z":14873.25,"formId":0x0001735d},
    {"name":"Mackamentain","approxX":132777,"approxY":5416,"x":132776.546875,"y":5415.71337890625,"z":4767.23388671875,"formId":0x00017355},
    {"name":"Kemen","approxX":139963,"approxY":95061,"x":139962.671875,"y":95061.2421875,"z":15446.8212890625,"formId":0x00017560},
    {"name":"Welke","approxX":145671,"approxY":-71491,"x":145670.828125,"y":-71491.3125,"z":1764.1158447265625,"formId":0x00017351},
    {"name":"Ondo","approxX":161452,"approxY":-5599,"x":161451.53125,"y":-5599.02734375,"z":1867.200439453125,"formId":0x0001757c},
    {"name":"Wendelbek","approxX":162799,"approxY":-51156,"x":162799.171875,"y":-51155.7734375,"z":1120,"formId":0x0001756c},
    {"name":"Hame","approxX":165768,"approxY":34317,"x":165767.9375,"y":34317.3984375,"z":9879.6513671875,"formId":0x0001756b},
    {"name":"Malada","approxX":189649,"approxY":-3042,"x":189649.1875,"y":-3041.702880859375,"z":5892.9150390625,"formId":0x0002af0b},
    {"name":"Lord Drad's Estate","approxX":-194890,"approxY":3173,"x":-194889.703125,"y":3172.586669921875,"z":4688,"formId":0x0003756b},
    {"name":"Whitmond Farm","approxX":-190992,"approxY":-23135,"x":-190991.546875,"y":-23135.77734375,"z":1148.4501953125,"formId":0x000177b0},
    {"name":"Gweden Farm","approxX":-169688,"approxY":-42808,"x":-169688.359375,"y":-42807.96875,"z":4437.8896484375,"formId":0x00090c8d},
    {"name":"Shetcombe Farm","approxX":-130594,"approxY":-4228,"x":-130593.5,"y":-4228.94091796875,"z":8426.38671875,"formId":0x000177ad},
    {"name":"Shardrock","approxX":-108307,"approxY":9418,"x":-108307.0390625,"y":9418.0546875,"z":6801.17724609375,"formId":0x000177a5},
    {"name":"Weatherleah","approxX":-75742,"approxY":53615,"x":-75741.5625,"y":53614.74609375,"z":9702.1767578125,"formId":0x0003f27f},
    {"name":"Hackdirt","approxX":-67107,"approxY":64130,"x":-67106.703125,"y":64129.62109375,"z":9792,"formId":0x00028552},
    {"name":"Brindle Home","approxX":-55105,"approxY":43030,"x":-55104.93359375,"y":43029.7421875,"z":7869.888671875,"formId":0x0001779d},
    {"name":"Odiil Farm","approxX":-50069,"approxY":82399,"x":-50069.09375,"y":82399.4375,"z":10531.1845703125,"formId":0x000ac549},
    {"name":"Gottlefont Priory","approxX":-43211,"approxY":44170,"x":-43210.8359375,"y":44170.15625,"z":8070.046875,"formId":0x0001779c},
    {"name":"Weye","approxX":1152,"approxY":63488,"x":1152,"y":63488,"z":831.1402587890625,"formId":0x000ac544},
    {"name":"Applewatch","approxX":6064,"approxY":150297,"x":6063.92236328125,"y":150297.28125,"z":26881.458984375,"formId":0x000177a3},
    {"name":"Aleswell","approxX":13009,"approxY":102949,"x":13009.2021484375,"y":102949.171875,"z":9056,"formId":0x00030027},
    {"name":"Cloud Ruler Temple","approxX":13391,"approxY":160255,"x":13391.1796875,"y":160254.921875,"z":31609.86328125,"formId":0x000177ab},
    {"name":"Pell's Gate","approxX":21348,"approxY":24504,"x":21347.560546875,"y":24504.357421875,"z":557.8787841796875,"formId":0x000177ae},
    {"name":"Bleaker's Way","approxX":28506,"approxY":119103,"x":28505.6171875,"y":119102.7890625,"z":9770.787109375,"formId":0x00017799},
    {"name":"Border Watch","approxX":72100,"approxY":-112809,"x":72100.3828125,"y":-112809.1328125,"z":2204.73095703125,"formId":0x0001779f},
    {"name":"Roland Jenseric's Cabin","approxX":75723,"approxY":83177,"x":75722.9921875,"y":83177.296875,"z":5661.14306640625,"formId":0x000ac548},
    {"name":"Harm's Folly","approxX":78518,"approxY":106584,"x":78518.1171875,"y":106584.421875,"z":12024,"formId":0x000177a0},
    {"name":"Greyland","approxX":79814,"approxY":-145008,"x":79814.625,"y":-145008.453125,"z":1276.9169921875,"formId":0x000177a2},
    {"name":"Water's Edge","approxX":81881,"approxY":-112732,"x":81881.0078125,"y":-112732.109375,"z":48.2900390625,"formId":0x000177a1},
    {"name":"White Stallion Lodge","approxX":82555,"approxY":-126520,"x":82555.859375,"y":-126520.015625,"z":226.5089874267578,"formId":0x000908c2},
    {"name":"Cropsford","approxX":88670,"approxY":20963,"x":88669.9921875,"y":20962.703125,"z":1287.358154296875,"formId":0x0000ab52},
    {"name":"Blankenmarch","approxX":109164,"approxY":-120857,"x":109164.0703125,"y":-120857.0078125,"z":2090.084228515625,"formId":0x000177a4},
    {"name":"Knights of the Thorn Lodge","approxX":110810,"approxY":95984,"x":110809.75,"y":95984.8046875,"z":8368.025390625,"formId":0x000c431b},
    {"name":"Cadlew Chapel","approxX":112467,"approxY":-19491,"x":112466.8984375,"y":-19490.5625,"z":869.18017578125,"formId":0x000cd529},
    {"name":"Temple of the Ancestor Moths","approxX":118870,"approxY":146791,"x":118870.0546875,"y":146790.859375,"z":20009.388671875,"formId":0x000177a8},
    {"name":"Harlun's Watch","approxX":119838,"approxY":80270,"x":119837.9140625,"y":80270.03125,"z":6365.85791015625,"formId":0x000177a6},
    {"name":"Lord Rugdumph's Estate","approxX":121678,"approxY":127784,"x":121678.09375,"y":127783.5546875,"z":14436.15234375,"formId":0x000177a7},
    {"name":"Drakelowe","approxX":126172,"approxY":44026,"x":126171.859375,"y":44026.453125,"z":1775.615234375,"formId":0x000177b1},
    {"name":"Malacath's Shrine","approxX":-202274,"approxY":10675,"x":-202273.9375,"y":10675.3662109375,"z":5777.3662109375,"formId":0x0003b369},
    {"name":"Meridia's Shrine","approxX":-97994,"approxY":7969,"x":-97993.875,"y":7968.81005859375,"z":7748.00439453125,"formId":0x0003b36b},
    {"name":"Sanguine's Shrine","approxX":-85773,"approxY":37435,"x":-85773.0546875,"y":37434.93359375,"z":11471.9951171875,"formId":0x00097008},
    {"name":"Hermaeus Mora's Shrine","approxX":-47329,"approxY":159680,"x":-47328.83203125,"y":159679.59375,"z":38712,"formId":0x0003b366},
    {"name":"Molag Bal's Shrine","approxX":-47106,"approxY":53565,"x":-47106.33203125,"y":53564.984375,"z":10275.9052734375,"formId":0x0003b368},
    {"name":"Clavicus Vile's Shrine","approxX":-13291,"approxY":34720,"x":-13291.236328125,"y":34720.03515625,"z":1897.672607421875,"formId":0x0003b365},
    {"name":"Hircine's Shrine","approxX":42999,"approxY":10811,"x":42999.3203125,"y":10811.0185546875,"z":4296,"formId":0x0003b367},
    {"name":"Namira's Shrine","approxX":48022,"approxY":140655,"x":48021.7265625,"y":140655.34375,"z":22158.234375,"formId":0x0003b36c},
    {"name":"Mephala's Shrine","approxX":55326,"approxY":112149,"x":55326.19140625,"y":112149.171875,"z":9914.591796875,"formId":0x0003b36a},
    {"name":"Sheogorath's Shrine","approxX":76549,"approxY":-87857,"x":76549.171875,"y":-87857.1328125,"z":3392.38671875,"formId":0x0003b370},
    {"name":"Vaermina's Shrine","approxX":104676,"approxY":65675,"x":104676.4140625,"y":65674.578125,"z":1168,"formId":0x0003b371},
    {"name":"Nocturnal's Shrine","approxX":108568,"approxY":-105591,"x":108567.78125,"y":-105591.4609375,"z":3347.303955078125,"formId":0x0003b36d},
    {"name":"Azura's Shrine","approxX":111865,"approxY":138290,"x":111865.0625,"y":138289.625,"z":21816,"formId":0x0003b363},
    {"name":"Boethia's Shrine","approxX":153134,"approxY":47246,"x":153134.125,"y":47245.5078125,"z":16216,"formId":0x0003b364},
    {"name":"Peryite's Shrine","approxX":157339,"approxY":-19871,"x":157339.078125,"y":-19871.515625,"z":1123.439208984375,"formId":0x0003b36e},
    {"name":"Oblivion Gate - Bruma","approxX":30043,"approxY":143344,"x":30043.669921875,"y":143343.65625,"z":25607.818359375,"formId":0x0000cefa},
];