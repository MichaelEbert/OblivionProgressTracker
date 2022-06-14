export class SaveBuffer {
    constructor(buffer, realOffset) {
        this.buffer = buffer;
        this.realOffset = realOffset;
    }
    get offset() {
        return this.realOffset;
    }
    advance(num) {
        this.realOffset += num;
    }
    clone() {
        return new SaveBuffer(this.buffer, this.offset);
    }
    readDate(endOffset) {
        endOffset !== null && endOffset !== void 0 ? endOffset : (endOffset = this.buffer.byteLength);
        // if (!(this.offset + 16 <= endOffset)) debugger;
        // console.assert(this.offset + 16 <= endOffset);
        const wordBuf = new Uint16Array(this.buffer.slice(this.offset, this.realOffset += 16));
        const wYear = wordBuf[0];
        const wMonth = wordBuf[1];
        const wDay = wordBuf[3];
        const wHour = wordBuf[4];
        const wMinute = wordBuf[5];
        const wSecond = wordBuf[6];
        const wMilliseconds = wordBuf[7];
        return new Date(wYear, wMonth, wDay, wHour, wMinute, wSecond, wMilliseconds);
    }
    readInt(endOffset) {
        endOffset !== null && endOffset !== void 0 ? endOffset : (endOffset = this.buffer.byteLength);
        // if (!(this.offset + 4 <= endOffset)) debugger;
        // console.assert(this.offset + 4 <= endOffset);
        const intBuf = new Uint32Array(this.buffer.slice(this.offset, this.realOffset += 4));
        return intBuf[0];
    }
    readShort(endOffset) {
        endOffset !== null && endOffset !== void 0 ? endOffset : (endOffset = this.buffer.byteLength);
        // if (!(this.offset + 2 <= endOffset)) debugger;
        // console.assert(this.offset + 2 <= endOffset);
        const shortBuf = new Uint16Array(this.buffer.slice(this.offset, this.realOffset += 2));
        return shortBuf[0];
    }
    peekShort(endOffset) {
        endOffset !== null && endOffset !== void 0 ? endOffset : (endOffset = this.buffer.byteLength);
        // if (!(this.offset + 2 <= endOffset)) debugger;
        // console.assert(this.offset + 2 <= endOffset);
        const shortBuf = new Uint16Array(this.buffer.slice(this.offset, this.realOffset + 2));
        return shortBuf[0];
    }
    readByte(endOffset) {
        endOffset !== null && endOffset !== void 0 ? endOffset : (endOffset = this.buffer.byteLength);
        // if (!(this.offset + 1 <= endOffset)) debugger;
        // console.assert(this.offset + 1 <= endOffset);
        const byteBuf = new Uint8Array(this.buffer.slice(this.offset, this.realOffset += 1));
        return byteBuf[0];
    }
    peekByte(endOffset) {
        endOffset !== null && endOffset !== void 0 ? endOffset : (endOffset = this.buffer.byteLength);
        // if (!(this.offset + 1 <= endOffset)) debugger;
        // console.assert(this.offset + 1 <= endOffset);
        const byteBuf = new Uint8Array(this.buffer.slice(this.offset, this.realOffset + 1));
        return byteBuf[0];
    }
    readFloat(endOffset) {
        endOffset !== null && endOffset !== void 0 ? endOffset : (endOffset = this.buffer.byteLength);
        // if (!(this.offset + 4 <= endOffset)) debugger;
        // console.assert(this.offset + 4 <= endOffset);
        const floatBuf = new Float32Array(this.buffer.slice(this.offset, this.realOffset += 4));
        return floatBuf[0];
    }
    readDouble(endOffset) {
        endOffset !== null && endOffset !== void 0 ? endOffset : (endOffset = this.buffer.byteLength);
        // if (!(this.offset + 8 <= endOffset)) debugger;
        // console.assert(this.offset + 8 <= endOffset);
        const doubleBuf = new Float64Array(this.buffer.slice(this.offset, this.realOffset += 8));
        return doubleBuf[0];
    }
    readbzString(endOffset) {
        endOffset !== null && endOffset !== void 0 ? endOffset : (endOffset = this.buffer.byteLength);
        const str = this.readbString(endOffset);
        // Remove the null byte at the end of the string
        return str.slice(0, -1);
    }
    readbString(endOffset) {
        endOffset !== null && endOffset !== void 0 ? endOffset : (endOffset = this.buffer.byteLength);
        // if (!(this.offset + 1 <= endOffset)) debugger;
        // console.assert(this.offset + 1 <= endOffset);
        const strLen = this.readByte(endOffset);
        // if (!(this.offset + strLen <= endOffset)) debugger;
        // console.assert(this.offset + strLen <= endOffset);
        const str = this.readString(strLen, endOffset);
        return str;
    }
    readString(len, endOffset) {
        endOffset !== null && endOffset !== void 0 ? endOffset : (endOffset = this.buffer.byteLength);
        // if (!(this.offset + len <= endOffset)) debugger;
        // console.assert(this.offset + len <= endOffset);
        return String.fromCharCode(...new Uint8Array(this.buffer.slice(this.offset, this.realOffset += len)));
    }
    readByteArray(len, endOffset) {
        endOffset !== null && endOffset !== void 0 ? endOffset : (endOffset = this.buffer.byteLength);
        // if (!(this.offset + len <= endOffset)) debugger;
        // console.assert(this.offset + len <= endOffset);
        return [...new Uint8Array(this.buffer.slice(this.offset, this.realOffset += len))];
    }
    readShortArray(len, endOffset) {
        endOffset !== null && endOffset !== void 0 ? endOffset : (endOffset = this.buffer.byteLength);
        // if (!(this.offset + (len * 2) <= endOffset)) debugger;
        // console.assert(this.offset + (len * 2) <= endOffset);
        return [...new Uint16Array(this.buffer.slice(this.offset, this.realOffset += (len * 2)))];
    }
    readIntArray(len, endOffset) {
        endOffset !== null && endOffset !== void 0 ? endOffset : (endOffset = this.buffer.byteLength);
        // if (!(this.offset + (len * 4) <= endOffset)) debugger;
        // console.assert(this.offset + (len * 4) <= endOffset);
        return [...new Uint32Array(this.buffer.slice(this.offset, this.realOffset += (len * 4)))];
    }
    readFloatArray(len, endOffset) {
        endOffset !== null && endOffset !== void 0 ? endOffset : (endOffset = this.buffer.byteLength);
        // if (!(this.offset + (len * 4) <= endOffset)) debugger;
        // console.assert(this.offset + (len * 4) <= endOffset);
        return [...new Float32Array(this.buffer.slice(this.offset, this.realOffset += (len * 4)))];
    }
    readDoubleArray(len, endOffset) {
        endOffset !== null && endOffset !== void 0 ? endOffset : (endOffset = this.buffer.byteLength);
        // if (!(this.offset + (len * 8) <= endOffset)) debugger;
        // console.assert(this.offset + (len * 8) <= endOffset);
        return [...new Float64Array(this.buffer.slice(this.offset, this.realOffset += (len * 8)))];
    }
    readbStringArray(len, endOffset) {
        endOffset !== null && endOffset !== void 0 ? endOffset : (endOffset = this.buffer.byteLength);
        let ret = [];
        for (let i = 0; i < len; ++i) {
            ret.push(this.readbString(endOffset));
        }
        return ret;
    }
    readbzStringArray(len, endOffset) {
        endOffset !== null && endOffset !== void 0 ? endOffset : (endOffset = this.buffer.byteLength);
        let ret = [];
        for (let i = 0; i < len; ++i) {
            ret.push(this.readbzString(endOffset));
        }
        return ret;
    }
}
;
//# sourceMappingURL=util.js.map