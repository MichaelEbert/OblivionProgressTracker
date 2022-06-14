import { PropertyCollection } from "./properties";
export declare class InventoryItem {
    iref: number;
    stackedItemsNum: number;
    changedEntriesNum: number;
    changedEntries: PropertyCollection[];
    constructor(iref: number, stackedItemsNum: number, changedEntriesNum: number, changedEntries: PropertyCollection[]);
}
