export const Collection = "socialProfiles";

export enum SocialProfileType {
    "facebook",
    "instagram",
    "twitter",
}

export interface SocialProfile {
    name: string;
    type: SocialProfileType;
    place: string;
    tokens: any;
    uid: string;
}
