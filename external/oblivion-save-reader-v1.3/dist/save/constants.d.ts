export declare const quests: {
    id: string;
    formId: number;
    name: string;
    stages: number[];
    fame: number;
    url: string;
}[];
export declare const locs: {
    name: string;
    approxX: number;
    approxY: number;
    x: number;
    y: number;
    z: number;
    formId: number;
}[];
export declare const ignoreLocs: {
    name: string;
    approxX: number;
    approxY: number;
    x: number;
    y: number;
    z: number;
    formId: number;
}[];
export declare const skills: {
    name: string;
    key: string;
}[];
export declare const gates: ({
    name: string;
    formId: number;
    x: number;
    y: number;
    z: number;
    fixed: boolean;
    ignore: boolean;
    fame: number;
    marker: number;
} | {
    name: string;
    formId: number;
    x: number;
    y: number;
    z: number;
    fixed: boolean;
    ignore: boolean;
    fame: number;
    marker?: undefined;
})[];
export declare const horses: {
    formId: number;
    name: string;
}[];
export declare const investments: {
    formId: number;
    city: string;
    store: string;
    name: string;
}[];
export declare const books: {
    formId: number;
    name: string;
    skill: string;
}[];
export declare const houses: {
    formId: number;
    city: string;
}[];
export declare const artifacts: {
    id: string;
    name: string;
}[];
export declare const nirnroots: {
    formId: number;
    x: number;
    y: number;
    z: number;
    cell: string;
}[];
export declare const arena: {
    formId: number;
    name: string;
    fame: number;
    ignore: boolean;
}[];
export declare const factions: {
    formId: number;
    name: string;
    maxRankName: string;
    maxRank: number;
    ignore: boolean;
}[];
export declare const greaterPowers: {
    formId: number;
    name: string;
}[];
export declare const wayshrines: {
    globalIndex: number;
    name: string;
}[];
export declare const incompleteQuests: {
    id: string;
    formId: number;
    name: string;
    stages: number[];
    failStages: number[];
    url: string;
}[];
