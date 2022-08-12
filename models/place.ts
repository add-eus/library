import type { GeoPoint } from "firebase/firestore";

export const Collection = "places";

export enum Types {
    "asian",
    "french",
    "italian",
    "japan",
    "indian",
    "oriental",
    "thai",
    "labanese",
    "chinese",
    "korean",
    "creperie",
    "african",
    "latin",
    "vietnam",
    "american",
    "morroccan",
    "merger",
    "international",
    "mediterranean",
    "seafood",
    "peruvian",
    "brazilian",
    "spanish",
    "hawaien",
    "turkish",
    "algerian",
    "argentine",
    "iranian",
    "savoyard",
    "corsica",
    "creole",
    "island",
    "vegetarian",
    "mexican",
    "ethiopian",
    "syrian",
    "canadian",
    "afghan",
    "south-west-france",
    "grec",
    "vegan",
    "steakhouse",
    "tunisian",
    "cubain",
    "columbian",
    "russian",
    "eastern-europe",
    "cambodian",
    "israelian",
    "swiss",
    "alsacian",
    "portuguese",
    "britain",
    "german",
    "basque",
}

export interface Place {
    name: string;
    enableOnFinder: boolean;
    coords: GeoPoint;
    geohash: string;
    location: string;
    picture: string;
    owners: string[];
    externalScore: ExternalScores;
    score: number;
    scoreMessage: string;
    priceScore: number;
    type: Types;
    hours: Hours;
}

export interface ExternalScores {
    google: ExternalScore;
    tripadvisor: ExternalScore;
}

export interface ExternalScore {
    link: string;
    score: number;
    numberOfReviews: number;
}

export interface Hours {
    0: Hour;
    1: Hour;
    2: Hour;
    3: Hour;
    4: Hour;
    5: Hour;
    6: Hour;
}

export interface Hour extends Array<SingleHour> {}

export interface SingleHour extends Array<Number> {}
