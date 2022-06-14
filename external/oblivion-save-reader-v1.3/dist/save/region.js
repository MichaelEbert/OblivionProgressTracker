export default class Region {
    constructor(buf) {
        this.iref = 0;
        this.unknown6 = 0;
        this.iref = buf.readInt();
        this.unknown6 = buf.readInt();
    }
}
//# sourceMappingURL=region.js.map