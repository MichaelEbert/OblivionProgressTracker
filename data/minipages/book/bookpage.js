
function generateBookPage(booknumber){
	const book = findOnTree(jsondata.book, (e=>e.formId == booknumber));
	//bad hack until we normalize in v4
	const bookCategory = jsondata.book.elements.find(x=>x.elements.find(b2=>b2 == book))
	
	document.getElementById("title").innerText = book.name;
	document.getElementById("skillp").innerText = bookCategory.name;
	document.getElementById("gameImage").src="book"+booknumber+"_ingame.jpg";

	var link;
	if(book.link){
		link = book.link;
	}
	else{
		link = "https://en.uesp.net/wiki/Oblivion:"+book.name.replaceAll(" ","_");
	}
	document.getElementById("uespLink").href=link;
	
	if(book.notes != null){
		document.getElementById("notesp").innerText = book.notes;
	}
}

var tries = 0;
function fallbackIngameImage(eventArgs){
	if(tries < 3){
		eventArgs.target.src = "./../in-game-placeholder.png";	
		tries += 1;
	}
}