export class RecordDialog {
    constructor(record, buf) {
        this.topicSaidOnce = (record.flags & 0x10000000) === 0x10000000;
        if (buf.buffer.byteLength !== buf.offset) {
            debugger;
        }
    }
}
//# sourceMappingURL=record_dialog.js.map