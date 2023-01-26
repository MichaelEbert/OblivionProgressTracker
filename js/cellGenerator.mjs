"use strict"

import { updateChecklistProgress } from "./progressCalculation.mjs";
import { findCell } from "./obliviondata.mjs"
//common layout functions used by both checklist.js and guide.js


export {
    createLinkElement, 
    initSingleCell, 
    //expose the 2 composite formats
    CELL_FORMAT_GUIDE, 
    CELL_FORMAT_CHECKLIST, 
    //and misc others as needed
    CELL_FORMAT_SET_ROW_ONCLICK,
    CELL_FORMAT_SHOW_CHECKBOX,
    CELL_FORMAT_DISABLE_CHECKBOX, 
    CELL_FORMAT_SKIP_ID,
    CELL_FORMAT_NAMELINK_SEPARATE_HELP,
    CELL_FORMAT_NAMELINK_SHOW_CLASSNAME
}

//arrrgh this is so ugly

const CELL_FORMAT_USE_SPAN         = 0x0001; //normally, use div for element.
const CELL_FORMAT_INDIRECT         = 0x0002; //indirect cell. does random stuff.
const CELL_FORMAT_SET_IDS          = 0x0004; //do we want to set the html ids
const CELL_FORMAT_SET_ROW_ONCLICK  = 0x0008; //do we add onclick element to the html row
const CELL_FORMAT_SHOW_NOTES       = 0x0010; //should we show notes?
const CELL_FORMAT_SHOW_EXTRACOLUMN = 0x0020; //should we show extra column?
const CELL_FORMAT_SHOW_CHECKBOX    = 0x0040; //should checkbox be included?
const CELL_FORMAT_DISABLE_CHECKBOX = 0x0080; //disable checkmark
const CELL_FORMAT_PUSH_REFERENCES  = 0x0100; //push references to minipage
const CELL_FORMAT_SKIP_ID          = 0x0200; //skip formID check, link by name only. (some NPCs don't have formIDs specified)
const CELL_FORMAT_SHOW_ICON        = 0x0400; //should we show an objective icon?
const CELL_FORMAT_SHOW_MAPICON     = 0x0800; //should we show a map icon?
//the following also are link format options
const CELL_FORMAT_NAMELINK_ENABLE         = 0x10000;//should name be a link or just text?
const CELL_FORMAT_NAMELINK_OPEN_IN_IFRAME = 0x20000; //should name link open in iframe?
const CELL_FORMAT_NAMELINK_SHOW_CLASSNAME = 0x40000; //should name show class in front of it?
const CELL_FORMAT_NAMELINK_FORCE_MINIPAGE = 0x80000; //force minipage even for npcs without a refid?
const CELL_FORMAT_NAMELINK_MAPLINK        = 0x100000; //this is a map link, not a normal help link. NOT THE SAME as CELL_FORMAT_SHOW_MAPICON.
const CELL_FORMAT_NAMELINK_SEPARATE_HELP  = 0x200000;//have entire name check off, and have a separate help link.

/**
 * default formatting for items on guide page
 */
const CELL_FORMAT_GUIDE = CELL_FORMAT_SHOW_CHECKBOX | CELL_FORMAT_SET_ROW_ONCLICK
| CELL_FORMAT_NAMELINK_ENABLE | CELL_FORMAT_SHOW_MAPICON 
| CELL_FORMAT_NAMELINK_SEPARATE_HELP
| CELL_FORMAT_NAMELINK_OPEN_IN_IFRAME | CELL_FORMAT_PUSH_REFERENCES
| CELL_FORMAT_USE_SPAN;

/**
 * default formatting for items on checklist page
 */
