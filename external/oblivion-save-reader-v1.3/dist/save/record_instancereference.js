import getProps from "./properties";
export class RecordInstanceReference {
    constructor(record, buf) {
        this.inventory_items = [];
        this.havokMoved_data = [];
        this.properties = [];
        const startOffset = buf.offset;
        const maxOffset = startOffset + record.dataSize;
        try {
            const startOffset = buf.offset;
            if (record.flags & 0x80000000) {
                this.cellChanged_cell = buf.readInt(maxOffset);
                this.cellChanged_x = buf.readFloat(maxOffset);
                this.cellChanged_y = buf.readFloat(maxOffset);
                this.cellChanged_z = buf.readFloat(maxOffset);
            }
            if (record.flags & 0x2) {
                this.created_flags = buf.readInt(maxOffset);
                this.created_baseItem = buf.readInt(maxOffset);
                this.created_cell = buf.readInt(maxOffset);
                this.created_x = buf.readFloat(maxOffset);
                this.created_y = buf.readFloat(maxOffset);
                this.created_z = buf.readFloat(maxOffset);
                this.created_rX = buf.readFloat(maxOffset);
                this.created_rY = buf.readFloat(maxOffset);
                this.created_rZ = buf.readFloat(maxOffset);
            }
            if (record.flags & 0x4) {
                this.moved_cell = buf.readInt(maxOffset);
                if (this.moved_cell === 0 && record.dataSize <= 5) {
                    this.actorFlag = buf.readByte(maxOffset);
                    return;
                }
                this.moved_x = buf.readFloat(maxOffset);
                this.moved_y = buf.readFloat(maxOffset);
                this.moved_z = buf.readFloat(maxOffset);
                this.moved_rX = buf.readFloat(maxOffset);
                this.moved_rY = buf.readFloat(maxOffset);
                this.moved_rZ = buf.readFloat(maxOffset);
            }
            if (record.flags & 0x8 && !(record.flags & 0x2 || record.flags & 0x4)) {
                this.havokMoved_cell = buf.readInt(maxOffset);
                this.havokMoved_x = buf.readFloat(maxOffset);
                this.havokMoved_y = buf.readFloat(maxOffset);
                this.havokMoved_z = buf.readFloat(maxOffset);
                this.havokMoved_rX = buf.readFloat(maxOffset);
                this.havokMoved_rY = buf.readFloat(maxOffset);
                this.havokMoved_rZ = buf.readFloat(maxOffset);
            }
            if (record.flags & 0x800000 && !(record.flags & 0x2 || record.flags & 0x4 || record.flags & 0x8)) {
                this.oblivionCell = buf.readInt(maxOffset);
            }
            if (record.flags & 0x1) {
                this.flags = buf.readInt(maxOffset);
            }
            if (record.flags & 0x8000000) {
                this.inventory_itemNum = buf.readShort(maxOffset);
                for (let i = 0; i < this.inventory_itemNum; ++i) {
                    if (buf.offset - startOffset > record.dataSize) { /* console.log('Invalid object', record, this); */
                        return;
                    }
                    let iref = buf.readInt(maxOffset);
                    let stackedItemsNum = buf.readInt(maxOffset);
                    let changedEntriesNum = buf.readInt(maxOffset);
                    let changedEntries = [];
                    for (let j = 0; j < changedEntriesNum; ++j) {
                        if (buf.offset - startOffset > record.dataSize) { /* console.log('Invalid object', record, this); */
                            return;
                        }
                        changedEntries.push(getProps(buf, startOffset + record.dataSize));
                    }
                    this.inventory_items.push({
                        iref: iref,
                        stackedItemsNum: stackedItemsNum,
                        changedEntriesNum: changedEntriesNum,
                        changedEntries: changedEntries,
                    });
                }
            }
            if (record.flags & 0x173004e0) {
                if (buf.offset - startOffset > record.dataSize) { /* console.log('Invalid object', record, this); */
                    return;
                }
                let props = getProps(buf, startOffset + record.dataSize);
                this.propertiesNum = props.propertiesNum;
                this.properties = props.properties;
            }
            if (record.flags & 0x8 && !(record.flags & 0x2 || record.flags & 0x4)) {
                this.havokMoved_dataLen = buf.readShort(maxOffset);
                this.havokMoved_data = buf.readByteArray(this.havokMoved_dataLen, maxOffset);
            }
            if (record.flags & 0x10) {
                this.scale = buf.readFloat(maxOffset);
            }
            this.enabled = (record.flags & 0x40000000) === 0x40000000;
        }
        catch (e) {
            console.log(e);
        }
        if (buf.buffer.byteLength !== buf.offset) {
            // Too many issues decoding these still
            //debugger;
        }
    }
}
//# sourceMappingURL=record_instancereference.js.map