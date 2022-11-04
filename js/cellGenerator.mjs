"use strict"

import { updateChecklistProgress } from "./progressCalculation.mjs";
import { findCell } from "./obliviondata.mjs"
//common layout functions used by both main.js and guide.js


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
    CELL_FORMAT_NAMELINK_CHECK_OFF,
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
const CELL_FORMAT_SKIP_ID          = 0x0200; //some npc refs don't have IDs
const CELL_FORMAT_SHOW_ICON        = 0x0400; //should we show an objective icon?
//the following also are link format options
const CELL_FORMAT_NAMELINK_ENABLE  = 0x1000;//should name be a link or just text?
const CELL_FORMAT_NAMELINK_OPEN_IN_IFRAME = 0x2000; //should name link open in iframe?
const CELL_FORMAT_NAMELINK_SHOW_CLASSNAME = 0x4000; //should name show class in front of it?
const CELL_FORMAT_NAMELINK_FORCE_MINIPAGE = 0x8000; //force minipage even for npcs without a refid?
const CELL_FORMAT_NAMELINK_LINK_MAP      = 0x10000; //link map instead of minipage
const CELL_FORMAT_NAMELINK_CHECK_OFF     = 0x20000;//have entire name check off, and have a separate help link.

/**
 * default formatting for items on guide page
 */
const CELL_FORMAT_GUIDE = CELL_FORMAT_SHOW_CHECKBOX | CELL_FORMAT_USE_SPAN
| CELL_FORMAT_NAMELINK_ENABLE | CELL_FORMAT_NAMELINK_OPEN_IN_IFRAME | CELL_FORMAT_PUSH_REFERENCES
| CELL_FORMAT_NAMELINK_CHECK_OFF | CELL_FORMAT_SET_ROW_ONCLICK;

/**
 * Additional items to show on the checklist page. We break them out here so you can more easily categorize them.
 */
const CELL_FORMAT_ADDITIONAL_CHECKLIST_ITEMS = CELL_FORMAT_SET_IDS | CELL_FORMAT_SHOW_NOTES | CELL_FORMAT_SHOW_EXTRACOLUMN | CELL_FORMAT_SHOW_ICON;

/**
 * default formatting for items on checklist page
 */
const CELL_FORMAT_CHECKLIST = CELL_FORMAT_SHOW_CHECKBOX | CELL_FORMAT_SET_ROW_ONCLICK | CELL_FORMAT_NAMELINK_ENABLE | CELL_FORMAT_ADDITIONAL_CHECKLIST_ITEMS;

//rename link constants
const LINK_FORMAT_FORCE_MINIPAGE = CELL_FORMAT_NAMELINK_FORCE_MINIPAGE;
const LINK_FORMAT_ALLOW_IFRAME   = CELL_FORMAT_NAMELINK_OPEN_IN_IFRAME;
const LINK_FORMAT_SHOW_CLASSNAME = CELL_FORMAT_NAMELINK_SHOW_CLASSNAME;
const LINK_FORMAT_LINK_MAP       = CELL_FORMAT_NAMELINK_LINK_MAP;

/**
 * create link element for a data cell. 
 * classname is for minipages. ex: book, npc, etc.
 * @param {object} cell 
 * @param {string} linkName displayed name of the link
 * @param {boolean} forceMinipage force minipage link, even if we don't have a usable id.
 * @param {boolean} forceNewTab force link target to be _blank. Otherwise, will open in iframe.
 */
