import Record from "./record";
import { SaveBuffer } from "./util";
export declare class RecordGeneric {
    flags?: number;
    value?: number;
    constructor(record: Record, buf: SaveBuffer);
}
