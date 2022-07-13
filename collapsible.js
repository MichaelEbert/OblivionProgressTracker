/** 
 * Handles making sections of the speedrun route collapsible.
 */

// Make sections collapsible
function makeCollapsible() {
    let coll = document.getElementsByClassName("sectionTitle")
    for(let i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            let content = this.nextElementSibling;
            if (content.style.display !== "none") {
                content.style.display = "none";
            } else {
                content.style.display = "inline"; // inline is the default
            }
        })
    }
}
makeCollapsible();