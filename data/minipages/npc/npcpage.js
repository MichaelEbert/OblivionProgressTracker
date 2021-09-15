
function generatePage(npcFormId){
	const npc = findOnTree(jsondata.npc, (e=>e?.formId == npcFormId), (x=>!(x?.formId == null)));
	
	document.getElementById("title").innerText = npc.name ?? "unknown";
	document.getElementById("racep").innerText = npc.race ?? "unknown";	
	document.getElementById("gameImage").src="npc"+npcFormId+"_ingame.jpg";

	var link;
	if(npc.link){
		link = npc.link;
	}
	else{
		link = "https://en.uesp.net/wiki/Oblivion:"+npc.name.replaceAll(" ","_");
	}
	document.getElementById("uespLink").href=link;
}

var tries = 0;
function fallbackIngameImage(eventArgs){
	if(tries < 3){
		eventArgs.target.src = "./../in-game-placeholder.png";	
		tries += 1;
	}
}