export default class QuickKey {
    constructor(buf) {
        this.flag = 0;
        this.iref = 0;
        this.flag = buf.readByte();
        if (this.flag & 1) {
            this.iref = buf.readInt();
        }
    }
}
//# sourceMappingURL=quickkey.js.map