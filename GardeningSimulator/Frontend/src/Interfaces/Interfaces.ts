export interface Attribute {
    // eslint-disable-next-line camelcase
    trait_type: string;
    value: string;
}

export interface ITokenURI {
    name: string;
    description: string;
    attributes: Attribute[];
    image: string;
}

export interface IDetails {
     level: number;
     harvestCounter: number;
     wateringCounter: number;
     lastActionTimestamp: any;
}