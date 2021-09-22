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

function displayPageReferences(unsafeReferences){
	console.log("MESSAGE LISTENED TO");
	var referencesContainer = document.createElement('div');
	for(var appearance of event.data){
		if(appearance.anchor == null || appearance.path == null){
			continue;
		}
		var elementContainer = document.createElement('div');
		elementContainer.style.borderBottom = "1px solid gray";
		var nameElement = document.createElement('span');
		nameElement.innerText = appearance.path;
		var spacerElement = document.createElement('span');
		spacerElement.style.width="2em";
		spacerElement.style.display="inline-block";
		var linkElement = document.createElement('a');
		linkElement.innerText = appearance.anchor;
		linkElement.href = "../../../speedrun-3.html#"+appearance.anchor;
		linkElement.target="_top"
		linkElement.style.float="right"
		
		elementContainer.appendChild(nameElement);
		elementContainer.appendChild(spacerElement);
		elementContainer.appendChild(linkElement);
		referencesContainer.appendChild(elementContainer);
	}
	document.getElementById("references")?.appendChild(referencesContainer);
}

window.addEventListener('message',event=>displayPageReferences(event.data), false);