const CELL_FORMAT_CHECKLIST = CELL_FORMAT_SHOW_CHECKBOX | CELL_FORMAT_SET_ROW_ONCLICK 
| CELL_FORMAT_NAMELINK_ENABLE | CELL_FORMAT_SHOW_MAPICON
| CELL_FORMAT_SET_IDS | CELL_FORMAT_SHOW_NOTES | CELL_FORMAT_SHOW_EXTRACOLUMN 
| CELL_FORMAT_SHOW_ICON;

/**
 * Generate the url for a link element. Return null if no link url can be generated with the specified formatting.
 * @param cell 
 * @param linkName 
 * @param format 
 */
function generateLinkUrl(cell, format){
    let linkHref;
    const classname = cell.hive.classname
    // we are generating a map link
    if((format & CELL_FORMAT_NAMELINK_MAPLINK)){
        if(cell.formId == null){
            return null;
        }
        else{
            linkHref = "./map.html?formId=" + cell.formId;
            if((format & CELL_FORMAT_NAMELINK_OPEN_IN_IFRAME) && window.settings.iframeCheck != "off"){
                linkHref += "&topbar=false";
            }
            else{
                //default is too zoomed out on normal screens
                linkHref += "&zoom=0.7";
            }
            return linkHref;
        }
    }
    else{
        if(cell.link){
            return cell.link;
        }
        else{
            return "https://en.uesp.net/wiki/Oblivion:"+cell.name.replaceAll(" ","_");
        }
    }
}


/**
 * create link element for a data cell. Returns an empty element if link could not be created.
 * classname is for minipages. ex: book, npc, etc.
 * @param {object} cell 
 * @param {string} linkName displayed name of the link
 * @param {number} format link formatting options
 */
function createLinkElement(cell, linkName, format){
    const classname = cell.hive.classname;
    let linky;
    // if name links are enabled, or this is a maplink, we should hyperlink it.
    if(format & CELL_FORMAT_NAMELINK_ENABLE || format & CELL_FORMAT_NAMELINK_MAPLINK){
        // generate link that we should use
        linky = document.createElement("a");
        let linkHref = generateLinkUrl(cell, format);
        if(linkHref == null){
            //could not generate link. Return empty link element.
            return linky;
        }
        linky.href = linkHref;	
        //Check settings to see what initial link target to generate.
        if(window.settings.iframeCheck == "window"){ //link goes to consistent external window
            linky.target = "externalSecondWindow";
        }
        else if(window.settings.iframeCheck == "on" || window.settings.iframeCheck == "auto"){//link goes to iframe.
            linky.target = "myframe";
        }
        else{//link goes to new tab. iframeCheck == "off"
            linky.target="_blank";
        }
    }
    else{
        //otherwise, just use a span, as it's not a link.
        linky = document.createElement("span");
    }

    //construct link name
    if(format & CELL_FORMAT_NAMELINK_SEPARATE_HELP || format & CELL_FORMAT_NAMELINK_MAPLINK){
        linky.innerText = linkName;
        linky.classList.add("itemHelp");
    }
    else{
        //capitalize classname
        let capitalClassName = "";
        if(format & CELL_FORMAT_NAMELINK_SHOW_CLASSNAME){
            capitalClassName = "[" + classname[0].toUpperCase() + classname.substring(1) + "] ";
        }
        linky.innerText = capitalClassName + linkName;
    }

    if(format & CELL_FORMAT_NAMELINK_SEPARATE_HELP){
        linky.title = "View on UESP"
    }
    else if(format & CELL_FORMAT_NAMELINK_MAPLINK){
        linky.title = "View on map";
    }
	return linky;
}

/**
 * Some cell types require special formatting. This function does that.
 * @param cell 
 * @param defaultFormatting 
 * @returns new formatting
 */
