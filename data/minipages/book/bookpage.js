function generateBookPage(booknumber){
	const book = findOnTree(jsondata.book, (e=>e.formId == booknumber));
	//bad hack until we normalize in v4
	const bookCategory = jsondata.book.elements.find(x=>x.elements.find(b2=>b2 == book))
	
	document.getElementById("title").innerText = book.name;
	document.getElementById("skillp").innerText = bookCategory.name;
	document.getElementById("gameImage").src="book"+booknumber+"_ingame.jpg";

	commonInit(book);
}
