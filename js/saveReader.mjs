// save reader shim.

export {parseSave}

import { loadJsonData, jsondata, progressClasses, runOnTree, findCell } from './obliviondata.mjs'
import { saveProgressToCookie } from './userdata.mjs';


function UpdateQuest(savedata, saveFile)
{
    return (cell) =>
    {
        let record = saveFile.records.find((e) => e.formId === parseInt(cell.formId));
        if (record) {
            for (const stage of record.subRecord.stage) {
                if (cell.stages.includes(stage.index) && stage.flag&0x1) {
                    savedata.quest[cell.id] = true;
                    return;
                }
            }
        }
        savedata.quest[cell.id] = false;
    };
}

function UpdateLocation(savedata, saveFile)
{
    return (cell) =>
    {
        var gateCloseLinkCell = null;
        if (cell.gateCloseLink != null)
        {
            gateCloseLinkCell = findCell(cell.gateCloseLink);
        }

        var isSet = false;
        let record = saveFile.records.find((e) => e.formId === parseInt(cell.formId));
        if (record) {
            let prop = record.subRecord.properties.find(p=>p.flag===51);
            if (prop && prop.value===3) {
                isSet = true;
                savedata.location[cell.id] = true;
            }
            // update gate closures at the same time
            if (gateCloseLinkCell != null) 
            {
                let gateRecord = saveFile.records.find((e) => e.formId === parseInt(gateCloseLinkCell.formId));
                if (gateRecord && 
                    gateRecord.flags & 0x7000005 === 0x7000005 && 
                    gateRecord.subRecord && 
                    gateRecord.subRecord.flags !== undefined && 
                    (gateRecord.subRecord.flags & 0x2000) === 0x2000) {
                        savedata.misc[gateCloseLinkCell.id] = true;
                }
                else{
                    savedata.misc[gateCloseLinkCell.id] = false;
                }
            }
        }
        if (!isSet)
        {
            savedata.location[cell.id] = false;
            if(gateCloseLinkCell != null)
            {
                savedata.misc[gateCloseLinkCell.id] = false;
            }
        }
    };
}

function UpdateSkill(savedata, saveFile)
{
    return (cell) =>
    {
        var record = saveFile.records.find((e) => e.formId===0x7);
        if (record) {
            const rc = record.subRecord;
            //this needs to be switched like this becuase recordcreature is an actual type.
            var skillLevel = (function(){
                switch(cell.name.toLowerCase()){
                    case "armorer": return rc.armorer;
                    case "athletics": return rc.athletics;
                    case "blade": return rc.blade;
                    case "block": return rc.block;
                    case "blunt": return rc.blunt;
                    case "hand to hand": return rc.handToHand;
                    case "heavy armor": return rc.heavyArmor;
                    case "alchemy": return rc.alchemy;
                    case "alteration": return rc.alteration;
                    case "conjuration": return rc.conjuration;
                    case "destruction": return rc.destruction;
                    case "illusion": return rc.illusion;
                    case "mysticism": return rc.mysticism;
                    case "restoration": return rc.restoration;
                    case "acrobatics": return rc.acrobatics;
                    case "light armor": return rc.lightArmor;
                    case "marksman": return rc.marksman;
                    case "mercantile": return rc.mercantile;
                    case "security": return rc.security;
                    case "sneak": return rc.sneak;
                    case "speechcraft": return rc.speechcraft;
                    default: return null;
                }
            })();
            if (skillLevel >= 100)
            {
                savedata.skill[cell.id] = true;
            }
            else
            {
                savedata.skill[cell.id] = false;
            }
        }
    };
}

function UpdateHorse(savedata, saveFile)
{
    return (cell) =>
    {
        let record = saveFile.records.find((e) => e.formId === parseInt(cell.formId));
        if (record) {
            if (record.flags & 0x40000000) {
                savedata.misc[cell.id] = true;
                return;
            }
        }
        savedata.misc[cell.id] = false;
    };
}

function UpdateHouse(savedata, saveFile)
{
    return (cell) =>
    {
        let record = saveFile.records.find((e) => e.formId === parseInt(cell.formId));
        if (record) {
            if (record.subRecord?.stageNum > 0) {
                savedata.misc[cell.id] = true;
                return;
            }
        }
        savedata.misc[cell.id] = false;
    };
}

function UpdateArena(savedata, saveFile)
{
    return (cell) =>
    {
        let record = saveFile.records.find((e) => e.formId === parseInt(cell.formId));
        if (record) {
            if (record.subRecord?.topicSaidOnce) {
                savedata.fame[cell.id] = true;
                return;
            }
        }
        savedata.fame[cell.id] = false;
    };
}

function UpdatePower(savedata, saveFile)
{
    return (cell) =>
    {
        var record = saveFile.records.find((e) => e.formId===0x7);
        if (record) {
            if (record.subRecord.spellIds.map(i=>saveFile.formIds[i]??i).includes(parseInt(cell.formId))) {
                savedata.misc[cell.id] = true;
                return;
            }
        }
        savedata.misc[cell.id] = false;
    };
}

function UpdateWayshrine(savedata, saveFile)
{
    return (cell) =>
    {
        if (cell.globalIndex != null)
        {
            var fameLevel = saveFile.globals[cell.globalIndex]?.value;
            if (fameLevel > 0)
            {
                savedata.misc[cell.id] = true;
                return;
            }
            savedata.misc[cell.id] = false;
        }
    };
}

