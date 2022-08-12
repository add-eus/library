import type { SocialProfileType } from "./socialProfile";

export const Collection = "socialTemplates";

export enum SocialTemplateType {
    "dish",
    "survey",
    "influence",
    "quote",
    "engaging-question",
    "reservation-objective",
    "ask-me-anything",
    "magic-question",
    "viral",
    "backstage",
    "opinion",
    "acknowledgement",
    "mention",
    "motivation",
    "event",
    "recommendation",
    "kindness",
    "learning",
}

export interface SocialTemplate {
    pictures: string[];
    caption: string;
    network: SocialProfileType;
    type: SocialTemplateType;
}
