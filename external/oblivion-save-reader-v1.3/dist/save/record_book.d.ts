import Record from "./record";
import { SaveBuffer } from "./util";
export declare class RecordBook {
    flags?: number;
    value?: number;
    teaches?: number;
    constructor(record: Record, buf: SaveBuffer);
}
