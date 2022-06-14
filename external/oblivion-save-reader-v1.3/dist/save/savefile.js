import { quests, locs, ignoreLocs, skills, gates, horses, investments, books, houses, artifacts, nirnroots, arena, factions, greaterPowers, wayshrines, incompleteQuests } from "./constants";
import CreatedData from "./createddata";
import DeathCount from "./deathcount";
import Global from "./global";
import QuickKey from "./quickkey";
import Record from "./record";
import Region from "./region";
import { SaveBuffer } from "./util";
export class SaveFile {
    constructor(arrayBuf) {
        // File header
        this.fileId = 'TES4SAVEGAME';
        const buf = new SaveBuffer(arrayBuf, 0);
        // File header
        this.fileId = buf.readString(12);
        this.majorVersion = buf.readByte();
        this.minorVersion = buf.readByte();
        this.exeTime = buf.readDate();
        // Save header
        this.headerVersion = buf.readInt();
        this.saveHeaderSize = buf.readInt();
        this.saveNum = buf.readInt();
        this.pcName = buf.readbzString();
        this.pcLevel = buf.readShort();
        this.pcLocation = buf.readbzString();
        this.gameDays = buf.readFloat();
        this.gameTicks = buf.readInt();
        this.gameTime = buf.readDate();
        this.screenshotSize = buf.readInt();
        this.screenshotWidth = buf.readInt();
        this.screenshotHeight = buf.readInt();
        this.screenshotData = buf.readByteArray(this.screenshotSize - 8);
        // Plugins
        this.pluginsNum = buf.readByte();
        this.plugins = buf.readbStringArray(this.pluginsNum);
        // Global
        this.formIdsOffset = buf.readInt();
        this.recordsNum = buf.readInt();
        this.nextObjectid = buf.readInt();
        this.worldId = buf.readInt();
        this.worldX = buf.readInt();
        this.worldY = buf.readInt();
        this.pcLocationCell = buf.readInt();
        this.pcLocationX = buf.readFloat();
        this.pcLocationY = buf.readFloat();
        this.pcLocationZ = buf.readFloat();
        this.globalsNum = buf.readShort();
        this.globals = [];
        for (let i = 0; i < this.globalsNum; ++i) {
            this.globals.push(new Global(buf));
        }
        this.tesClassSize = buf.readShort();
        this.numDeathCounts = buf.readInt();
        this.deathCounts = [];
        for (let i = 0; i < this.numDeathCounts; ++i) {
            this.deathCounts.push(new DeathCount(buf));
        }
        this.gameModeSeconds = buf.readFloat();
        this.processesSize = buf.readShort();
        this.processesData = buf.readByteArray(this.processesSize);
        this.specEventSize = buf.readShort();
        this.specEventData = buf.readByteArray(this.specEventSize);
        this.weatherSize = buf.readShort();
        this.weatherData = buf.readByteArray(this.weatherSize);
        this.playerCombatCount = buf.readInt();
        this.createdNum = buf.readInt();
        this.createdData = [];
        for (let i = 0; i < this.createdNum; ++i) {
            this.createdData.push(new CreatedData(buf));
        }
        this.quickKeysSize = buf.readShort();
        let quickKeysEnd = buf.offset + this.quickKeysSize;
        this.quickKeysData = [];
        while (buf.offset < quickKeysEnd) {
            this.quickKeysData.push(new QuickKey(buf));
        }
        this.reticuleSize = buf.readShort();
        this.reticuleData = buf.readByteArray(this.reticuleSize);
        this.interfaceSize = buf.readShort();
        this.interfaceData = buf.readByteArray(this.interfaceSize);
        this.regionsSize = buf.readShort();
        this.regionsNum = buf.readShort();
        this.regions = [];
        for (let i = 0; i < this.regionsNum; ++i) {
            this.regions.push(new Region(buf));
        }
        // Change Records
        // For performance, this works differently
        this.records = [];
        for (let i = 0; i < this.recordsNum; ++i) {
            // Don't pass original SaveBuffer object due to bugs/unknowns in record parsing
            const record = new Record(new SaveBuffer(buf.buffer, buf.offset));
            this.records.push(record);
            buf.advance(12 + record.dataSize);
        }
        // Temporary Effects
        this.tempEffectsSize = buf.readInt();
        this.tempEffectsData = buf.readByteArray(this.tempEffectsSize);
        // Form IDs
        this.formIdsNum = buf.readInt();
        this.formIds = buf.readIntArray(this.formIdsNum);
        // World Spaces
        this.worldSpacesNum = buf.readInt();
        this.worldSpaces = buf.readIntArray(this.worldSpacesNum);
    }
    trim(screenshotData = false) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        for (const loc of SaveFile.constants.locs) {
            (_a = this.records.find((e) => e.formId === loc.formId)) === null || _a === void 0 ? void 0 : _a.subRecord;
        }
        for (const investment of SaveFile.constants.investments) {
            (_b = this.records.find((e) => e.formId === investment.formId)) === null || _b === void 0 ? void 0 : _b.subRecord;
        }
        for (const book of SaveFile.constants.books) {
            (_c = this.records.find((e) => e.formId === book.formId)) === null || _c === void 0 ? void 0 : _c.subRecord;
        }
        for (const horse of SaveFile.constants.horses) {
            (_d = this.records.find((e) => e.formId === horse.formId)) === null || _d === void 0 ? void 0 : _d.subRecord;
        }
        for (const house of SaveFile.constants.houses) {
            (_e = this.records.find((e) => e.formId === house.formId)) === null || _e === void 0 ? void 0 : _e.subRecord;
        }
        for (const root of SaveFile.constants.nirnroots) {
            (_f = this.records.find((e) => e.formId === root.formId)) === null || _f === void 0 ? void 0 : _f.subRecord;
        }
        for (const quest of SaveFile.constants.quests) {
            (_g = this.records.find((e) => e.formId === quest.formId)) === null || _g === void 0 ? void 0 : _g.subRecord;
        }
        for (const gate of SaveFile.constants.gates) {
            (_h = this.records.find((e) => e.formId === gate.formId)) === null || _h === void 0 ? void 0 : _h.subRecord;
        }
        for (const fight of SaveFile.constants.arena) {
            (_j = this.records.find((e) => e.formId === fight.formId)) === null || _j === void 0 ? void 0 : _j.subRecord;
        }
        this.records.filter(r => [0x14, 0x7].includes(r.formId)).forEach(r => r.subRecord);
        if (screenshotData) {
            this.screenshotData = [];
        }
    }
}
// Constants used for reading
SaveFile.constants = {
    quests: quests,
    locs: locs,
    ignoreLocs: ignoreLocs,
    skills: skills,
    gates: gates,
    horses: horses,
    investments: investments,
    books: books,
    houses: houses,
    artifacts: artifacts,
    nirnroots: nirnroots,
    arena: arena,
    factions: factions,
    greaterPowers: greaterPowers,
    wayshrines: wayshrines,
    incompleteQuests: incompleteQuests,
};
//# sourceMappingURL=savefile.js.map