import { EntityORM } from "./entity";
import {
    DocumentReference,
    DocumentSnapshot,
    getDoc,
    onSnapshot,
} from "firebase/firestore";
import EventEmitter from "events";
import { until } from "@vueuse/core";

export class EntityMetaData extends EventEmitter {
    reference: DocumentReference | null = null;
    isFullfilled: boolean = false;
    isFullfilling: null | Promise<any> = null;
    origin: any = {};
    properties: { [key: string]: any } = {};
    entity: EntityORM;
    unsuscribeSnapshot: Function | null = null;

    constructor(entity: any) {
        super();
        this.entity = entity;
        this.setMaxListeners(30);
    }

    destroy() {
        this.emit("destroy");
        if (this.unsuscribeSnapshot) this.unsuscribeSnapshot();
    }

    async refresh() {
        if (!this.reference) return;
        if (!this.isFullfilling) {
            this.isFullfilling = getDoc(this.reference)
                .then(async (querySnapshot) => {
                    this.origin = querySnapshot.data();
            
                    this.emit("parse", this.origin);
                    this.isFullfilled = true;
            });
        }
        
        await this.isFullfilling;
        
        
    }

    async waitFullfilled() {
        return this.isFullfilling;
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
