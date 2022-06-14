import CreatedData from "./createddata";
import DeathCount from "./deathcount";
import Global from "./global";
import QuickKey from "./quickkey";
import Record from "./record";
import Region from "./region";
export declare class SaveFile {
    fileId: string;
    majorVersion: number;
    minorVersion: number;
    exeTime: Date;
    headerVersion: number;
    saveHeaderSize: number;
    saveNum: number;
    pcName: string;
    pcLevel: number;
    pcLocation: string;
    gameDays: number;
    gameTicks: number;
    gameTime: Date;
    screenshotSize: number;
    screenshotWidth: number;
    screenshotHeight: number;
    screenshotData: number[];
    pluginsNum: number;
    plugins: string[];
    formIdsOffset: number;
    recordsNum: number;
    nextObjectid: number;
    worldId: number;
    worldX: number;
    worldY: number;
    pcLocationCell: number;
    pcLocationX: number;
    pcLocationY: number;
    pcLocationZ: number;
    globalsNum: number;
    globals: Global[];
    tesClassSize: number;
    numDeathCounts: number;
    deathCounts: DeathCount[];
    gameModeSeconds: number;
    processesSize: number;
    processesData: number[];
    specEventSize: number;
    specEventData: number[];
    weatherSize: number;
    weatherData: number[];
    playerCombatCount: number;
    createdNum: number;
    createdData: CreatedData[];
    quickKeysSize: number;
    quickKeysData: QuickKey[];
    reticuleSize: number;
    reticuleData: number[];
    interfaceSize: number;
    interfaceData: number[];
    regionsSize: number;
    regionsNum: number;
    regions: Region[];
    records: Record[];
    tempEffectsSize: number;
    tempEffectsData: number[];
    formIdsNum: number;
    formIds: number[];
    worldSpacesNum: number;
    worldSpaces: number[];
    static constants: {
        quests: {
            id: string;
            formId: number;
            name: string;
            stages: number[];
            fame: number;
            url: string;
        }[];
        locs: {
            name: string;
            approxX: number;
            approxY: number;
            x: number;
            y: number;
            z: number;
            formId: number;
        }[];
        ignoreLocs: {
            name: string;
            approxX: number;
            approxY: number;
            x: number;
            y: number;
            z: number;
            formId: number;
        }[];
        skills: {
            name: string;
            key: string;
        }[];
        gates: ({
            name: string;
            formId: number;
            x: number;
            y: number;
            z: number;
            fixed: boolean;
            ignore: boolean;
            fame: number;
            marker: number;
        } | {
            name: string;
            formId: number;
            x: number;
            y: number;
            z: number;
            fixed: boolean;
            ignore: boolean;
            fame: number;
            marker?: undefined;
        })[];
        horses: {
            formId: number;
            name: string;
        }[];
        investments: {
            formId: number;
            city: string;
            store: string;
            name: string;
        }[];
        books: {
            formId: number;
            name: string;
            skill: string;
        }[];
        houses: {
            formId: number;
            city: string;
        }[];
        artifacts: {
            id: string;
            name: string;
        }[];
        nirnroots: {
            formId: number;
            x: number;
            y: number;
            z: number;
            cell: string;
        }[];
        arena: {
            formId: number;
            name: string;
            fame: number;
            ignore: boolean;
        }[];
        factions: {
            formId: number;
            name: string;
            maxRankName: string;
            maxRank: number;
            ignore: boolean;
        }[];
        greaterPowers: {
            formId: number;
            name: string;
        }[];
        wayshrines: {
            globalIndex: number;
            name: string;
        }[];
        incompleteQuests: {
            id: string;
            formId: number;
            name: string;
            stages: number[];
            failStages: number[];
            url: string;
        }[];
    };
    constructor(arrayBuf: ArrayBuffer);
    trim(screenshotData?: boolean): void;
}
