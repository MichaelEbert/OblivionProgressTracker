import { SaveBuffer } from "./util";
export declare class Property {
    flag: number;
    value: any;
    constructor(flag: number, value: any);
}
export declare class PropertyCollection {
    propertiesNum: number;
    properties: Property[];
    constructor(propertiesNum: number, properties: Property[]);
}
declare let getProps: (buf: SaveBuffer, endOffset: number) => PropertyCollection;
export default getProps;
