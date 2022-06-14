export class RecordAI {
    constructor(record, buf) {
        this.neverRun = (record.flags & 0x10000000) === 0x10000000;
        if (buf.buffer.byteLength !== buf.offset) {
            debugger;
        }
    }
}
//# sourceMappingURL=record_ai.js.map