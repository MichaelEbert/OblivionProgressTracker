import Record from "./record";
import { SaveBuffer } from "./util";
declare type Reaction = {
    unknown1: number;
    unknown2: number;
};
export declare class RecordFaction {
    reactionsNum?: number;
    reactions: Reaction[];
    flags?: number;
    constructor(record: Record, buf: SaveBuffer);
}
export {};
