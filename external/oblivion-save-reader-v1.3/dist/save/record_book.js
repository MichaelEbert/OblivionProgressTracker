export class RecordBook {
    constructor(record, buf) {
        if (record.flags & 0x1) {
            this.flags = buf.readInt();
        }
        if (record.flags & 0x8) {
            this.value = buf.readInt();
        }
        if (record.flags & 0x4) {
            this.teaches = buf.readByte();
        }
        if (buf.buffer.byteLength !== buf.offset) {
            debugger;
        }
    }
}
//# sourceMappingURL=record_book.js.map