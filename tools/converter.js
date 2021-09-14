function colorToClass(color){
	if(color == "#274e13"){
		return "npc";
	}
	else if(color == "#7f6000"){
		return "spellname";
	}
	else if(color == "#660000"){
		return "quest";
	}
	else if(color == "#ff00ff"){
		return "book";
	}
	else if(color == "#1155cc"){
		return "nirnroot";
	}
	else{
		return undefined;
	}
}

function doNotCollapse(tagName){
	const dontCollapseTags = ["OL","UL","LI","#text"];
	for(tag of dontCollapseTags){
		if(tagName == tag){
			return true;
		}
	}
	return false;
}

function collapseHtml(root){
	if(root.children.length == 0){
		return;
	}
	else{
		for(var c of root.children){
			collapseHtml(c);
		}
		
		if(doNotCollapse(root.nodeName)){
			return;
		}
		if(root.children.length == 1){
			const onlyChild = root.children[0];
			if(root.color != null && colorToClass(root.color)){
				//create a new span node with the selected text
				var newSpan = document.createElement("span");
				newSpan.innerText = onlyChild.innerText;
				newSpan.classList.add(colorToClass(root.color));
				root.replaceWith(newSpan);
			}
			else{
				root.replaceWith(onlyChild);	
			}
		}
	}
}

function removeUselessSpans(root){
	var targets = document.getElementsByTagName("SPAN");
	var i = 0;
	while(targets.length > i){
		var d = targets[i];
		if(d.classList.length == 0){
			d.replaceWith(document.createTextNode(d.innerText));
			targets = document.getElementsByTagName("SPAN");
			i = 0;
		}
		else{
			i += 1;
		} 
	}
}
