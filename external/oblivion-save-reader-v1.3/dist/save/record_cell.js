export class RecordCell {
    constructor(record, buf) {
        var _a, _b;
        this.unknown26 = [];
        this.seenUnknown = [];
        this.data = [];
        this.pathgridData = [];
        let startOffset = buf.offset;
        this.cellCreated = (record.flags & 0x1) === 0x1;
        this.unknown2 = (record.flags & 0x4) === 0x4;
        if (record.flags & 0x4000000) {
            this.unknown26 = buf.readByteArray(4);
        }
        if (record.flags & 0x8000000) {
            this.time = buf.readInt();
        }
        if (record.flags & 0x8) {
            this.flags = buf.readByte();
        }
        if (record.flags & 0x10000000) {
            // Due to the format of this not being well understood, this part is complex.
            // Basically just try from the biggest format to smallest, and if the size exceeds the record length,
            // retry with the next smallest
            let clone;
            for (let seenType = 4; seenType >= 0; --seenType) {
                clone = buf.clone();
                if ((record.dataSize - clone.offset) >= 32 && seenType > 0) {
                    this.seenUnknown = clone.readByteArray(32);
                }
                if ((record.dataSize - clone.offset) >= 2 && seenType > 1) {
                    this.dataNum = clone.readShort();
                }
                if ((record.dataSize - clone.offset) >= 2 && seenType > 2) {
                    this.dataFlags = clone.readShort();
                }
                if ((record.dataSize - clone.offset) >= (34 * (((_a = this.dataNum) !== null && _a !== void 0 ? _a : 0) - 1)) && seenType > 3) {
                    for (let i = 0; i < ((_b = this.dataNum) !== null && _b !== void 0 ? _b : 0) - 1; ++i) {
                        this.data.push(clone.readByteArray(34));
                        if (clone.offset > startOffset + record.dataSize)
                            break;
                    }
                }
                if (record.flags & 0x10 && (record.dataSize - clone.offset) >= 1 && (record.dataSize - clone.offset) >= 1 + clone.peekByte()) {
                    this.fullName = clone.readbString();
                }
                if (record.flags & 0x20 && (record.dataSize - clone.offset) >= 4) {
                    this.owner = clone.readInt();
                }
                if (record.flags & 0x1000000 && (record.dataSize - clone.offset) >= 2 && (record.dataSize - clone.offset) >= 2 + (clone.peekShort() * 2)) {
                    this.pathgridDataLen = clone.readShort();
                    this.pathgridData = clone.readShortArray(this.pathgridDataLen);
                }
                // Now check to make sure we consumed all data, reset if not
                if ((clone.offset - startOffset) !== record.dataSize) {
                    if (seenType === 0) {
                        debugger;
                    }
                    delete this.dataNum;
                    delete this.dataFlags;
                    delete this.fullName;
                    delete this.owner;
                    delete this.pathgridDataLen;
                    this.seenUnknown = [];
                    this.data = [];
                    this.pathgridData = [];
                }
                else {
                    break;
                }
            }
            if (clone) {
                buf.advance(clone.offset - buf.offset);
            }
        }
        else {
            if (record.flags & 0x10) {
                this.fullName = buf.readbString();
            }
            if (record.flags & 0x20) {
                this.owner = buf.readInt();
            }
            if (record.flags & 0x1000000) {
                this.pathgridDataLen = buf.readShort();
                for (let i = 0; i < this.pathgridDataLen; ++i) {
                    this.pathgridData.push(buf.readShort());
                }
            }
        }
        if (buf.buffer.byteLength !== buf.offset) {
            debugger;
        }
    }
}
//# sourceMappingURL=record_cell.js.map