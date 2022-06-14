import { SaveBuffer } from "./util";
export default class CreatedData {
    type: string;
    dataSize: number;
    flags: number;
    formid: number;
    version: number;
    data: number[];
    constructor(buf: SaveBuffer);
}
