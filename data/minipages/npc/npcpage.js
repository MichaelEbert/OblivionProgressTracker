function generatePage(npcFormId){
	const npc = findOnTree(jsondata.npc, (e=>e?.formId == npcFormId), (x=>!(x?.formId == null)));
	
	document.getElementById("title").innerText = npc.name ?? "unknown";
	document.getElementById("racep").innerText = npc.race ?? "unknown";	
	document.getElementById("gameImage").src="npc"+npcFormId+"_ingame.jpg";

	commonInit(npc);
}

