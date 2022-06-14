export class RecordCreature {
    constructor(record, buf) {
        this.factions = [];
        this.spellIds = [];
        this.aiData = [];
        this.modifiers = [];
        if (record.flags & 0x1) {
            this.flags = buf.readInt();
        }
        if (record.flags & 0x8) {
            this.strength = buf.readByte();
            this.intelligence = buf.readByte();
            this.willpower = buf.readByte();
            this.agility = buf.readByte();
            this.speed = buf.readByte();
            this.endurance = buf.readByte();
            this.personality = buf.readByte();
            this.luck = buf.readByte();
        }
        if (record.flags & 0x10) {
            this.dataFlags = buf.readInt();
            this.baseMagicka = buf.readShort();
            this.baseFatigue = buf.readShort();
            this.barterGold = buf.readShort();
            this.level = buf.readShort();
            this.calcMin = buf.readShort();
            this.calcMax = buf.readShort();
        }
        if (record.flags & 0x40) {
            this.factionsNum = buf.readShort();
            for (let i = 0; i < this.factionsNum; ++i) {
                let faction = buf.readInt();
                let factionRank = buf.readByte();
                this.factions.push({
                    faction: faction,
                    factionRank: factionRank,
                });
            }
        }
        if (record.flags & 0x20) {
            this.spellCount = buf.readShort();
            for (let i = 0; i < this.spellCount; ++i) {
                this.spellIds.push(buf.readInt());
            }
        }
        if (record.flags & 0x100) {
            this.aiData.push(buf.readByte());
            this.aiData.push(buf.readByte());
            this.aiData.push(buf.readByte());
            this.aiData.push(buf.readByte());
        }
        if (record.flags & 0x4) {
            this.baseHealth = buf.readInt();
        }
        if (record.flags & 0x10000000) {
            this.modCount = buf.readShort();
            for (let i = 0; i < this.modCount; ++i) {
                let index = buf.readByte();
                let mod = buf.readFloat();
                this.modifiers.push({
                    valueIndex: index,
                    modValue: mod,
                });
            }
        }
        if (record.flags & 0x80) {
            this.fullName = buf.readbString();
        }
        if (record.flags & 0x200) {
            this.armorer = buf.readByte();
            this.athletics = buf.readByte();
            this.blade = buf.readByte();
            this.block = buf.readByte();
            this.blunt = buf.readByte();
            this.handToHand = buf.readByte();
            this.heavyArmor = buf.readByte();
            this.alchemy = buf.readByte();
            this.alteration = buf.readByte();
            this.conjuration = buf.readByte();
            this.destruction = buf.readByte();
            this.illusion = buf.readByte();
            this.mysticism = buf.readByte();
            this.restoration = buf.readByte();
            this.acrobatics = buf.readByte();
            this.lightArmor = buf.readByte();
            this.marksman = buf.readByte();
            this.mercantile = buf.readByte();
            this.security = buf.readByte();
            this.sneak = buf.readByte();
            this.speechcraft = buf.readByte();
        }
        if (record.flags & 0x400) {
            this.combatStyle = buf.readInt();
        }
        if (buf.buffer.byteLength !== buf.offset) {
            debugger;
        }
    }
}
//# sourceMappingURL=record_creature.js.map