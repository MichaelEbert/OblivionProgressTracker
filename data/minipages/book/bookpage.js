
function generateBookPage(booknumber){
	const book = findOnTree(jsondata.book, (e=>e.id == booknumber));
	
	document.getElementById("title").innerText = book.name;
	document.getElementById("skillp").innerText = book.skill	
	document.getElementById("gameImage").src="book"+booknumber+"_ingame.jpg";

	var link;
	if(book.link){
		link = book.link;
	}
	else{
		link = "https://en.uesp.net/wiki/Oblivion:"+book.name.replaceAll(" ","_");
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