export class RecordGeneric {
    constructor(record, buf) {
        if (record.flags & 0x1) {
            this.flags = buf.readInt();
        }
        if (record.flags & 0x8) {
            this.value = buf.readInt();
        }
        if (buf.buffer.byteLength !== buf.offset) {
            debugger;
        }
    }
}
//# sourceMappingURL=record_generic.js.map