export declare class SaveBuffer {
    buffer: ArrayBuffer;
    private realOffset;
    constructor(buffer: ArrayBuffer, realOffset: number);
    get offset(): number;
    advance(num: number): void;
    clone(): SaveBuffer;
    readDate(endOffset?: number): Date;
    readInt(endOffset?: number): number;
    readShort(endOffset?: number): number;
    peekShort(endOffset?: number): number;
    readByte(endOffset?: number): number;
    peekByte(endOffset?: number): number;
    readFloat(endOffset?: number): number;
    readDouble(endOffset?: number): number;
    readbzString(endOffset?: number): string;
    readbString(endOffset?: number): string;
    readString(len: number, endOffset?: number): string;
    readByteArray(len: number, endOffset?: number): number[];
    readShortArray(len: number, endOffset?: number): number[];
    readIntArray(len: number, endOffset?: number): number[];
    readFloatArray(len: number, endOffset?: number): number[];
    readDoubleArray(len: number, endOffset?: number): number[];
    readbStringArray(len: number, endOffset?: number): string[];
    readbzStringArray(len: number, endOffset?: number): string[];
}
