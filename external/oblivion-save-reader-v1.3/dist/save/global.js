export default class Global {
    constructor(buf) {
        this.iref = 0;
        this.value = 0.0;
        this.iref = buf.readInt();
        this.value = buf.readFloat();
    }
}
//# sourceMappingURL=global.js.map