function adjustFormatting(cell, defaultFormatting){
    if(cell.ref != null){
        defaultFormatting |= CELL_FORMAT_INDIRECT;
        defaultFormatting &= ~CELL_FORMAT_NAMELINK_ENABLE;
        if(!cell.forwardInput){
            defaultFormatting |= CELL_FORMAT_DISABLE_CHECKBOX;
            defaultFormatting &= ~CELL_FORMAT_SET_ROW_ONCLICK; //row onclick disabled because the entire element is disabled.
        }
    }

    const classname = cell.hive.classname;
    if(classname != "npc"){
        defaultFormatting &= ~CELL_FORMAT_PUSH_REFERENCES;
    }

    if(classname == "save"){
        defaultFormatting &= ~CELL_FORMAT_NAMELINK_ENABLE;
    }

    if(!cell.hive.class.containsUserProgress){
        defaultFormatting &= ~CELL_FORMAT_SHOW_CHECKBOX;
        defaultFormatting &= ~CELL_FORMAT_NAMELINK_SEPARATE_HELP;
    }

    return defaultFormatting
}

//optimization: cache the last cell, and clone if possible.
let lastCell_node = null;
let lastCell_format = null;
let lastCell_classname = null;

/**
 * Create a html element(with checkbox, name, etc) for the specified cell with the specified format.
 * @param cell obliviondata cell to create the html element for
 * @param extraColumnName 
 * @param format if format == 0, then regular cell. format == 1 then 
 */
