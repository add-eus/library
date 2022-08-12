export const Collection = "scenarios";

export enum ScenarioTrigger {
    "menuOpen"
}

export interface ScenarioConditionDayWeek {
    enable?: Boolean;
}

export interface ScenarioConditionIsConnected {
    enable?: Boolean;
}

export interface ScenarioConditionNumberOfVisit {
    enable?: Boolean;
}

export interface ScenarioConditionTimeSlots {
    enable?: Boolean;
    slots: ScenarioConditionTimeSlotsSlot[];
}

export interface ScenarioConditionTimeSlotsSlot {
    range: {start: string, end: string};
}

export interface ScenarioCondition {
    dayWeek?: ScenarioConditionDayWeek;
    isConnected?: ScenarioConditionIsConnected;
    numberOfVisit?: ScenarioConditionNumberOfVisit;
    timeSlots?: ScenarioConditionTimeSlots;
}

export enum ScenarioFlowType {
    "notification",
    "message",
    "phone",
    "boolean"
}

export interface ScenarioFlow {
    fail?: String;
    message?: String;
    success?: String;
    type?: ScenarioFlowType;
}

export interface Scenario {
    condition: ScenarioCondition;
    delay?: number;
    flows: ScenarioFlow[];
    place: string;
    startAt: Date;
    endAt: Date;
    trigger: string;
}
