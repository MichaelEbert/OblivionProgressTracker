//common functions for all minipages
function commonInit(jsonObject){
	var link;
	if(jsonObject.link){
		link = jsonObject.link;
	}
	else{
		link = "https://en.uesp.net/wiki/Oblivion:"+jsonObject.name.replaceAll(" ","_");
	}
	document.getElementById("uespLink").href=link;
	
	if(jsonObject.notes != null){
		document.getElementById("notesp").innerText = jsonObject.notes;
	}
}

var tries = 0;
function fallbackIngameImage(eventArgs){
	if(tries < 3){
		eventArgs.target.src = "./../in-game-placeholder.png";	
		tries += 1;
	}
}