function UpdateRank(savedata, saveFile)
{
    return (cell) =>
    {
        let record = saveFile.records.find((e) => e.formId === parseInt(cell.formId));
        if (record) {
            if (record.flags) {
                savedata.misc[cell.id] = true;
                return;
            }
        }
        savedata.misc[cell.id] = false;
    };
}

/// <summary>
/// Update misc. Different because we do multiple different types of update here.
/// </summary>
/// <param name="miscHive"></param>
/// <param name="savedata"></param>
/// <param name="saveFile"></param>
function RunMiscUpdates(miscHive, savedata, saveFile)
{
    if (miscHive == null || miscHive.elements == null)
    {
        return;
    }
    for(const child of miscHive.elements)
    {
        switch (child.name?.toLowerCase())
        {
            case "horses owned":
                runOnTree(child, UpdateHorse(savedata, saveFile));
                break;
            case "houses owned":
                runOnTree(child, UpdateHouse(savedata, saveFile));
                break;
            case "pilgrim's grace":
                runOnTree(child, UpdateWayshrine(savedata, saveFile));
                break;
            case "arena fight fame":
                runOnTree(child, UpdateArena(savedata, saveFile));
                break;
            case "greater powers":
                runOnTree(child, UpdatePower(savedata, saveFile));
                break;
            case "max faction ranks":
                runOnTree(child, UpdateRank(savedata, saveFile));
                break;
            case null:
            default:
                RunMiscUpdates(child, savedata, saveFile);
                break;
        }
    }
}

function UpdateStore(savedata, saveFile)
{
    return (cell) =>
    {
        let record = saveFile.records.find((e) => e.formId === parseInt(cell.formId));
        if (record) {
            if (record.subRecord?.properties.find(p=>p.flag===82)?.value === 500) {
                savedata.store[cell.id] = true;
                return;
            }
        }
        savedata.store[cell.id] = false;
    };
}

function UpdateBook(savedata, saveFile)
{
    return (cell) =>
    {
        let record = saveFile.records.find((e) => e.formId === parseInt(cell.formId));
        if (record) {
            if (record.subRecord?.teaches === 255) {
                savedata.book[cell.id] = true;
            return;
            }
        }
        savedata.book[cell.id] = false;
    };
}

function UpdateNirnroot(savedata, saveFile)
{
    return (cell) =>
    {
        let record = saveFile.records.find((e) => e.formId === parseInt(cell.formId));
        if (record) {
            if (record.flags&0x44000000===0x44000000) {
                savedata.nirnroot[cell.id] = true;
                return;
            }
        }
        savedata.nirnroot[cell.id] = false;
    };
}

/**
 * Import save data from dragged over file
 * @param {DragEvent} e 
 */
function parseSave(e){
    e.preventDefault();
    e.stopPropagation();
    const dt = e.dataTransfer;
    if (dt) {
        const files = dt.files;
        for (const file of files)
        {
            if(!file.name.endsWith(".ess")){
                alert("Invalid save file dragged in.");
                return;
            }
            document.body.style = "opacity:0.5"
            file.arrayBuffer().then((b) => {
                let ts = Date.now();
                console.log(`Starting save file parse at ${ts}`);
                const saveFile = new window.oblivionSaveFile.SaveFile(b);
                let ts2 = Date.now();
                console.log(`Initial parse done, elapsed ${ts2 - ts}`);
                ts = ts2;
                console.log(saveFile);
                return saveFile
            }).then(createUserProgressFile).then((dataFromSave)=>{
                console.log(dataFromSave);
                if(Object.keys(dataFromSave).length == 0){
                    alert("Invalid save file dragged in.");
                    return;
                }
                //copy save #s over
                if(Object.keys(dataFromSave.save).length == 0 && Object.keys(window.savedata.save) > 0){
                    dataFromSave.save = window.savedata.save;
                }
                
                window.savedata = dataFromSave;
                saveProgressToCookie();
                window.location.reload();
            });
        }
    }
};

async function createUserProgressFile(saveFile)
{
    //only load here, so if user is just editing settings they don't reload everything
    if(jsondata == null){
        await loadJsonData('../')
    }
    var savedata = new Object();
    savedata.version = 11;
    for(const klass of progressClasses)
    {
        writeProgressForHive(jsondata[klass.name], savedata, saveFile);
    }
    return savedata;
}

function writeProgressForHive(hive, savedata, saveFile)
{
    const classname = hive.classname;
    savedata[classname] = new Object();

    var updateFunction;
    switch (hive.classname)
    {
        case "quest":
            updateFunction = UpdateQuest(savedata, saveFile);
            break;
        case "location":
            updateFunction = UpdateLocation(savedata, saveFile);
            break;
        case "skill":
            updateFunction = UpdateSkill(savedata, saveFile);
            break;
        case "store":
            updateFunction = UpdateStore(savedata, saveFile);
            break;
        case "nirnroot":
            updateFunction = UpdateNirnroot(savedata, saveFile);
            break;
        case "book":
            updateFunction = UpdateBook(savedata, saveFile);
            break;
        case "misc":
        case "fame":
            RunMiscUpdates(hive, savedata, saveFile);
            return;
        default:
            return;
    }

    runOnTree(hive, updateFunction);
}