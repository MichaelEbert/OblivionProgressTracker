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
		//table row
		var elementContainer = document.createElement('tr');
		elementContainer.classList.add("referenceRow");

		//table cell: link to reference
		var spacerElement = document.createElement('td');
		var linkElement = document.createElement('a');
		linkElement.innerText = appearance.path;
		linkElement.href = "../../../speedrun-3.html#"+appearance.anchor;
		linkElement.target="_top"
		spacerElement.appendChild(linkElement);

		elementContainer.appendChild(spacerElement);
		referencesContainer.appendChild(elementContainer);
	}
	document.getElementById("references")?.appendChild(referencesContainer);
}

window.addEventListener('message',event=>displayPageReferences(event.data), false);