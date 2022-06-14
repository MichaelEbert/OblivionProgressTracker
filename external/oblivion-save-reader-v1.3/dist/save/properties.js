export class Property {
    constructor(flag, value) {
        this.flag = flag;
        this.value = value;
    }
}
export class PropertyCollection {
    constructor(propertiesNum, properties) {
        this.propertiesNum = propertiesNum;
        this.properties = properties;
    }
}
let getProps = (buf, endOffset) => {
    let propertiesNum = buf.readShort();
    let properties = [];
    if (buf.offset > endOffset) { /* console.log('Invalid object props', propertiesNum, offset, endOffset); */
        return { propertiesNum, properties };
    }
    for (let k = 0; k < propertiesNum; ++k) {
        let flag = buf.readByte();
        if (buf.offset > endOffset) { /* console.log('Invalid object props', propertiesNum, offset, endOffset); */
            return { propertiesNum, properties };
        }
        let value = undefined;
        // This is ugly
        switch (flag) {
            case 0x11:
                value = buf.readInt();
                break;
            case 0x12:
                value = {};
                value.scriptref = buf.readInt();
                value.varNum = buf.readShort();
                value.variables = [];
                for (let l = 0; l < value.varNum; ++l) {
                    let _var = {};
                    _var.varIndex = buf.readShort();
                    _var.varType = buf.readShort();
                    if (_var.varType === 0xF000) {
                        _var.refVar = buf.readInt();
                    }
                    if (_var.varType === 0) {
                        _var.refVar = buf.readDouble();
                    }
                    value.variables.push(_var);
                    if (buf.offset > endOffset) { /* console.log('Invalid object props', propertiesNum, offset, endOffset); */
                        return { propertiesNum, properties };
                    }
                }
                value.unknown = buf.readByte();
                break;
            case 0x1b:
                value = 1;
                break;
            case 0x1c:
                value = 1;
                break;
            case 0x1e:
                value = {};
                value.cell = buf.readInt();
                value.x = buf.readFloat();
                value.y = buf.readFloat();
                value.z = buf.readFloat();
                value.flags = buf.readInt();
                break;
            case 0x1f:
                value = {};
                value.package = buf.readInt();
                value.flags = buf.readInt();
                value.package2 = buf.readInt();
                value.unknown = buf.readShort();
                break;
            case 0x20:
                value = {};
                value.formId = buf.readInt();
                value.data = buf.readByteArray(59);
                break;
            case 0x21:
                value = {};
                value.dataNum = buf.readShort();
                value.data = [];
                for (let l = 0; l < value.dataNum; ++l) {
                    let data = {};
                    data.iref = buf.readInt();
                    data.unknown = buf.readByte();
                    value.data.push(data);
                    if (buf.offset > endOffset) { /* console.log('Invalid object props', propertiesNum, offset, endOffset); */
                        return { propertiesNum, properties };
                    }
                }
                break;
            case 0x22:
                value = buf.readInt();
                break;
            case 0x23:
                value = {};
                value.dataNum = buf.readShort();
                value.data = [];
                for (let l = 0; l < value.dataNum; ++l) {
                    value.data.push(buf.readInt());
                    if (buf.offset > endOffset) { /* console.log('Invalid object props', propertiesNum, offset, endOffset); */
                        return { propertiesNum, properties };
                    }
                }
                break;
            case 0x25:
                value = 1;
                break;
            case 0x27:
                value = buf.readInt();
                break;
            case 0x28:
                value = buf.readInt();
                break;
            case 0x29:
                value = buf.readInt();
                break;
            case 0x2a:
                value = buf.readShort();
                break;
            case 0x2b:
                value = buf.readFloat();
                break;
            case 0x2c:
                value = buf.readByte();
                break;
            case 0x2d:
                value = buf.readFloat();
                break;
            case 0x2e:
                value = buf.readFloat();
                break;
            case 0x2f:
                value = buf.readByte();
                break;
            case 0x31:
                value = {};
                value.lockLevel = buf.readByte();
                value.key = buf.readInt();
                value.flag = buf.readByte();
                break;
            case 0x32:
                value = {};
                value.x = buf.readFloat();
                value.y = buf.readFloat();
                value.z = buf.readFloat();
                value.rX = buf.readFloat();
                value.rY = buf.readFloat();
                value.rZ = buf.readFloat();
                value.destDoor = buf.readInt();
                break;
            case 0x33:
                value = buf.readByte();
                break;
            case 0x35:
                // ?????
                //debugger;
                break;
            case 0x36:
                value = buf.readByteArray(5);
                break;
            case 0x37:
                value = buf.readFloat();
                break;
            case 0x39:
                value = buf.readByteArray(12);
                break;
            case 0x3a:
                value = {};
                value.iref = buf.readInt();
                value.dataNum = buf.readShort();
                value.data = [];
                for (let i = 0; i < value.dataNum; ++i) {
                    value.data.push(buf.readByteArray(61));
                    if (buf.offset > endOffset) { /* console.log('Invalid object props', propertiesNum, offset, endOffset); */
                        return { propertiesNum, properties };
                    }
                }
                break;
            case 0x3c:
                value = buf.readInt();
                break;
            case 0x3d:
                value = buf.readFloat();
                break;
            case 0x3e:
                value = {};
                value.door = buf.readInt();
                value.x = buf.readFloat();
                value.y = buf.readFloat();
                value.z = buf.readFloat();
                break;
            case 0x41:
                value = buf.readFloat();
                break;
            case 0x47:
                value = 1;
                break;
            case 0x48:
                value = buf.readInt();
                break;
            case 0x4a:
                value = buf.readbString();
                break;
            case 0x4b:
                value = {};
                value.unknown = buf.readInt();
                value.dataNum = buf.readShort();
                value.data = buf.readByteArray(value.dataNum);
                // uesp states that sometimes there's 2 extra null bytes here. That's actually a 0x0000 havok moved length apparently?
                break;
            case 0x4e:
                value = {};
                value.dataNum = buf.readShort();
                value.data = [];
                for (let i = 0; i < value.dataNum; ++i) {
                    value.data.push(buf.readByteArray(10));
                    if (buf.offset > endOffset) { /* console.log('Invalid object props', propertiesNum, offset, endOffset); */
                        return { propertiesNum, properties };
                    }
                }
                break;
            case 0x4f:
                value = buf.readByteArray(4);
                break;
            case 0x50:
                value = 1;
                break;
            case 0x52:
                value = buf.readInt();
                break;
            case 0x53:
                value = buf.readInt();
                break;
            case 0x55:
                value = buf.readByte();
                break;
            case 0x59:
                value = {};
                value.convTopic = buf.readbString();
                value.unknown = buf.readByte();
                value.convNum = buf.readByte();
                value.conv = [];
                for (let l = 0; l < value.convNum; ++l) {
                    let conv = {};
                    conv.index = buf.readByte();
                    conv.convQuest = buf.readInt();
                    conv.convDialog = buf.readInt();
                    conv.convInfo = buf.readInt();
                    value.conv.push(conv);
                    if (buf.offset > endOffset) { /* console.log('Invalid object props', propertiesNum, offset, endOffset); */
                        return { propertiesNum, properties };
                    }
                }
                break;
            case 0x5a:
                value = buf.readByte();
                break;
            case 0x5c:
                value = buf.readFloat();
                break;
        }
        properties.push({
            flag: flag,
            value: value,
        });
        if (buf.offset > endOffset) { /* console.log('Invalid object props', propertiesNum, offset, endOffset); */
            return { propertiesNum, properties };
        }
    }
    return {
        propertiesNum,
        properties,
    };
};
export default getProps;
//# sourceMappingURL=properties.js.map