function initSingleCell(cell, extraColumnName, format = CELL_FORMAT_CHECKLIST, customName = null){
    const classname = cell.hive.classname;
    if(cell == null){
		console.error("null cell data for class"+classname);
		return;
    }

    format = adjustFormatting(cell, format);
    let indices = new Indices(format);

    //constants used for the rest of this function
    let refCell;
    let usableId;
    
    //end html element
    var rowhtml;

    //are we copying from prev element?
    let COPYING = false;

    if(format == lastCell_format && classname == lastCell_classname){
        //i wonder if its faster to clone the same node again and again instead of a different node each time...
        rowhtml = lastCell_node; //we don't need to clone here because we clone when setting lastCell_node.
        COPYING = true;
    }

    // get prerequisites: ID, target cell (for ref cells)
    if(cell.ref != null){
        refCell = findCell(cell.ref);
        if(refCell == null){
			console.error("error in reference link: Object not found with form id "+cell.ref);
			return;
		}
    }

    usableId = cell.formId ?? cell.id;
    if(format & CELL_FORMAT_INDIRECT){
        usableId = refCell.formId;
    }
    if(usableId == null && (!(format & CELL_FORMAT_SKIP_ID))){
        console.log("no id found for "+cell.name);
        return;
    }

    if(usableId > 0xFF000000 && window.debug){
        console.warn("Creating element for custom formID "+usableId+"");
    }
    
    //start the actual html
    if(!COPYING){
        if(format & CELL_FORMAT_USE_SPAN){
            rowhtml = document.createElement("SPAN");
        }
        else{
            rowhtml = document.createElement("DIV");
        }
        rowhtml.classList.add(classname);
        rowhtml.classList.add("item");
    }
    rowhtml.setAttribute("clid",usableId);

    //img before name
    if(format & CELL_FORMAT_SHOW_ICON){
        let htmlIcon;
        if(!COPYING){
            htmlIcon = document.createElement("img");
            htmlIcon.classList.add("itemIcon");
            htmlIcon.loading = "lazy";
            htmlIcon.draggable = false;
            rowhtml.appendChild(htmlIcon);
        }
        else{
            htmlIcon = rowhtml.children[indices.ICON];
        }
        if(cell.icon){
            //TODO: make icons uniform again so we don't need this additional check.
            if(cell.icon == "Nirnroot" || cell.icon == "Wayshrine"){ //These have different markings.
                htmlIcon.src = "images/Icon_" + cell.icon + "_Undiscovered.png";
            }
            else {
                htmlIcon.src = "images/Icon_" + cell.icon + ".png";
            }
        }
        else{
            htmlIcon.src = "";
        }
    }

    //name
    let usableName = customName ?? cell.name ?? refCell?.name ?? classname + usableId;
    let nameFormat = format;
    if(format & CELL_FORMAT_NAMELINK_SEPARATE_HELP){
        nameFormat &= ~CELL_FORMAT_NAMELINK_SEPARATE_HELP;
        nameFormat &= ~CELL_FORMAT_NAMELINK_ENABLE;
    }
    let nameElement = createLinkElement(cell, usableName, nameFormat);
    if(nameElement == null){
        debugger;
    }
    else{
        nameElement.classList.add(classname+"Name");
        if(format & CELL_FORMAT_PUSH_REFERENCES){
            nameElement.addEventListener('click',window.pushNpcReferencesToMinipage);
        }
        if(format & CELL_FORMAT_SHOW_CHECKBOX && format & CELL_FORMAT_NAMELINK_SEPARATE_HELP){
            nameElement.classList.add("defaultCursor");
        }
        if(COPYING){
            rowhtml.replaceChild(nameElement, rowhtml.children[indices.NAME]);
        }
        else{
            rowhtml.appendChild(nameElement);
        }
    }

    //checkbox
    var rcheck = null;
    if(format & CELL_FORMAT_SHOW_CHECKBOX){
        if(!COPYING){
            rcheck = document.createElement("input");
        }
        else{
            rcheck = rowhtml.children[indices.CHECKBOX];
        }
        let usableCell = cell;
        if(format & CELL_FORMAT_INDIRECT){
            usableCell = refCell;
        }
        if(usableCell.type){
            if(!COPYING || rcheck.type != usableCell.type){
                rcheck.type= usableCell.type;
                rcheck.size=4;
                if(usableCell.max){
                    rcheck.max = usableCell.max;
                }
            }
            rcheck.addEventListener('change',checkboxClicked);
        }
        else{
            if(!COPYING || rcheck.type != "checkbox"){
                rcheck.type="checkbox";
            }
            rcheck.addEventListener('click',checkboxClicked);
        }
        if(!COPYING){
            rcheck.classList.add(classname+"Check");
            rcheck.classList.add("check"); 

            if(format & CELL_FORMAT_DISABLE_CHECKBOX){
                rcheck.disabled = true;
            }
            rowhtml.appendChild(rcheck);
        }
    }

    //help icon
    if((format & CELL_FORMAT_NAMELINK_SEPARATE_HELP) && (format & CELL_FORMAT_NAMELINK_ENABLE)){
        let htmlHelp;

        let linky = createLinkElement(cell, "❔", format);
        if(!COPYING){
            rowhtml.appendChild(linky);
        }
        else{
            htmlHelp = rowhtml.children[indices.HELP];
            if(htmlHelp == null){
                debugger;
            }
            htmlHelp.replaceWith(linky);
        }
    }

    //map icon
    if(format & CELL_FORMAT_SHOW_MAPICON)
    {
        let usableCell = cell;
        if(cell.ref != null &&( cell.x == null || cell.y == null)){
            usableCell = refCell;
        }
        if(usableCell.location != null){
            usableCell = usableCell.location;
        }
        if(usableCell.x != null && usableCell.y != null && (usableCell.cell == "Outdoors" || usableCell.cell == null)){
            let mapLink = createLinkElement(usableCell, "🗺️", format | CELL_FORMAT_NAMELINK_MAPLINK);

            if(!COPYING){
                rowhtml.appendChild(mapLink);
            }
            else if(rowhtml.children[indices.MAP] == null){
                rowhtml.appendChild(mapLink);
            }
            else{
                rowhtml.children[indices.MAP].replaceWith(mapLink);
            }
        }
        else{
            if(rowhtml.children[indices.MAP] != null){
                rowhtml.children[indices.MAP].remove();
            }
        }
    }

    // update data tree
    if(format & CELL_FORMAT_INDIRECT){
        //check so that we don't link the cells multiple times.
        if(!cell.refInitialized){
            if(cell.type != refCell.type && window.debug){
                console.warn("indirect cell error: indirect cell has different type than referenced cell %s. This will cause weird formatting issues.", refCell.name);
            }
            if(refCell.onUpdate == null){
                refCell.onUpdate = [createIndirectUpdater(cell)];
            }
            else{
                refCell.onUpdate.push(createIndirectUpdater(cell));
            }
            cell.refInitialized = true;
        }
    }

    if(cell.onUpdate == null){
        cell.onUpdate = [];
        if(window.debug && cell.hive.name != "npc"){
            //i dont even know what this means anymore
            console.warn("Cell has no onUpdate during cell generation: ");
            console.warn(cell);
        }
    }
    //update the UI on progress update
    cell.onUpdate.push(function(cell, newValue){
        if(cell.type == "number"){
            if(newValue == undefined){
                rcheck.value = "";//js represents empty box contents as empty string, not undefined
            }
            else{
                rcheck.value = newValue;
            }
        }
        else{
            rcheck.checked = newValue;
            if(newValue){
                rowhtml.classList.add("checked");
            }
            else{
                rowhtml.classList.remove("checked");
            }
        }
    });

    //do this before miscChecklistStuff because miscChecklistStuff is all ID-specific, so it would have to be rewritten anyways.
    lastCell_node = rowhtml.cloneNode(true);
    lastCell_classname = classname;
    lastCell_format = format;

    miscChecklistStuff(rowhtml, cell, extraColumnName, format, rcheck, classname, usableId, COPYING);

    if((format & CELL_FORMAT_SET_ROW_ONCLICK) && !(format & CELL_FORMAT_DISABLE_CHECKBOX)){
        rowhtml.addEventListener('click',window.rowClicked);
    }

    return rowhtml;
}

