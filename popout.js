//Runs in the settings.html page when the user clicks the "Generate Browser Source Tracker" button. Generates a popout window and passes params.
function initBrowserSource(){
    //default settings
    var width = 460;
    var height = 330;
    var columns = 2;

    //Override settings with user preferences if applicable
    width = document.getElementById("browserSourceWidth").value ?? 0;
    height = document.getElementById("browserSourceHeight").value ?? 0;
    columns = document.getElementById("browserSourceColumns").value ?? 0;

    //generate the popout window based on settings.
    var windowParamsURL = 'popout.html?width=' + width + 'px&height=' + height + 'px&columns=' + columns;
    var windowFeaturesStr = 'toolbar=no,menubar=no,width=' + width + ',height=' + height;
    document.getElementById("browserSourceUrl").value = window.location.href.substring(0,window.location.href.lastIndexOf("/"))+"/"+windowParamsURL;
    window.open(windowParamsURL, 'browserSource', windowFeaturesStr);
}

//Runs in the popout.html page. Takes the window parameters generated in the previous function and modifies html elements to fit these parameters.
function initPopoutSettings(){
    //get window parameters from url.
    const windowParams = window.location.search;
    const urlParams = new URLSearchParams(windowParams);

    //update popout html elements based on settings.
    window.getElementById(popoutContainer).style.width = urlParams.get('width');
    window.getElementById(popoutContainer).style.height = urlParams.get('height');
}

//The copy to clipboard function for the popout tracker.
function copyBrowserSourceToClipboard(){
    navigator.clipboard.writeText(document.getElementById("browserSourceUrl").value);
    document.getElementById("browserSourceCopyConfirm").innerHTML = "✅ Copied Browser Source URL to Clipboard!";
}