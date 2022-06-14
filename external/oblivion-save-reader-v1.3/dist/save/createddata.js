export default class CreatedData {
    constructor(buf) {
        this.type = '';
        this.dataSize = 0;
        this.flags = 0;
        this.formid = 0;
        this.version = 0;
        this.data = [];
        this.type = buf.readString(4);
        this.dataSize = buf.readInt();
        this.flags = buf.readInt();
        this.formid = buf.readInt();
        this.version = buf.readInt();
        this.data = buf.readByteArray(this.dataSize);
    }
}
//# sourceMappingURL=createddata.js.map