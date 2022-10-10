import moment from "moment-with-locales-es6";
import { doc, GeoPoint } from "firebase/firestore";
import { useFirebase, useDoc } from "./index";
import { onInitialize, EntityORM, isEntityClass } from "./entity";
import { EntityMetaData } from "./entityMetadata";
import { reactive, watch } from "vue";

function parseData(toTransform: any | any[], type: any): any {
    if (!toTransform) return undefined;
    if (Array.isArray(type)) {
        if (!Array.isArray(toTransform)) return [];
        return toTransform.map((data) => {
            return parseData(data, type[0]);
        });
    } else if (type == moment && !moment.isMoment(toTransform)) {
        return moment.unix(toTransform.seconds);
    } else if (type == GeoPoint) {
        return new GeoPoint(toTransform._lat, toTransform._long);
    } else if (isEntityClass(type)) {
        const model = useDoc(type, toTransform);
        const childMetadata = model.$metadata;
        childMetadata.on("get", (name: string) => {
            if (
                !childMetadata.isFullfilled &&
                typeof name == "string" &&
                !name.startsWith("$") &&
                name != "constructor"
            ) {
                childMetadata.refresh();
            }
        });
        /*
        const firebase = useFirebase();


        const documentReference = doc(
            firebase.firestore,
            `${type.collectionName}/${toTransform}`
        );
        const model = new type(documentReference);
        const childMetadata = model.$metadata;
        childMetadata.on("get", (name: string) => {
            if (
                !childMetadata.isFullfilled &&
                typeof name == "string" &&
                !name.startsWith("$") &&
                name != "constructor"
            ) {
                childMetadata.refresh();
            }
        });
        //model.$assign();*/
        return model;
    }
    return toTransform;
}

function formatData(toTransform: any | any[], type: any): any {
    if (typeof toTransform == "undefined") return undefined;
    if (Array.isArray(type)) {
        if (!Array.isArray(toTransform)) return [];
        return toTransform.map((data) => {
            return formatData(data, type[0]);
        });
    } else if (type == moment) {
        return toTransform.toDate();
    } else if (type == GeoPoint) {
        return toTransform;
    } else if (isEntityClass(type)) {
        return toTransform.$getID();
    } else if (typeof type == "function" && /^\s*class\s+/.test(type.toString())) {
        const raw: { [key: string]: any } = {};
        Object.getOwnPropertyNames(toTransform).forEach((key) => {
            raw[key] = formatData(toTransform[key], toTransform[key].constructor);
        });
        return raw;
    }
    return toTransform;
}

function isEqual(a: any, b: any, type: any): boolean {
    
    if (Array.isArray(type)) {
        return a.every((row: any, index: number) => {
            return isEqual(row, b[index], type[0]);
        });
    } else if (type == moment && a && b) {
        return a.isSame(b);
    } else if (isEntityClass(type)) {
        return a && b && a.$getID() == b.$getID() && a.constructor == b.constructor;
    }
    return a == b;
}

export function Var(type: any) {
    return function (target: any, name: string) {
        onInitialize(target, function (this: any, metadata: EntityMetaData) {
            if (!metadata.properties[name]) metadata.properties[name] = reactive({});

            metadata.properties[name].isChanged = false;
            metadata.properties[name].isInitialized = false;

            this[name] = parseData(this[name], type);
            let originalPropertyValue: any = this[name];

            const unwatch = watch(
                () => this[name],
                () => {
                    metadata.properties[name].isChanged = !isEqual(
                        this[name],
                        originalPropertyValue,
                        type
                    );
                }
            );

            metadata.on("parse", (raw: any) => {
                if (metadata.properties[name].isChanged) return;
                const parsed = parseData(raw[name], type);
                if (parsed != this[name]) this[name] = parsed;
                originalPropertyValue = this[name];
                metadata.properties[name].isInitialized = true;
                metadata.properties[name].isChanged = false;
            });

            metadata.on("format", (raw: any) => {
                const rawValue = formatData(this[name], type);
                if (typeof rawValue !== "undefined") raw[name] = rawValue;
            });

            metadata.on("saved", () => {
                metadata.properties[name].isChanged = false;
            });

            metadata.on("destroy", () => {
                unwatch();
            });
        });
    };
}
