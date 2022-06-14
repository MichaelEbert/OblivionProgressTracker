import getProps from "./properties";
import { SaveBuffer } from "./util";
class PlayerObject {
    constructor(buf, maxOffset) {
        this.statistics = {
            skillAdvances: buf.readInt(maxOffset),
            unknown1: buf.readInt(maxOffset),
            largestBounty: buf.readInt(maxOffset),
            killedCreatures: buf.readInt(maxOffset),
            killedPersons: buf.readInt(maxOffset),
            exploredPlaces: buf.readInt(maxOffset),
            lockPicked: buf.readInt(maxOffset),
            picksBroken: buf.readInt(maxOffset),
            capturedSouls: buf.readInt(maxOffset),
            usedIngredients: buf.readInt(maxOffset),
            mixedPotions: buf.readInt(maxOffset),
            oblivionGatesClosed: buf.readInt(maxOffset),
            horsesOwned: buf.readInt(maxOffset),
            housesOwned: buf.readInt(maxOffset),
            investments: buf.readInt(maxOffset),
            booksRead: buf.readInt(maxOffset),
            teachingBooksRead: buf.readInt(maxOffset),
            artifactsFound: buf.readInt(maxOffset),
            hoursSlept: buf.readInt(maxOffset),
            hoursWaited: buf.readInt(maxOffset),
            unknown2: buf.readInt(maxOffset),
            unknown3: buf.readInt(maxOffset),
            unknown4: buf.readInt(maxOffset),
            jokesTold: buf.readInt(maxOffset),
            disease: buf.readInt(maxOffset),
            nirnrootFound: buf.readInt(maxOffset),
            burglary: buf.readInt(maxOffset),
            pickpocketing: buf.readInt(maxOffset),
            unknown5: buf.readInt(maxOffset),
            attacks: buf.readInt(maxOffset),
            murder: buf.readInt(maxOffset),
            stolenHorses: buf.readInt(maxOffset),
            unknown6: buf.readInt(maxOffset),
            unknown7: buf.readInt(maxOffset),
        };
        if (buf.offset > maxOffset)
            return;
        this.unknown1 = buf.readByte(maxOffset);
        this.unknown2 = buf.readByteArray(95);
        this.unknown3 = buf.readByteArray(22);
        this.pcBirthsign = buf.readInt(maxOffset);
        this.unknownArray = [];
        for (let i = 0; i < 13; ++i) {
            this.unknownArray.push(buf.readInt(maxOffset));
        }
        if (buf.offset > maxOffset)
            return;
        this.num2 = buf.readShort(maxOffset);
        this.unknown4 = buf.readByteArray(2);
        this.unknown5 = [];
        for (let i = 0; i < this.num2; ++i) {
            this.unknown5.push(buf.readByteArray(4));
        }
        if (buf.offset > maxOffset)
            return;
        this.unknown6 = buf.readByteArray(2);
        this.randODoorsNum = buf.readShort(maxOffset);
        this.randODoors = [];
        for (let i = 0; i < this.randODoorsNum; ++i) {
            this.randODoors.push({
                door: buf.readInt(maxOffset),
                flag: buf.readByte(maxOffset),
            });
        }
        if (buf.offset > maxOffset)
            return;
        this.unknown7 = buf.readByteArray(2);
        this.activeEffectsNum = buf.readShort(maxOffset);
        this.activeEffects = [];
        for (let i = 0; i < this.activeEffectsNum; ++i) {
            let size = buf.readShort(maxOffset);
            this.activeEffects.push({
                size: size,
                reference: buf.readInt(maxOffset),
                index: buf.readByte(maxOffset),
                effectDetails: buf.readByteArray(size),
            });
        }
        if (buf.offset > maxOffset)
            return;
        this.expPoints = {
            armorer: buf.readFloat(maxOffset),
            athletics: buf.readFloat(maxOffset),
            blade: buf.readFloat(maxOffset),
            block: buf.readFloat(maxOffset),
            blunt: buf.readFloat(maxOffset),
            handToHand: buf.readFloat(maxOffset),
            heavyArmor: buf.readFloat(maxOffset),
            alchemy: buf.readFloat(maxOffset),
            alteration: buf.readFloat(maxOffset),
            conjuration: buf.readFloat(maxOffset),
            destruction: buf.readFloat(maxOffset),
            illusion: buf.readFloat(maxOffset),
            mysticism: buf.readFloat(maxOffset),
            restoration: buf.readFloat(maxOffset),
            acrobatics: buf.readFloat(maxOffset),
            lightArmor: buf.readFloat(maxOffset),
            marksman: buf.readFloat(maxOffset),
            mercantile: buf.readFloat(maxOffset),
            security: buf.readFloat(maxOffset),
            sneak: buf.readFloat(maxOffset),
            speechcraft: buf.readFloat(maxOffset),
        };
        if (buf.offset > maxOffset)
            return;
        this.advancement = buf.readInt(maxOffset);
        this.attrSkillCounts = [];
        for (let i = 0; i < this.advancement; ++i) {
            this.attrSkillCounts.push({
                strength: buf.readByte(maxOffset),
                intelligence: buf.readByte(maxOffset),
                willpower: buf.readByte(maxOffset),
                agility: buf.readByte(maxOffset),
                speed: buf.readByte(maxOffset),
                endurance: buf.readByte(maxOffset),
                personality: buf.readByte(maxOffset),
                luck: buf.readByte(maxOffset),
            });
            if (buf.offset > maxOffset)
                return;
        }
        this.specCounts = {
            combat: buf.readByte(maxOffset),
            magic: buf.readByte(maxOffset),
            stealth: buf.readByte(maxOffset),
        };
        if (buf.offset > maxOffset)
            return;
        this.skillUsage = {
            armorer: buf.readInt(maxOffset),
            athletics: buf.readInt(maxOffset),
            blade: buf.readInt(maxOffset),
            block: buf.readInt(maxOffset),
            blunt: buf.readInt(maxOffset),
            handToHand: buf.readInt(maxOffset),
            heavyArmor: buf.readInt(maxOffset),
            alchemy: buf.readInt(maxOffset),
            alteration: buf.readInt(maxOffset),
            conjuration: buf.readInt(maxOffset),
            destruction: buf.readInt(maxOffset),
            illusion: buf.readInt(maxOffset),
            mysticism: buf.readInt(maxOffset),
            restoration: buf.readInt(maxOffset),
            acrobatics: buf.readInt(maxOffset),
            lightArmor: buf.readInt(maxOffset),
            marksman: buf.readInt(maxOffset),
            mercantile: buf.readInt(maxOffset),
            security: buf.readInt(maxOffset),
            sneak: buf.readInt(maxOffset),
            speechcraft: buf.readInt(maxOffset),
        };
        if (buf.offset > maxOffset)
            return;
        this.majorSkillAdv = buf.readInt(maxOffset);
        this.unknown8 = buf.readByte(maxOffset);
        this.activeQuest = buf.readInt(maxOffset);
        this.knownTopicsNum = buf.readShort(maxOffset);
        this.knownTopics = [];
        for (let i = 0; i < this.knownTopicsNum; ++i) {
            this.knownTopics.push(buf.readInt(maxOffset));
        }
        if (buf.offset > maxOffset)
            return;
        this.openQuestsNum = buf.readShort(maxOffset);
        this.openQuests = [];
        for (let i = 0; i < this.openQuestsNum; ++i) {
            this.openQuests.push({
                quest: buf.readInt(maxOffset),
                questStage: buf.readByte(maxOffset),
                logEntry: buf.readByte(maxOffset),
            });
        }
        if (buf.offset > maxOffset)
            return;
        this.magEffectNum = buf.readInt(maxOffset);
        this.magEffects = [];
        for (let i = 0; i < this.magEffectNum; ++i) {
            this.magEffects.push({ edid: buf.readString(4) });
            if (buf.offset > maxOffset)
                return;
        }
        this.fgGeoSym = buf.readByteArray(200);
        this.fgGeoAsym = buf.readByteArray(120);
        this.fgTexSym = buf.readByteArray(200);
        this.race = buf.readInt(maxOffset);
        this.hair = buf.readInt(maxOffset);
        this.eyes = buf.readInt(maxOffset);
        this.hairLength = buf.readFloat(maxOffset);
        this.hairColor = buf.readByteArray(3);
        this.unknown9 = buf.readByte(maxOffset);
        this.gender = buf.readByte(maxOffset);
        this.pcName = buf.readbzString(maxOffset);
        this.pcClass = buf.readInt(maxOffset);
        // It would be more accurate to actually check if `saveFile.formIds[this.pcClass]===0x00022843` but that would require some refactoring
        if (maxOffset > buf.offset) {
            this.customClass_favoredAttribute1 = buf.readInt(maxOffset);
            this.customClass_favoredAttribute2 = buf.readInt(maxOffset);
            this.customClass_specialization = buf.readInt(maxOffset);
            this.customClass_majorSkill1 = buf.readInt(maxOffset);
            this.customClass_majorSkill2 = buf.readInt(maxOffset);
            this.customClass_majorSkill3 = buf.readInt(maxOffset);
            this.customClass_majorSkill4 = buf.readInt(maxOffset);
            this.customClass_majorSkill5 = buf.readInt(maxOffset);
            this.customClass_majorSkill6 = buf.readInt(maxOffset);
            this.customClass_majorSkill7 = buf.readInt(maxOffset);
            this.customClass_flags = buf.readInt(maxOffset);
            this.customClass_services = buf.readInt(maxOffset);
            this.customClass_skillTrained = buf.readByte(maxOffset);
            this.customClass_maxTrainingLevel = buf.readByte(maxOffset);
            this.customClass_unused = buf.readByteArray(2, maxOffset);
            this.customClass_name = buf.readbString(maxOffset);
            this.customClass_icon = buf.readbString(maxOffset);
        }
        // Looks like a formId or iref but doesn't match up?
        this.unknown10 = buf.readInt(maxOffset);
    }
}
;
export class RecordCreatureReference {
    constructor(record, buf) {
        this.tempAttributeChanges_activeEffects = [];
        this.tempAttributeChanges_unknownEffects = [];
        this.tempAttributeChanges_damageEffects = [];
        this.inventory_items = [];
        this.havokMoved_data = [];
        this.properties = [];
        // Just a type assertion for TS
        if (!record.data)
            return;
        const startOffset = buf.offset;
        const maxOffset = startOffset + record.dataSize;
        try {
            // Handle player data as a special case before anything else even though it's out-of-order
            if (record.formId === 0x14) {
                let playerOffset = undefined;
                for (let i = record.dataSize - 1; i >= 0; --i) {
                    if (record.data[i] === 0x42 && record.data[i - 1] === 0x96
                        && record.data[i - 21] === 0x42 && record.data[i - 22] === 0xec) {
                        playerOffset = buf.offset + i + 29;
                        break;
                    }
                }
                if (playerOffset === undefined) {
                    debugger;
                }
                else {
                    this.player = new PlayerObject(new SaveBuffer(buf.buffer, playerOffset), startOffset + record.dataSize);
                }
            }
            if (record.flags & 0x80000000) {
                this.cellChanged_cell = buf.readInt(maxOffset);
                this.cellChanged_x = buf.readFloat(maxOffset);
                this.cellChanged_y = buf.readFloat(maxOffset);
                this.cellChanged_z = buf.readFloat(maxOffset);
            }
            if (record.flags & 0x2) {
                this.created_flags = buf.readInt(maxOffset);
                this.created_baseItem = buf.readInt(maxOffset);
                this.created_cell = buf.readInt(maxOffset);
                this.created_x = buf.readFloat(maxOffset);
                this.created_y = buf.readFloat(maxOffset);
                this.created_z = buf.readFloat(maxOffset);
                this.created_rX = buf.readFloat(maxOffset);
                this.created_rY = buf.readFloat(maxOffset);
                this.created_rZ = buf.readFloat(maxOffset);
            }
            if (record.flags & 0x4) {
                this.moved_cell = buf.readInt(maxOffset);
                if (this.moved_cell === 0 && record.dataSize <= 5) {
                    this.actorFlag = buf.readByte(maxOffset);
                    return;
                }
                this.moved_x = buf.readFloat(maxOffset);
                this.moved_y = buf.readFloat(maxOffset);
                this.moved_z = buf.readFloat(maxOffset);
                this.moved_rX = buf.readFloat(maxOffset);
                this.moved_rY = buf.readFloat(maxOffset);
                this.moved_rZ = buf.readFloat(maxOffset);
            }
            if (record.flags & 0x8 && !(record.flags & 0x2 || record.flags & 0x4)) {
                this.havokMoved_cell = buf.readInt(maxOffset);
                this.havokMoved_x = buf.readFloat(maxOffset);
                this.havokMoved_y = buf.readFloat(maxOffset);
                this.havokMoved_z = buf.readFloat(maxOffset);
                this.havokMoved_rX = buf.readFloat(maxOffset);
                this.havokMoved_rY = buf.readFloat(maxOffset);
                this.havokMoved_rZ = buf.readFloat(maxOffset);
            }
            if (record.flags & 0x800000 && !(record.flags & 0x2 || record.flags & 0x4 || record.flags & 0x8)) {
                this.oblivionCell = buf.readInt(maxOffset);
            }
            if (record.formId === 0x14) {
                for (let i = 0; i < 71; ++i) {
                    this.tempAttributeChanges_activeEffects.push(buf.readFloat(maxOffset));
                }
                for (let i = 0; i < 71; ++i) {
                    this.tempAttributeChanges_unknownEffects.push(buf.readFloat(maxOffset));
                }
                for (let i = 0; i < 71; ++i) {
                    this.tempAttributeChanges_damageEffects.push(buf.readFloat(maxOffset));
                }
                this.tempAttributeChanges_deltaHealth = buf.readFloat(maxOffset);
                this.tempAttributeChanges_deltaMagicka = buf.readFloat(maxOffset);
                this.tempAttributeChanges_deltaFatigue = buf.readFloat(maxOffset);
            }
            this.actorFlag = buf.readByte(maxOffset);
            if (record.flags & 0x1) {
                this.flags = buf.readInt(maxOffset);
            }
            if (record.flags & 0x8000000) {
                this.inventory_itemNum = buf.readShort(maxOffset);
                for (let i = 0; i < this.inventory_itemNum; ++i) {
                    let iref = buf.readInt(maxOffset);
                    let stackedItemsNum = buf.readInt(maxOffset);
                    let changedEntriesNum = buf.readInt(maxOffset);
                    let changedEntries = [];
                    for (let j = 0; j < changedEntriesNum; ++j) {
                        changedEntries.push(getProps(buf, startOffset + record.dataSize));
                    }
                    this.inventory_items.push({
                        iref: iref,
                        stackedItemsNum: stackedItemsNum,
                        changedEntriesNum: changedEntriesNum,
                        changedEntries: changedEntries,
                    });
                }
            }
            let p = getProps(buf, startOffset + record.dataSize);
            this.propertiesNum = p.propertiesNum;
            this.properties = p.properties;
            if (record.flags & 0x8 && !(record.flags & 0x2 || record.flags & 0x4)) {
                this.havokMoved_dataLen = buf.readShort(maxOffset);
                this.havokMoved_data = buf.readByteArray(this.havokMoved_dataLen);
            }
            if (record.flags & 0x10) {
                this.scale = buf.readFloat(maxOffset);
            }
            this.enabled = (record.flags & 0x40000000) === 0x40000000;
        }
        catch (e) {
            console.log(e);
        }
        if (buf.buffer.byteLength !== buf.offset) {
            // Too many issues decoding these still
            //debugger;
        }
    }
}
//# sourceMappingURL=record_creaturereference.js.map