function createLinkElement(cell, linkName, format){
    const classname = cell.hive.classname;
    //so... uh... during transition from id to formid, we gotta do fallbacks n stuff.
    var usableId = cell.formId ?? cell.id;
    let linky;
    if(format & CELL_FORMAT_NAMELINK_ENABLE){
        linky = document.createElement("a");
        let linkHref;
        const useMinipage = window.settings.minipageCheck && (classname == "book" || classname == "npc") && (usableId != null || format & LINK_FORMAT_FORCE_MINIPAGE);
        if(useMinipage){
            linkHref ="./data/minipages/"+classname+"/"+classname+".html?id="+usableId;
            if(usableId == null){
                linkHref +="&name="+cell.name.replace(" ","_");
            }
        }
        else if(cell.link){
            linkHref = cell.link;
        }
        else{
            if((format & LINK_FORMAT_LINK_MAP) && cell.formId != null){
                linkHref = "./map.html?formId="+cell.formId;
                if((format & LINK_FORMAT_ALLOW_IFRAME) && window.settings.iframeCheck){
                    linkHref += "&topbar=false";
                }
            }
            else{
                linkHref="https://en.uesp.net/wiki/Oblivion:"+linkName.replaceAll(" ","_");
            }
        }
        linky.href = linkHref;	
        if((format & LINK_FORMAT_ALLOW_IFRAME) && window.settings.iframeCheck){
            linky.target="myframe";
        }
        else{
            linky.target="_blank";
        }
    }
    else{
        linky = document.createElement("span");
    }

    //construct link name
    if(format & CELL_FORMAT_NAMELINK_CHECK_OFF){
        linky.innerText = "❔";
    }
    else{
        //capitalize classname
        let capitalClassName = "";
        if(format & LINK_FORMAT_SHOW_CLASSNAME){
            capitalClassName = "[" + classname[0].toUpperCase() + classname.substring(1) + "] ";
        }
        linky.innerText = capitalClassName + linkName;
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
        defaultFormatting |= CELL_FORMAT_DISABLE_CHECKBOX;
        defaultFormatting &= ~CELL_FORMAT_SET_ROW_ONCLICK; //row onclick disabled because the entire element is disabled.
        defaultFormatting &= ~CELL_FORMAT_NAMELINK_ENABLE;
    }

    const classname = cell.hive.classname;
    if(classname != "npc"){
        defaultFormatting &= ~CELL_FORMAT_PUSH_REFERENCES;
    }

    if(classname == "save"){
        defaultFormatting &= ~CELL_FORMAT_NAMELINK_ENABLE;
    }

    if(classname == "location" || classname == "nirnroot"){
        defaultFormatting |= CELL_FORMAT_NAMELINK_LINK_MAP;
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
function initSingleCell(cell, extraColumnName, format = CELL_FORMAT_CHECKLIST){
    const classname = cell.hive.classname;
    if(cell == null){
		console.error("null cell data for class"+classname);
		return;
    }

    format = adjustFormatting(cell, format);

    //constants used for the rest of this function
    let refCell;
    let usableId;
    
    //end html element
    var rowhtml;

    //are we copying from prev element?
    let COPYING = false;

    if(format == lastCell_format && classname == lastCell_classname){
        rowhtml = lastCell_node;//we don't need to clone here because we clone when setting lastCell_node.
        COPYING = true;
    }

    if(cell.ref != null){
        refCell = findCell(cell.ref);
        if(refCell == null){
			console.error("Object not found with form id "+cell.ref);
			return;
		}
    }

    usableId = cell.formId ?? cell.id;
    if(format & CELL_FORMAT_INDIRECT){
        usableId = refCell.formId;
    }
    if(usableId == null && (!(format & CELL_FORMAT_SKIP_ID))){
        console.log("no formid for "+cell.name);
        return;
    }
    
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

    //name
    let usableName = cell.name ?? refCell?.name ?? classname + usableId;
    let nameFormat = format;
    if(format & CELL_FORMAT_NAMELINK_CHECK_OFF){
        nameFormat &= ~CELL_FORMAT_NAMELINK_CHECK_OFF;
        nameFormat &= ~CELL_FORMAT_NAMELINK_ENABLE;
    }
    let linkElement = createLinkElement(cell, usableName, nameFormat);
    if(linkElement == null && debug){
        debugger;
    }
    if(linkElement != null){
        linkElement.classList.add(classname+"Name");
        if(format & CELL_FORMAT_PUSH_REFERENCES){
            linkElement.addEventListener('click',window.pushNpcReferencesToMinipage);
        }
        if(format & CELL_FORMAT_SHOW_CHECKBOX && format & CELL_FORMAT_NAMELINK_CHECK_OFF){
            linkElement.classList.add("defaultCursor");
        }
        if(COPYING){
            rowhtml.replaceChild(linkElement, rowhtml.children[0]);
        }
        else{
            rowhtml.appendChild(linkElement);
        }
    }

    //checkbox
    var rcheck = null;
    if(format & CELL_FORMAT_SHOW_CHECKBOX){
        if(!COPYING){
            rcheck = document.createElement("input");
        }
        else{
            rcheck = rowhtml.children[1];
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
    if((format & CELL_FORMAT_NAMELINK_CHECK_OFF) && (format & CELL_FORMAT_NAMELINK_ENABLE)){
        let htmlHelp;
        let linky = createLinkElement(cell, usableName, format);
        if(!COPYING){
            rowhtml.appendChild(linky);
        }
        else{
            let index;
            if(format & CELL_FORMAT_SHOW_CHECKBOX){
                index = 2;
            }
            else{
                index = 1;
            }
            htmlHelp = rowhtml.children[index];
            if(htmlHelp == null){
                debugger;
            }
            htmlHelp.replaceWith(linky);
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
        if(window.debug){
            console.warn("Cell has no onUpdate during cell generation: ");
            console.warn(cell);
        }
    }
    //update the UI on progress update
    cell.onUpdate.push(function(cell, newValue){
        if(cell.type == "number"){
            rcheck.value = newValue;
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

    //do this before miscChecklistStuff because it's all ID-specific, so it would have to be rewritten anyways.
    lastCell_node = rowhtml.cloneNode(true);
    lastCell_classname = classname;
    lastCell_format = format;

    miscChecklistStuff(rowhtml, cell, extraColumnName, format, rcheck, classname, usableId, COPYING);

    if(format & CELL_FORMAT_SET_ROW_ONCLICK){
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
    if(format & CELL_FORMAT_SHOW_ICON){
        if(cell.icon){
            let htmlIcon = document.createElement("img");
            htmlIcon.src = "images/Icon_" + cell.icon + ".png";
            htmlIcon.style = "width: 16px; padding-right: 5px; vertical-align: center;" //THIS IS PROBABLY A BAD WAY TO DO THIS
            htmlIcon.draggable = "false";
            rowhtml.insertBefore(htmlIcon, rowhtml.children[0]);
        }
    }

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

/**
 * Part of code
 * @param classname 
 * @param usableId 
 * @param format 
 * @param COPYING 
 * @param in_rowhtml 
 */
function createInitialElement(classname, usableId, format, COPYING, in_rowhtml){
    let rowhtml;
    if(COPYING){
        rowhtml = in_rowhtml;
    }
    else{
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
    return rowhtml;
}