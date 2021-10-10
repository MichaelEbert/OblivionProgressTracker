// functions to read alound the speedrun.

var currentSection = -1;
// current line from this section
var sectionLines;
var currentLineIndex = 0;
var currentLineText = "";

function goToNext(){
	if(sectionLines && sectionLines[currentLineIndex]){
		sectionLines[currentLineIndex].style.backgroundColor="";
	}
	
	currentLineIndex +=1;
	if(currentLineIndex < sectionLines?.length){
		let currentLine = sectionLines[currentLineIndex];
		currentLine.style.backgroundColor="lightyellow";

		handleCheckbox(currentLine);
		currentLineText = handleSublist(currentLine);
	}
	else
	{
		currentSection +=1;
		currentLineIndex = 0;
		//update section
		var sections = document.getElementsByClassName("section");
		var thisSection = sections[currentSection];
		sectionLines = thisSection.querySelectorAll("li")
		let currentLine = sectionLines[currentLineIndex];
		currentLine.style.backgroundColor="lightyellow";

		handleCheckbox(currentLine);
		currentLineText = handleSublist(currentLine);
	}
}

function play(){
	window.speechSynthesis.cancel();
	speech.text = currentLineText;
	window.speechSynthesis.speak(speech);
}

function playHotKey(event){
	if (event.key == " " || event.type == "touchstart") {
		event.preventDefault();
		goToNext();
		play();
	}
	if(event.key == " " && sectionLines && sectionLines[currentLineIndex]){
		sectionLines[currentLineIndex].scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
	}
}

function initSpeak(){
	speech = new SpeechSynthesisUtterance();
	addSpeakBox();

	// Disable the "Enable Speech" button
	let enableSpeechBtn = document.getElementById("enable_speech_btn");
	enableSpeechBtn.disabled = true;
	enableSpeechBtn.blur(); //take focus off of button, so we can press space right away
}

function addSpeakBox(){
	/*
	var speechBox = document.createElement("div");
	speechBox.id = "speechbox"
	speechBox.style.float="right";
	speechBox.style.backgroundColor="#FBEFD5";
	speechBox.style.border="1px solid black";
	speechBox.style.marginRight="2em";
		
	var sbTitle = document.createElement("div");
	sbTitle.innerText = "Speech settings";
	speechBox.appendChild(sbTitle);
	
	var sbPlay = document.createElement("button");
	sbPlay.innerText = "play";
	sbPlay.addEventListener('click',play);
	speechBox.appendChild(sbPlay);
	
	var sbNext = document.createElement("button");
	sbNext.innerText = "next";
	sbNext.addEventListener('click',goToNext);
	speechBox.appendChild(sbNext);

	var outerSpeechBox = document.getElementById("sidebar");
	if(outerSpeechBox){
		speechBox.style.position="sticky";
		speechBox.style.top="1em";
	}
	else{
		var outerSpeechBox = document.createElement("div");
		outerSpeechBox.style.position="fixed";
		outerSpeechBox.style.width = "100%";
		outerSpeechBox.style.margin="1em";
		document.body.prepend(outerSpeechBox);
	}
	outerSpeechBox.appendChild(speechBox);
	*/

	var tBar = document.getElementById("topbar");
	var speechBox = document.createElement("div");

	speechBox.className = "topbarSection";
	speechBox.style.backgroundColor = "lightgreen";
	speechBox.innerText = "Speech Enabled.";
	tBar.append(speechBox);

	window.addEventListener('keydown', playHotKey, true);
	window.addEventListener('touchstart', playHotKey, true);
}

function handleCheckbox(currentLine){
	let inputElems = currentLine.getElementsByTagName("input");
	for(let i = 0; i < inputElems.length; i++){
		if(inputElems[i].type == "checkbox" &&
			inputElems[i].checked == false){
			inputElems[i].click();
		}
	}	
}

function handleSublist(currentLine){
	return Array.of(...currentLine.childNodes).filter(x=>x.nodeName != "OL" && x.nodeName != "UL").map(x=>x.textContent).join('');
}