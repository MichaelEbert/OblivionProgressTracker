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
    {"name":"Memorial Cave","x":59243,"y":48008,"formId":"0x00015704","icon":"Cave"},
    {"name":"Imperial Sewer - South East Exit","x":44411,"y":52511,"formId":"0x000c50d3","icon":"Cave"},
    {"name":"Fatback Cave","x":39456,"y":31533,"formId":"0x000156fe","icon":"Cave"},
    {"name":"Fort Homestead","x":22945,"y":29944,"formId":"0x0001750c","icon":"Fort"},
    {"name":"Old Bridge","x":17295,"y":27357,"formId":"0x00051f87","icon":"Landmark"},
    {"name":"Pell's Gate","x":21348,"y":24504,"formId":"0x000177ae","icon":"Settlement"},
    {"name":"Horn Cave","x":26217,"y":19226,"formId":"0x00015a36","icon":"Cave"},
    {"name":"Charcoal Cave","x":34590,"y":12732,"formId":"0x000156fc","icon":"Cave"},
    {"name":"Hircine's Shrine","x":42999,"y":10811,"formId":"0x0003b367","icon":"Shrine"},
    {"name":"Sardavar Leed","x":38875,"y":19722,"formId":"0x00017209","icon":"Ayleid"},
    {"name":"Sweetwater Camp","x":43872,"y":18081,"formId":"0x000175df","icon":"Camp"},
    {"name":"Fort Alessia","x":51593,"y":18876,"formId":"0x00017515","icon":"Fort"},
    {"name":"Shinbone Cave","x":65479,"y":23876,"formId":"0x000156ff","icon":"Cave"},
    {"name":"Culotte","x":76493,"y":15095,"formId":"0x00017357","icon":"Ayleid"},
    {"name":"Cropsford","x":88670,"y":20963,"formId":"0x0000ab52","icon":"Settlement"},
    {"name":"Cracked Wood Cave","x":87343,"y":28961,"formId":"0x0000ab54","icon":"Cave"},
    {"name":"Fort Sejanus","x":83900,"y":39702,"formId":"0x000174e4","icon":"Fort"},
    {"name":"Empty Mine","x":75935,"y":55010,"formId":"0x0001754b","icon":"Mine"},
    {"name":"Nagastani","x":82196,"y":66339,"formId":"0x000ad3e5","icon":"Ayleid"},
    {"name":"Muck Valley Cavern","x":96469,"y":63205,"formId":"0x00015246","icon":"Cave"},
    {"name":"Vaermina's Shrine","x":104676,"y":65675,"formId":"0x0003b371","icon":"Shrine"},
    {"name":"Arkved's Tower","x":98914,"y":49191,"formId":"0x0008dc45","icon":"Fort"},
    {"name":"Nornal","x":99206,"y":41665,"formId":"0x000175a9","icon":"Ayleid"},
    {"name":"Wenderbek Cave","x":110535,"y":36118,"formId":"0x0001570f","icon":"Cave"},
    {"name":"Fort Cedrian","x":112410,"y":14763,"formId":"0x0001751c","icon":"Fort"},
    {"name":"Crestbridge Camp","x":107565,"y":12612,"formId":"0x000177b2","icon":"Camp"},
    {"name":"Timberscar Hollow","x":95277,"y":12621,"formId":"0x0000ab53","icon":"Cave"},
    {"name":"Newt Cave","x":100124,"y":3829,"formId":"0x00015a03","icon":"Cave"},
    {"name":"Fort Aurus","x":98201,"y":-10832,"formId":"0x000174e9","icon":"Fort"},
    {"name":"Fort Grief","x":99217,"y":-23254,"formId":"0x0001fe0d","icon":"Fort"},
    {"name":"Nenalata","x":113406,"y":-23533,"formId":"0x00017597","icon":"Ayleid"},
    {"name":"Cadlew Chapel","x":112467,"y":-19491,"formId":"0x000cd529","icon":"Settlement"},
    {"name":"Bramblepoint Cave","x":115283,"y":-14607,"formId":"0x00015a2e","icon":"Cave"},
    {"name":"Imperial Bridge Inn","x":134790,"y":-22092,"formId":"0x000177aa","icon":"Inn"},
    {"name":"Fort Flecia","x":137947,"y":-17396,"formId":"0x000174e0","icon":"Fort"},
    {"name":"Sage Glen Hollow","x":132921,"y":-5553,"formId":"0x00015a02","icon":"Cave"},
    {"name":"Mackamentain","x":132777,"y":5416,"formId":"0x00017355","icon":"Ayleid"},
    {"name":"Trossan Camp","x":132763,"y":10263,"formId":"0x000175db","icon":"Camp"},
    {"name":"Crayfish Cave","x":129077,"y":29267,"formId":"0x00015702","icon":"Cave"},
    {"name":"Drakelowe","x":126172,"y":44026,"formId":"0x000177b1","icon":"Settlement"},
    {"name":"Squandered Mine","x":129172,"y":46685,"formId":"0x0001753e","icon":"Mine"},
    {"name":"Sercen Camp","x":141209,"y":42571,"formId":"0x0017cf9f","icon":"Camp"},
    {"name":"Fort Facian","x":144474,"y":35249,"formId":"0x000174c9","icon":"Fort"},
    {"name":"Boethia's Shrine","x":153134,"y":47246,"formId":"0x0003b364","icon":"Shrine"},
    {"name":"Hame","x":165768,"y":34317,"formId":"0x0001756b","icon":"Ayleid"},
    {"name":"Deserted Mine","x":149010,"y":12877,"formId":"0x0001753b","icon":"Mine"},
    {"name":"Fort Entius","x":157631,"y":6311,"formId":"0x000174e5","icon":"Fort"},
    {"name":"Ondo","x":161452,"y":-5599,"formId":"0x0001757c","icon":"Ayleid"},
    {"name":"Arrowshaft Cavern","x":174756,"y":3738,"formId":"0x00015a2f","icon":"Cave"},
    {"name":"Collapsed Mine","x":176575,"y":8025,"formId":"0x0001753a","icon":"Mine"},
    {"name":"Malada","x":189649,"y":-3042,"formId":"0x0002af0b","icon":"Ayleid"},
    {"name":"Abandoned Mine","x":196325,"y":-15451,"formId":"0x00017537","icon":"Mine"},
    {"name":"Fort Cuptor","x":180701,"y":-27563,"formId":"0x000174d1","icon":"Fort"},
    {"name":"Nayon Camp","x":173366,"y":-18930,"formId":"0x000175dd","icon":"Camp"},
    {"name":"Lost Boy Cavern","x":172712,"y":-13537,"formId":"0x00015700","icon":"Cave"},
    {"name":"Peryite's Shrine","x":157339,"y":-19871,"formId":"0x0003b36e","icon":"Shrine"},
    {"name":"Bedrock Cave","x":152869,"y":-31081,"formId":"0x00015a32","icon":"Cave"},
    {"name":"Fort Gold-Throat","x":152737,"y":-42777,"formId":"0x000174ed","icon":"Fort"},
    {"name":"Wendelbek","x":162799,"y":-51156,"formId":"0x0001756c","icon":"Ayleid"},
    {"name":"Leafrot Cave","x":178816,"y":-46692,"formId":"0x00015245","icon":"Cave"},
    {"name":"Garnet Camp","x":181586,"y":-51958,"formId":"0x000175e7","icon":"Camp"},
    {"name":"Fort Redwater","x":177026,"y":-61028,"formId":"0x000174c0","icon":"Fort"},
    {"name":"Redwater Slough","x":171056,"y":-57810,"formId":"0x0017c44a","icon":"Cave"},
    {"name":"Kindred Cave","x":166658,"y":-64464,"formId":"0x00189850","icon":"Cave"},
    {"name":"Seran Camp","x":168931,"y":-70622,"formId":"0x0017cf9d","icon":"Camp"},
    {"name":"Bloodrun Cave","x":164565,"y":-68293,"formId":"0x0018857c","icon":"Cave"},
    {"name":"Marsh-Punk Camp","x":157524,"y":-70683,"formId":"0x000175ed","icon":"Camp"},
    {"name":"Shattered Scales Cave","x":153060,"y":-80157,"formId":"0x000159fe","icon":"Cave"},
    {"name":"Fort Teleman","x":147803,"y":-96811,"formId":"0x000174f9","icon":"Fort"},
    {"name":"Fieldhouse Cave","x":128652,"y":-103754,"formId":"0x00015a00","icon":"Cave"},
    {"name":"Oblivion Gate - Fixed","x":137895,"y":-132036,"formId":"0x000038b4","icon":"Gate"},
    {"name":"Onyx Caverns","x":132977,"y":-131827,"formId":"0x000ad373","icon":"Cave"},
    {"name":"Fort Doublecross","x":117507,"y":-118018,"formId":"0x000174f1","icon":"Fort"},
    {"name":"Blankenmarch","x":109164,"y":-120857,"formId":"0x000177a4","icon":"Settlement"},
    {"name":"Veyond","x":111901,"y":-126115,"formId":"0x000175ad","icon":"Ayleid"},
    {"name":"Amelion Tomb","x":98974,"y":-128406,"formId":"0x000158bc","icon":"Cave"},
    {"name":"Oblivion Gate - Leyawiin","x":103901,"y":-138643,"formId":"0x0000cefc","icon":"Gate"},
    {"name":"Darkfathom Cave","x":106754,"y":-148739,"formId":"0x00035a97","icon":"Cave"},
    {"name":"Oblivion Gate - Fixed","x":123858,"y":-146772,"formId":"0x000038a9","icon":"Gate"},
    {"name":"Fort Blueblood","x":122493,"y":-156127,"formId":"0x000174fd","icon":"Fort"},
    {"name":"Bogwater","x":124394,"y":-170500,"formId":"0x00093480","icon":"Camp"},
    {"name":"Tidewater Cave","x":104217,"y":-170124,"formId":"0x0004fae1","icon":"Cave"},
    {"name":"Forsaken Mine","x":89281,"y":-154047,"formId":"0x00017536","icon":"Mine"},
    {"name":"Greyland","x":79814,"y":-145008,"formId":"0x000177a2","icon":"Settlement"},
    {"name":"Undertow Cavern","x":85632,"y":-133406,"formId":"0x000159f7","icon":"Cave"},
    {"name":"Telepe","x":77697,"y":-131254,"formId":"0x00017584","icon":"Ayleid"},
    {"name":"White Stallion Lodge","x":82555,"y":-126520,"formId":"0x000908c2","icon":"Settlement"},
    {"name":"Water's Edge","x":81881,"y":-112732,"formId":"0x000177a1","icon":"Settlement"},
    {"name":"Border Watch","x":72100,"y":-112809,"formId":"0x0001779f","icon":"Settlement"},
    {"name":"Rockmilk Cave","x":79215,"y":-107792,"formId":"0x00015895","icon":"Cave"},
    {"name":"Sheogorath's Shrine","x":76549,"y":-87857,"formId":"0x0003b370","icon":"Shrine"},
    {"name":"Fort Nomore","x":82567,"y":-79482,"formId":"0x000174d9","icon":"Fort"},
    {"name":"Reedstand Cave","x":90324,"y":-79591,"formId":"0x00015a29","icon":"Cave"},
    {"name":"Fort Redman","x":92268,"y":-102371,"formId":"0x000174fa","icon":"Fort"},
    {"name":"Fisherman's Rock","x":96008,"y":-108157,"formId":"0x00086076","icon":"Camp"},
    {"name":"Nocturnal's Shrine","x":108568,"y":-105591,"formId":"0x0003b36d","icon":"Shrine"},
    {"name":"Arpenia","x":112133,"y":-96023,"formId":"0x000175aa","icon":"Ayleid"},
    {"name":"Barren Mine","x":118272,"y":-84451,"formId":"0x00017552","icon":"Mine"},
    {"name":"Atatar","x":125078,"y":-85678,"formId":"0x00017593","icon":"Ayleid"},
    {"name":"The Drunken Dragon Inn","x":127900,"y":-89560,"formId":"0x000177a9","icon":"Inn"},
    {"name":"Haunted Mine","x":135361,"y":-84739,"formId":"0x0001754a","icon":"Mine"},
    {"name":"Welke","x":145671,"y":-71491,"formId":"0x00017351","icon":"Ayleid"},
    {"name":"Black Dog Camp","x":140721,"y":-55958,"formId":"0x000175e5","icon":"Camp"},
    {"name":"Morahame","x":123658,"y":-42816,"formId":"0x00017573","icon":"Ayleid"},
    {"name":"Mouth of the Panther","x":116045,"y":-62410,"formId":"0x00071318","icon":"Landmark"},
    {"name":"Fort Irony","x":99113,"y":-59975,"formId":"0x000174e1","icon":"Fort"},
    {"name":"Bawn","x":83932,"y":-53992,"formId":"0x00017564","icon":"Ayleid"},
    {"name":"Bawnwatch Camp","x":83645,"y":-47010,"formId":"0x00071310","icon":"Camp"},
    {"name":"Fathis Aren's Tower","x":68889,"y":-56073,"formId":"0x000c431a","icon":"Fort"},
    {"name":"Bloodmayne Cave","x":44736,"y":-33008,"formId":"0x000158bd","icon":"Cave"},
    {"name":"Anutwyll","x":58890,"y":-27120,"formId":"0x00017570","icon":"Ayleid"},
    {"name":"Oblivion Gate - Bravil","x":71302,"y":-27351,"formId":"0x0000cef9","icon":"Gate"},
    {"name":"Flooded Mine","x":67084,"y":-21085,"formId":"0x0001752e","icon":"Mine"},
    {"name":"Veyond Cave","x":70671,"y":-10766,"formId":"0x00015a34","icon":"Cave"},
    {"name":"Oblivion Gate - Fixed","x":65340,"y":-6272,"formId":"0x00003937","icon":"Gate"},
    {"name":"Fort Variela","x":60483,"y":3307,"formId":"0x000174d5","icon":"Fort"},
    {"name":"Robber's Glen Cave","x":51458,"y":-10512,"formId":"0x00015924","icon":"Cave"},
    {"name":"Harcane Grove","x":46925,"y":-1257,"formId":"0x0000a3b6","icon":"Landmark"},
    {"name":"Mingo Cave","x":38917,"y":749,"formId":"0x000159fa","icon":"Cave"},
    {"name":"Inn of Ill Omen","x":30400,"y":-2580,"formId":"0x0001779a","icon":"Inn"},
    {"name":"Oblivion Gate - Fixed","x":28954,"y":756,"formId":"0x00003967","icon":"Gate"},
    {"name":"Faregyl Inn","x":22058,"y":1388,"formId":"0x00017798","icon":"Inn"},
    {"name":"Pothole Caverns","x":21639,"y":-6353,"formId":"0x0018843c","icon":"Cave"},
    {"name":"Wenyandawik","x":35066,"y":-17990,"formId":"0x0001720a","icon":"Ayleid"},
    {"name":"Fort Black Boot","x":10274,"y":-21667,"formId":"0x00017520","icon":"Fort"},
    {"name":"Nenyond Twyll","x":9558,"y":1936,"formId":"0x00017580","icon":"Ayleid"},
    {"name":"Fort Roebeck","x":5221,"y":11052,"formId":"0x000174e8","icon":"Fort"},
    {"name":"Nisin Cave","x":-9464,"y":2234,"formId":"0x000159fb","icon":"Cave"},
    {"name":"Nornalhorst","x":-22022,"y":-3073,"formId":"0x0001755f","icon":"Ayleid"},
    {"name":"Collarbone Camp","x":-29384,"y":-4940,"formId":"0x00181c2f","icon":"Camp"},
    {"name":"Howling Cave","x":-33713,"y":-2658,"formId":"0x00015898","icon":"Cave"},
    {"name":"Gro-Bak Camp","x":-41650,"y":-2911,"formId":"0x000175ef","icon":"Camp"},
    {"name":"Silorn","x":-43115,"y":-14618,"formId":"0x0001756f","icon":"Ayleid"},
    {"name":"Bloodcrust Cavern","x":-56070,"y":-2018,"formId":"0x00015708","icon":"Cave"},
    {"name":"Oblivion Gate - Skingrad","x":-52058,"y":2307,"formId":"0x0000cefd","icon":"Gate"},
    {"name":"Derelict Mine","x":-51974,"y":10147,"formId":"0x00017556","icon":"Mine"},
    {"name":"Shadeleaf Copse","x":-52000,"y":25291,"formId":"0x00094040","icon":"Landmark"},
    {"name":"Grayrock Cave","x":-39729,"y":17862,"formId":"0x00015701","icon":"Cave"},
    {"name":"Fort Vlastarus","x":-34188,"y":7364,"formId":"0x000174c4","icon":"Fort"},
    {"name":"Greenmead Cave","x":-27252,"y":18871,"formId":"0x00015244","icon":"Cave"},
    {"name":"Ceyatatar","x":-24816,"y":31200,"formId":"0x00017574","icon":"Ayleid"},
    {"name":"Haynote Cave","x":-23112,"y":42324,"formId":"0x00015a2b","icon":"Cave"},
    {"name":"Clavicus Vile's Shrine","x":-13291,"y":34720,"formId":"0x0003b365","icon":"Shrine"},
    {"name":"Felgageldt Cave","x":-11667,"y":26882,"formId":"0x000159d5","icon":"Cave"},
    {"name":"Vindasel","x":2118,"y":30391,"formId":"0x000175a6","icon":"Ayleid"},
    {"name":"Fort Virtue","x":-5965,"y":41741,"formId":"0x000174cc","icon":"Fort"},
    {"name":"Fanacasecul","x":-6018,"y":49096,"formId":"0x0001758f","icon":"Ayleid"},
    {"name":"Dzonot Cave","x":11043,"y":57007,"formId":"0x0001598c","icon":"Cave"},
    {"name":"Weye","x":1152,"y":63488,"formId":"0x000ac544","icon":"Settlement"},
    {"name":"Wawnet Inn","x":-2088,"y":62990,"formId":"0x000ac546","icon":"Inn"},
    {"name":"Fort Nikel","x":-14598,"y":67735,"formId":"0x00017510","icon":"Fort"},
    {"name":"Breakneck Cave","x":-30692,"y":62552,"formId":"0x00015a28","icon":"Cave"},
    {"name":"Narfinsel","x":-46608,"y":62944,"formId":"0x0001758c","icon":"Ayleid"},
    {"name":"Molag Bal's Shrine","x":-47106,"y":53565,"formId":"0x0003b368","icon":"Shrine"},
    {"name":"Fort Wooden Hand","x":-39102,"y":48925,"formId":"0x00017508","icon":"Fort"},
    {"name":"Gottlefont Priory","x":-43211,"y":44170,"formId":"0x0001779c","icon":"Settlement"},
    {"name":"Brindle Home","x":-55105,"y":43030,"formId":"0x0001779d","icon":"Settlement"},
    {"name":"Redguard Valley Cave","x":-60543,"y":50291,"formId":"0x0002aa16","icon":"Cave"},
    {"name":"Serpent Hollow Cave","x":-56423,"y":55978,"formId":"0x000159f9","icon":"Cave"},
    {"name":"Oblivion Gate - Fixed","x":-56868,"y":63627,"formId":"0x000038fe","icon":"Gate"},
    {"name":"Fort Carmala","x":-63945,"y":69539,"formId":"0x0001751d","icon":"Fort"},
    {"name":"Hackdirt","x":-67107,"y":64130,"formId":"0x00028552","icon":"Settlement"},
    {"name":"Wendir","x":-75185,"y":69303,"formId":"0x00017359","icon":"Ayleid"},
    {"name":"Weatherleah","x":-75742,"y":53615,"formId":"0x0003f27f","icon":"Settlement"},
    {"name":"Elenglynn","x":-67577,"y":45943,"formId":"0x0001757f","icon":"Ayleid"},
    {"name":"Goblin Jim's Cave","x":-67654,"y":29199,"formId":"0x00015a27","icon":"Cave"},
    {"name":"Oblivion Gate - Fixed","x":-71309,"y":28821,"formId":"0x000039d3","icon":"Gate"},
    {"name":"Bleak Flats Cave","x":-77127,"y":22828,"formId":"0x00048996","icon":"Cave"},
    {"name":"Fallen Rock Cave","x":-91587,"y":22387,"formId":"0x000158bf","icon":"Cave"},
    {"name":"Oblivion Gate - Fixed","x":-99123,"y":14940,"formId":"0x000039ca","icon":"Gate"},
    {"name":"Meridia's Shrine","x":-97994,"y":7969,"formId":"0x0003b36b","icon":"Shrine"},
    {"name":"Cursed Mine","x":-84263,"y":6292,"formId":"0x00017542","icon":"Mine"},
    {"name":"Fat Ramp Camp","x":-84175,"y":-2392,"formId":"0x00181c31","icon":"Camp"},
    {"name":"Fyrelight Cave","x":-97074,"y":-5029,"formId":"0x000158be","icon":"Cave"},
    {"name":"Fort Istirus","x":-105844,"y":-13128,"formId":"0x000174d0","icon":"Fort"},
    {"name":"Ra'sava Camp","x":-112897,"y":-6157,"formId":"0x000175f1","icon":"Camp"},
    {"name":"Miscarcand","x":-113132,"y":1340,"formId":"0x000175af","icon":"Ayleid"},
    {"name":"Shardrock","x":-108307,"y":9418,"formId":"0x000177a5","icon":"Settlement"},
    {"name":"Dagny's Camp","x":-116801,"y":18427,"formId":"0x000175f9","icon":"Camp"},
    {"name":"Talwinque","x":-111263,"y":24030,"formId":"0x00017583","icon":"Ayleid"},
    {"name":"Oblivion Gate - Fixed","x":-122279,"y":25777,"formId":"0x000038cc","icon":"Gate"},
    {"name":"Fort Linchal","x":-129958,"y":15530,"formId":"0x000174d4","icon":"Fort"},
    {"name":"Sandstone Cavern","x":-128939,"y":-288,"formId":"0x0001598a","icon":"Cave"},
    {"name":"Shetcombe Farm","x":-130594,"y":-4228,"formId":"0x000177ad","icon":"Settlement"},
    {"name":"Gnoll's Meeting Camp","x":-118286,"y":-15430,"formId":"0x00181c32","icon":"Camp"},
    {"name":"Mortal Camp","x":-129277,"y":-21857,"formId":"0x000175cd","icon":"Camp"},
    {"name":"Oblivion Gate - Kvatch","x":-144798,"y":-17910,"formId":"0x0000cef7","icon":"Gate"},
    {"name":"Bellator's Folly","x":-151766,"y":-27079,"formId":"0x00017547","icon":"Mine"},
    {"name":"Dasek Moor","x":-145906,"y":-32415,"formId":"0x00017514","icon":"Mine"},
    {"name":"Troll Candle Camp","x":-158325,"y":-38769,"formId":"0x000175f7","icon":"Camp"},
    {"name":"Smoke Hole Cave","x":-165884,"y":-35925,"formId":"0x00015a38","icon":"Cave"},
    {"name":"Gweden Farm","x":-169688,"y":-42808,"formId":"0x00090c8d","icon":"Settlement"},
    {"name":"Fort Strand","x":-178144,"y":-32679,"formId":"0x00017511","icon":"Fort"},
    {"name":"Garlas Agea","x":-173118,"y":-19279,"formId":"0x000ad44e","icon":"Ayleid"},
    {"name":"Oblivion Gate - Fixed","x":-165840,"y":-23920,"formId":"0x00014d1a","icon":"Gate"},
    {"name":"Gottshaw Inn","x":-162375,"y":-16046,"formId":"0x00091cff","icon":"Inn"},
    {"name":"Fort Wariel","x":-166734,"y":2838,"formId":"0x00017519","icon":"Fort"},
    {"name":"Trumbe","x":-161939,"y":9973,"formId":"0x00017563","icon":"Ayleid"},
    {"name":"Brittlerock Cave","x":-169133,"y":12775,"formId":"0x0001589a","icon":"Cave"},
    {"name":"Bodean Camp","x":-174144,"y":6144,"formId":"0x000175f5","icon":"Camp"},
    {"name":"Bleak Mine","x":-189161,"y":2310,"formId":"0x0001752b","icon":"Mine"},
    {"name":"Lord Drad's Estate","x":-194890,"y":3173,"formId":"0x0003756b","icon":"Settlement"},
    {"name":"Atrene Camp","x":-198683,"y":-6236,"formId":"0x000175fb","icon":"Camp"},
    {"name":"Brina Cross Inn","x":-186045,"y":-10372,"formId":"0x000177af","icon":"Inn"},
    {"name":"Whitmond Farm","x":-190992,"y":-23135,"formId":"0x000177b0","icon":"Settlement"},
    {"name":"Hrota Cave","x":-194969,"y":-18042,"formId":"0x0001570b","icon":"Camp"},
    {"name":"Oblivion Gate - Anvil","x":-202117,"y":-23049,"formId":"0x000cd414","icon":"Gate"},
    {"name":"Crowhaven","x":-208980,"y":-10052,"formId":"0x0001750d","icon":"Fort"},
    {"name":"Beldaburo","x":-212407,"y":1161,"formId":"0x00017578","icon":"Ayleid"},
    {"name":"Malacath's Shrine","x":-202274,"y":10675,"formId":"0x0003b369","icon":"Shrine"},
    {"name":"Fort Sutch","x":-193771,"y":13012,"formId":"0x000174f4","icon":"Fort"},
    {"name":"Oblivion Gate - Fixed","x":-187164,"y":14116,"formId":"0x0000cd09","icon":"Gate"},
    {"name":"Varus Camp","x":-182337,"y":26619,"formId":"0x000175e3","icon":"Camp"},
    {"name":"Niryastare","x":-178413,"y":29940,"formId":"0x00017568","icon":"Ayleid"},
    {"name":"Last Chance Camp","x":-171101,"y":36236,"formId":"0x0017cf9e","icon":"Camp"},
    {"name":"Fort Hastrel","x":-156885,"y":29529,"formId":"0x000174c5","icon":"Fort"},
    {"name":"Shattered Mine","x":-149543,"y":18916,"formId":"0x0001754f","icon":"Mine"},
    {"name":"Camp Ales","x":-147334,"y":29756,"formId":"0x000175f3","icon":"Camp"},
    {"name":"Mongrel's Tooth Cave","x":-135234,"y":27317,"formId":"0x00015a33","icon":"Cave"},
    {"name":"Varondo","x":-134762,"y":38577,"formId":"0x0001757b","icon":"Ayleid"},
    {"name":"Infested Mine","x":-138255,"y":48891,"formId":"0x00017546","icon":"Mine"},
    {"name":"Fort Ontus","x":-117322,"y":58016,"formId":"0x000174fc","icon":"Fort"},
    {"name":"Nonungalo","x":-103616,"y":52203,"formId":"0x000a0d17","icon":"Ayleid"},
    {"name":"Brotch Camp","x":-112775,"y":44241,"formId":"0x000175e1","icon":"Camp"},
    {"name":"Echo Mine","x":-108407,"y":38878,"formId":"0x00017543","icon":"Mine"},
    {"name":"Valley View Camp","x":-100289,"y":39285,"formId":"0x000175eb","icon":"Camp"},
    {"name":"Sanguine's Shrine","x":-85773,"y":37435,"formId":"0x00097008","icon":"Shrine"},
    {"name":"Fort Dirich","x":-89684,"y":43045,"formId":"0x00017501","icon":"Fort"},
    {"name":"Rock Bottom Caverns","x":-84728,"y":55264,"formId":"0x0002a829","icon":"Cave"},
    {"name":"Wind Cave","x":-90128,"y":59840,"formId":"0x000644fd","icon":"Cave"},
    {"name":"Broken Promises Cave","x":-95053,"y":74305,"formId":"0x000ad393","icon":"Cave"},
    {"name":"Pillaged Mine","x":-78646,"y":88499,"formId":"0x0001752f","icon":"Mine"},
    {"name":"Oblivion Gate - Chorrol","x":-63444,"y":84905,"formId":"0x0000cefb","icon":"Gate"},
    {"name":"Crumbling Mine","x":-60395,"y":90586,"formId":"0x0001755a","icon":"Mine"},
    {"name":"Odiil Farm","x":-50069,"y":82399,"formId":"0x000ac549","icon":"Settlement"},
    {"name":"Fort Ash","x":-35344,"y":78848,"formId":"0x0007812d","icon":"Fort"},
    {"name":"Yellow Tick Cave","x":-23231,"y":83887,"formId":"0x00015a01","icon":"Cave"},
    {"name":"Lindai","x":-31160,"y":97002,"formId":"0x00017598","icon":"Ayleid"},
    {"name":"Fort Coldcorn","x":-21154,"y":96631,"formId":"0x000174bd","icon":"Fort"},
    {"name":"Fort Empire","x":-7269,"y":90312,"formId":"0x000174d8","icon":"Fort"},
    {"name":"Glademist Cave","x":-14701,"y":108591,"formId":"0x001883a0","icon":"Cave"},
    {"name":"Piukanda","x":486,"y":108253,"formId":"0x00017594","icon":"Ayleid"},
    {"name":"Outlaw Endre's Cave","x":2819,"y":118873,"formId":"0x0001598f","icon":"Cave"},
    {"name":"Underpall Cave","x":-9552,"y":131479,"formId":"0x00015a39","icon":"Cave"},
    {"name":"Moranda","x":-22330,"y":123857,"formId":"0x00017353","icon":"Ayleid"},
    {"name":"Shadow's Rest Cavern","x":-43796,"y":120585,"formId":"0x00015a31","icon":"Cave"},
    {"name":"Hrotanda Vale","x":-59309,"y":112434,"formId":"0x00017567","icon":"Ayleid"},
    {"name":"Nonwyll Cavern","x":-69353,"y":118006,"formId":"0x00015902","icon":"Cave"},
    {"name":"Black Rock Caverns","x":-75134,"y":109759,"formId":"0x0001598e","icon":"Cave"},
    {"name":"Fort Rayles","x":-88830,"y":116281,"formId":"0x000174ec","icon":"Fort"},
    {"name":"Cloud Top","x":-83085,"y":128442,"formId":"0x000cd31f","icon":"Landmark"},
    {"name":"Lipsand Tarn","x":-72113,"y":137415,"formId":"0x0011c8a2","icon":"Ayleid"},
    {"name":"Sancre Tor","x":-49098,"y":136530,"formId":"0x00026ebd","icon":"Fort"},
    {"name":"Ninendava","x":-37923,"y":141601,"formId":"0x0001735b","icon":"Ayleid"},
    {"name":"Hermaeus Mora's Shrine","x":-47329,"y":159680,"formId":"0x0003b366","icon":"Shrine"},
    {"name":"Echo Cave","x":-12396,"y":156721,"formId":"0x00015247","icon":"Cave"},
    {"name":"Boreal Stone Cave","x":-1823,"y":153124,"formId":"0x00038f40","icon":"Cave"},
    {"name":"Applewatch","x":6064,"y":150297,"formId":"0x000177a3","icon":"Settlement"},
    {"name":"Bruma Caverns","x":17588,"y":143178,"formId":"0x000ca3f5","icon":"Cave"},
    {"name":"Capstone Cave","x":9755,"y":152469,"formId":"0x000159b3","icon":"Cave"},
    {"name":"Rielle","x":6418,"y":157370,"formId":"0x00017588","icon":"Ayleid"},
    {"name":"Cloud Ruler Temple","x":13391,"y":160255,"formId":"0x000177ab","icon":"Settlement"},
    {"name":"Serpent's Trail","x":39083,"y":172021,"formId":"0x0000c1f0","icon":"Cave"},
    {"name":"Dragonclaw Rock","x":46067,"y":166045,"formId":"0x000174dc","icon":"Landmark"},
    {"name":"Gnoll Mountain","x":53880,"y":152660,"formId":"0x00188f45","icon":"Landmark"},
    {"name":"Plundered Mine","x":43522,"y":149759,"formId":"0x00017553","icon":"Mine"},
    {"name":"Namira's Shrine","x":48022,"y":140655,"formId":"0x0003b36c","icon":"Shrine"},
    {"name":"Red Ruby Cave","x":54217,"y":133251,"formId":"0x00015a2a","icon":"Cave"},
    {"name":"Frostfire Glade","x":61327,"y":123768,"formId":"0x00024b3d","icon":"Cave"},
    {"name":"The Beast's Maw","x":71495,"y":120810,"formId":"0x000159ff","icon":"Cave"},
    {"name":"Fort Horunn","x":72173,"y":128528,"formId":"0x000174dd","icon":"Fort"},
    {"name":"Silver Tooth Cave","x":82103,"y":129808,"formId":"0x000156fd","icon":"Cave"},
    {"name":"Oblivion Gate - Fixed","x":79155,"y":147790,"formId":"0x00003986","icon":"Gate"},
    {"name":"Sedor","x":88106,"y":134540,"formId":"0x000a3520","icon":"Ayleid"},
    {"name":"Hidden Camp","x":91509,"y":133724,"formId":"0x000175d3","icon":"Camp"},
    {"name":"Gutted Mine","x":99704,"y":130284,"formId":"0x0001752a","icon":"Mine"},
    {"name":"Azura's Shrine","x":111865,"y":138290,"formId":"0x0003b363","icon":"Shrine"},
    {"name":"Temple of the Ancestor Moths","x":118870,"y":146791,"formId":"0x000177a8","icon":"Settlement"},
    {"name":"Dive Rock","x":138134,"y":142738,"formId":"0x000c55ed","icon":"Landmark"},
    {"name":"Aerin's Camp","x":131470,"y":135656,"formId":"0x0017cf9c","icon":"Camp"},
    {"name":"Kingscrest Cavern","x":128415,"y":133572,"formId":"0x00015a35","icon":"Cave"},
    {"name":"Lord Rugdumph's Estate","x":121678,"y":127784,"formId":"0x000177a7","icon":"Settlement"},
    {"name":"Walker Camp","x":129239,"y":125072,"formId":"0x000175e9","icon":"Camp"},
    {"name":"Fanacas","x":127902,"y":118634,"formId":"0x0001735d","icon":"Ayleid"},
    {"name":"Fort Farragut","x":131213,"y":98663,"formId":"0x000174f6","icon":"Fort"},
    {"name":"Kemen","x":139963,"y":95061,"formId":"0x00017560","icon":"Ayleid"},
    {"name":"Rickety Mine","x":137486,"y":92106,"formId":"0x0001753f","icon":"Mine"},
    {"name":"Fort Scinia","x":147693,"y":84351,"formId":"0x00017518","icon":"Fort"},
    {"name":"Hero Hill","x":139975,"y":79852,"formId":"0x00051443","icon":"Landmark"},
    {"name":"Dark Fissure","x":140451,"y":67302,"formId":"0x00015a37","icon":"Cave"},
    {"name":"Doomed Mine","x":144254,"y":64556,"formId":"0x00017557","icon":"Mine"},
    {"name":"Fort Naso","x":139296,"y":54685,"formId":"0x000174c1","icon":"Fort"},
    {"name":"Carbo's Camp","x":133362,"y":64225,"formId":"0x000175d7","icon":"Camp"},
    {"name":"Swampy Cave","x":132378,"y":72254,"formId":"0x00047545","icon":"Cave"},
    {"name":"Vahtacen","x":126857,"y":72010,"formId":"0x000175ae","icon":"Cave"},
    {"name":"Harlun's Watch","x":119838,"y":80270,"formId":"0x000177a6","icon":"Settlement"},
    {"name":"Knights of the Thorn Lodge","x":110810,"y":95984,"formId":"0x000c431b","icon":"Settlement"},
    {"name":"Oblivion Gate - Cheydinhal","x":109041,"y":96580,"formId":"0x0000cef8","icon":"Gate"},
    {"name":"Quickwater Cave","x":112329,"y":104595,"formId":"0x000159fd","icon":"Cave"},
    {"name":"Wind Range Camp","x":112423,"y":108220,"formId":"0x000175d1","icon":"Camp"},
    {"name":"Lake Arrius Caverns","x":107872,"y":117135,"formId":"0x0001e903","icon":"Cave"},
    {"name":"Desolate Mine","x":100175,"y":105337,"formId":"0x00017533","icon":"Mine"},
    {"name":"Barren Cave","x":94565,"y":88203,"formId":"0x00015706","icon":"Cave"},
    {"name":"Roland Jenseric's Cabin","x":75723,"y":83177,"formId":"0x000ac548","icon":"Settlement"},
    {"name":"Belda","x":81088,"y":94412,"formId":"0x00017577","icon":"Ayleid"},
    {"name":"Harm's Folly","x":78518,"y":106584,"formId":"0x000177a0","icon":"Settlement"},
    {"name":"Exhausted Mine","x":71612,"y":102223,"formId":"0x0001754e","icon":"Mine"},
    {"name":"Fort Chalman","x":61511,"y":100234,"formId":"0x000174f0","icon":"Fort"},
    {"name":"Mephala's Shrine","x":55326,"y":112149,"formId":"0x0003b36a","icon":"Shrine"},
    {"name":"Anga","x":45783,"y":121154,"formId":"0x0001735f","icon":"Ayleid"},
    {"name":"Toadstool Hollow","x":34561,"y":133259,"formId":"0x00015707","icon":"Cave"},
    {"name":"Bleaker's Way","x":28506,"y":119103,"formId":"0x00017799","icon":"Settlement"},
    {"name":"Unmarked Cave","x":18554,"y":116327,"formId":"0x00015703","icon":"Cave"},
    {"name":"Fingerbowl Cave","x":15195,"y":106548,"formId":"0x00189790","icon":"Cave"},
    {"name":"Aleswell","x":13009,"y":102949,"formId":"0x00030027","icon":"Settlement"},
    {"name":"Fort Caractacus","x":17178,"y":95292,"formId":"0x00017504","icon":"Fort"},
    {"name":"Sinkhole Cave","x":17538,"y":80749,"formId":"0x000159b1","icon":"Cave"},
    {"name":"Imperial City Sewers - North Exit","x":28997,"y":81694,"formId":"0x000c50d5","icon":"Cave"},
    {"name":"Sercen","x":36376,"y":103358,"formId":"0x00017587","icon":"Ayleid"},
    {"name":"Moss Rock Cavern","x":47493,"y":107132,"formId":"0x0001598b","icon":"Cave"},
    {"name":"Roxey Inn","x":48479,"y":102739,"formId":"0x0005b00d","icon":"Inn"},
    {"name":"Vilverin","x":50804,"y":87399,"formId":"0x0006b588","icon":"Ayleid"},
    {"name":"Sideways Cave","x":51021,"y":78384,"formId":"0x0006c602","icon":"Cave"},
    {"name":"Fort Urasek","x":60768,"y":75680,"formId":"0x0006d76c","icon":"Fort"},
    {"name":"Wellspring Cave","x":64743,"y":60965,"formId":"0x00053fe2","icon":"Cave"},
    {"name":"Fort Magia","x":64913,"y":56657,"formId":"0x000174c8","icon":"Fort"},
    {"name":"Memorial Cave","x":59243,"y":48008,"formId":"0x00015704","icon":"Cave"}
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