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
		sectionLines[currentLineIndex].style.backgroundColor="lightyellow";
		currentLineText = sectionLines[currentLineIndex].innerText;
	}
	else
	{
		currentSection +=1;
		currentLineIndex = 0;
		//update section
		var sections = document.getElementsByClassName("section");
		var thisSection = sections[currentSection];
		var thislist = Array.from(thisSection.children).find(x=>x.tagName=="OL")
		sectionLines = thislist.children;
		sectionLines[currentLineIndex].style.backgroundColor="lightyellow";
		currentLineText = sectionLines[currentLineIndex].innerText;
	}
}


function play(){
	speech.text = currentLineText;
	window.speechSynthesis.speak(speech);
	
}


function initSpeak(){
	speech = new SpeechSynthesisUtterance();
	addSpeakBox();
}

function addSpeakBox(){
	var outerSpeechBox = document.createElement("div");
	outerSpeechBox.style.position="fixed";
	outerSpeechBox.style.width = "100%";
	outerSpeechBox.style.margin="1em";
	var speechBox = document.createElement("div");
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

	outerSpeechBox.appendChild(speechBox);
	document.body.prepend(outerSpeechBox);

}