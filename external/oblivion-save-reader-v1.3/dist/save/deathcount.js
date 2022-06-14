export default class DeathCount {
    constructor(buf) {
        this.actor = 0;
        this.deathCount = 0;
        this.actor = buf.readInt();
        this.deathCount = buf.readShort();
    }
}
//# sourceMappingURL=deathcount.js.map