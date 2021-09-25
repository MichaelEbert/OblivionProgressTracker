//common functions for all minipages
function commonInit(jsonObject){
	var link;
	if(jsonObject.link){
		link = jsonObject.link;
	}
	else{
		link = "https://en.uesp.net/wiki/Oblivion:"+jsonObject.name?.replaceAll(" ","_");
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
	var referencesContainer = document.createElement('table');
	for(var appearance of event.data){
		if(appearance.anchor == null || appearance.path == null){
			continue;
		}
		var elementContainer = document.createElement('tr');
		elementContainer.classList.add("referenceRow");
		var nameElement = document.createElement('td');
		nameElement.innerText = appearance.path;
		var spacerElement = document.createElement('td');
		var linkElement = document.createElement('a');
		linkElement.innerText = appearance.anchor;
		linkElement.href = "../../../speedrun-3.html#"+appearance.anchor;
		linkElement.target="_top"
		
		elementContainer.appendChild(nameElement);
		elementContainer.appendChild(spacerElement);
		spacerElement.appendChild(linkElement);
		referencesContainer.appendChild(elementContainer);
	}
	document.getElementById("references")?.appendChild(referencesContainer);
}

window.addEventListener('message',event=>displayPageReferences(event.data), false);