import Record from "./record";
import { SaveBuffer } from "./util";
export declare class RecordCell {
    cellCreated: boolean;
    unknown2: boolean;
    unknown26: number[];
    time?: number;
    flags?: number;
    seenUnknown: number[];
    dataNum?: number;
    dataFlags?: number;
    data: number[][];
    fullName?: string;
    owner?: number;
    pathgridDataLen?: number;
    pathgridData: number[];
    constructor(record: Record, buf: SaveBuffer);
}
