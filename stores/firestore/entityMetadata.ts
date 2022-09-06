import { EntityORM } from "./entity";
import {
    DocumentReference,
    DocumentSnapshot,
    getDoc,
    onSnapshot,
} from "firebase/firestore";

export class EntityMetaData {
    reference: DocumentReference | null = null;
    isFullfilled: boolean = false;
    origin: any = {};
    properties: { [key: string]: any } = {};
    events: { [key: string]: Function[] } = {};
    entity: EntityORM;
    unsuscribeSnapshot: Function | null = null;

    constructor(entity: any) {
        this.entity = entity;
    }

    on(eventName: string, callback: Function) {
        if (!this.events[eventName]) this.events[eventName] = [];
        this.events[eventName].push(callback);
    }

    destroy() {
        this.emit("destroy");
        if (this.unsuscribeSnapshot) this.unsuscribeSnapshot();
    }

    emit(eventName: string, ...args: any[]) {
        if (!this.events[eventName]) return;
        this.events[eventName].map((callback: Function) => {
            callback.call(this.entity, ...args);
        });
    }

    async refresh() {
        if (!this.reference) return;
        const querySnapshot = await getDoc(this.reference);

        this.origin = querySnapshot.data();

        this.emit("parse", this.origin);

        this.isFullfilled = true;
    }

    setReference(reference: DocumentReference) {
        this.reference = reference;
        if (this.unsuscribeSnapshot) this.unsuscribeSnapshot();
        let isFirstFetch = true;
        this.unsuscribeSnapshot = onSnapshot(
            this.reference,
            (document: DocumentSnapshot) => {
                if (isFirstFetch) {
                    isFirstFetch = false;
                    return;
                }
                this.emit("parse", document.data());
            }
        );
    }
}