/**
 * Misc stuff that is only done on the checklist page.
 * @param rowhtml 
 * @param cell 
 * @param extraColumnName 
 * @param format 
 * @param rcheck 
 * @param classname 
 */
function miscChecklistStuff(rowhtml, cell, extraColumnName, format, rcheck, classname, usableId, COPYING){
    //misc stuff

    if(format & CELL_FORMAT_SHOW_NOTES){
        if(cell.notes){
			var notesIcon = document.createElement("span");
			notesIcon.title = cell.notes;
			notesIcon.innerText = "⚠"
			rowhtml.appendChild(notesIcon);
        }
    }

    if(format & CELL_FORMAT_SHOW_EXTRACOLUMN){
        if(extraColumnName && cell[extraColumnName] != null){
            let extraCol = document.createElement("span");
            extraCol.classList.add("detailColumn");
            extraCol.innerText = cell[extraColumnName];
            rowhtml.appendChild(extraCol);
        }
    }
    
    if(format & CELL_FORMAT_SET_IDS && rcheck != null){
        rowhtml.id = classname+usableId.toString();
        rcheck.id = rowhtml.id+"check";
    }
}

/**
 * Creates a function that will be added to the other cell's html that updates this cell's html.
 * @param {*} indirectCell this cell
 */
function createIndirectUpdater(indirectCell){
	return function(_, newValue){
        //indirect values aren't saved, so we can skip saving them.
		updateChecklistProgress(null, newValue, null, indirectCell, true);
	}
}

function Indices(format){
    let index = 0;
    if(format & CELL_FORMAT_SHOW_ICON){
        this.ICON = index;
        index++;
    }

    this.NAME = index;
    index++;

    if(format & CELL_FORMAT_SHOW_CHECKBOX){
        this.CHECKBOX = index;
        index++;
    }

    if((format & CELL_FORMAT_NAMELINK_SEPARATE_HELP) && (format & CELL_FORMAT_NAMELINK_ENABLE)){
        this.HELP = index;
        index++;
    }
    if(format & CELL_FORMAT_SHOW_MAPICON){
        this.MAP = index;
        index++;
    }
}