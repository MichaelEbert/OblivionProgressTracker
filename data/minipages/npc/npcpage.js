function generatePage(npcFormId){
	let npc = findOnTree(jsondata.npc, (e=>e?.formId == npcFormId), (x=>!(x?.formId == null)));
	if(npc == null){
		npc = {};
		npc.name = new URLSearchParams(window.location.search).get("name");
	}
	document.getElementById("title").innerText = npc?.name ?? "unknown";
	document.getElementById("racep").innerText = npc?.race ?? "unknown";	
	document.getElementById("gameImage").src="npc"+npcFormId+"_ingame.jpg";

	commonInit(npc);
}

