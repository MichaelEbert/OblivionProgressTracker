import Record from "./record";
import { SaveBuffer } from "./util";
export declare class RecordQuest {
    flags?: number;
    stageNum?: number;
    stage: {
        index: number;
        flag: number;
        entryNum: number;
        entries: {
            entryNum: number;
            entryValFloat: number;
            entryValInt: number;
            entryValByteArray: number[];
        }[];
    }[];
    dataNum?: number;
    dataUnknown?: number;
    data: number[][];
    constructor(record: Record, buf: SaveBuffer);
}
