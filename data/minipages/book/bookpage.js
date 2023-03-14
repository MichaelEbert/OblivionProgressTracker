function generateBookPage(booknumber){
	const book = obliviondata.findOnTree(obliviondata.jsondata.book, (e=>e.formId == booknumber));
	//bad hack until we normalize in v4
	const bookCategory = obliviondata.jsondata.book.elements.find(x=>x.elements.find(b2=>b2 == book))
	
	document.getElementById("title").innerText = book.name;
	document.getElementById("skillp").innerText = bookCategory.name;
	document.getElementById("gameImage").src="book"+booknumber+"_ingame.webp";

	commonInit(book);
}
