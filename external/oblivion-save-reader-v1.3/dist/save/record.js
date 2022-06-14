import { RecordAI } from "./record_ai";
import { RecordBook } from "./record_book";
import { RecordCell } from "./record_cell";
import { RecordCreature } from "./record_creature";
import { RecordCreatureReference } from "./record_creaturereference";
import { RecordDialog } from "./record_dialog";
import { RecordFaction } from "./record_faction";
import { RecordGeneric } from "./record_generic";
import { RecordInstanceReference } from "./record_instancereference";
import { RecordQuest } from "./record_quest";
import { SaveBuffer } from "./util";
export var RecordType;
(function (RecordType) {
    RecordType[RecordType["Faction"] = 6] = "Faction";
    RecordType[RecordType["AlchemicalApparatus"] = 19] = "AlchemicalApparatus";
    RecordType[RecordType["Armor"] = 20] = "Armor";
    RecordType[RecordType["Book"] = 21] = "Book";
    RecordType[RecordType["Clothing"] = 22] = "Clothing";
    RecordType[RecordType["Ingredient"] = 25] = "Ingredient";
    RecordType[RecordType["Light"] = 26] = "Light";
    RecordType[RecordType["Miscellaneous"] = 27] = "Miscellaneous";
    RecordType[RecordType["Weapon"] = 33] = "Weapon";
    RecordType[RecordType["Ammo"] = 34] = "Ammo";
    RecordType[RecordType["NPC"] = 35] = "NPC";
    RecordType[RecordType["Creature"] = 36] = "Creature";
    RecordType[RecordType["SoulGem"] = 38] = "SoulGem";
    RecordType[RecordType["Key"] = 39] = "Key";
    RecordType[RecordType["Potion"] = 40] = "Potion";
    RecordType[RecordType["Cell"] = 48] = "Cell";
    RecordType[RecordType["InstanceReference"] = 49] = "InstanceReference";
    RecordType[RecordType["CharacterReference"] = 50] = "CharacterReference";
    RecordType[RecordType["CreatureReference"] = 51] = "CreatureReference";
    RecordType[RecordType["Dialog"] = 58] = "Dialog";
    RecordType[RecordType["Quest"] = 59] = "Quest";
    RecordType[RecordType["AI"] = 61] = "AI";
})(RecordType || (RecordType = {}));
;
export default class Record {
    constructor(buf) {
        this.formId = 0;
        this.type = 0;
        this.flags = 0;
        this.version = 0;
        this.dataSize = 0;
        this.formId = buf.readInt();
        this.type = buf.readByte();
        this.flags = buf.readInt();
        this.version = buf.readByte();
        this.dataSize = buf.readShort();
        this.data = buf.readByteArray(this.dataSize);
    }
    get subRecord() {
        if (!this.data)
            return this.parsedSubRecord;
        const tmpBuffer = new ArrayBuffer(this.dataSize);
        const tmpView = new Uint8Array(tmpBuffer);
        for (let i = 0; i < this.dataSize; ++i)
            tmpView[i] = this.data[i];
        const clone = new SaveBuffer(tmpBuffer, 0);
        switch (this.type) {
            case RecordType.Book:
                this.parsedSubRecord = new RecordBook(this, clone);
                break;
            case RecordType.Faction:
                this.parsedSubRecord = new RecordFaction(this, clone);
                break;
            case RecordType.AlchemicalApparatus:
            case RecordType.Armor:
            case RecordType.Clothing:
            case RecordType.Ingredient:
            case RecordType.Light:
            case RecordType.Miscellaneous:
            case RecordType.Ammo:
            case RecordType.SoulGem:
            case RecordType.Potion:
            case RecordType.Weapon:
            case RecordType.Key:
                this.parsedSubRecord = new RecordGeneric(this, clone);
                break;
            case RecordType.NPC:
            case RecordType.Creature:
                this.parsedSubRecord = new RecordCreature(this, clone);
                break;
            case RecordType.Cell:
                this.parsedSubRecord = new RecordCell(this, clone);
                break;
            case RecordType.InstanceReference:
                this.parsedSubRecord = new RecordInstanceReference(this, clone);
                break;
            case RecordType.CharacterReference:
            case RecordType.CreatureReference:
                this.parsedSubRecord = new RecordCreatureReference(this, clone);
                break;
            case RecordType.Dialog:
                this.parsedSubRecord = new RecordDialog(this, clone);
                break;
            case RecordType.Quest:
                this.parsedSubRecord = new RecordQuest(this, clone);
                break;
            case RecordType.AI:
                this.parsedSubRecord = new RecordAI(this, clone);
                break;
        }
        if (this.parsedSubRecord)
            delete this.data;
        return this.parsedSubRecord;
    }
}
//# sourceMappingURL=record.js.map