import { RecordAI } from "./record_ai";
import { RecordBook } from "./record_book";
import { RecordCell } from "./record_cell";
import { RecordCreature } from "./record_creature";
import { RecordDialog } from "./record_dialog";
import { RecordFaction } from "./record_faction";
import { RecordGeneric } from "./record_generic";
import { SaveBuffer } from "./util";
export declare enum RecordType {
    Faction = 6,
    AlchemicalApparatus = 19,
    Armor = 20,
    Book = 21,
    Clothing = 22,
    Ingredient = 25,
    Light = 26,
    Miscellaneous = 27,
    Weapon = 33,
    Ammo = 34,
    NPC = 35,
    Creature = 36,
    SoulGem = 38,
    Key = 39,
    Potion = 40,
    Cell = 48,
    InstanceReference = 49,
    CharacterReference = 50,
    CreatureReference = 51,
    Dialog = 58,
    Quest = 59,
    AI = 61
}
export default class Record {
    formId: number;
    type: number;
    flags: number;
    version: number;
    dataSize: number;
    data?: number[];
    parsedSubRecord?: RecordBook | RecordFaction | RecordGeneric | RecordCreature | RecordCell | RecordDialog | RecordAI;
    get subRecord(): RecordBook | RecordFaction | RecordGeneric | RecordCreature | RecordCell | RecordDialog | RecordAI | undefined;
    constructor(buf: SaveBuffer);
}
