import { EntityORM } from "./entity";
import {
    DocumentReference,
    DocumentSnapshot,
    getDoc,
    onSnapshot,
} from "firebase/firestore";
import EventEmitter from "events";

export class EntityMetaData extends EventEmitter {
    reference: DocumentReference | null = null;
    isFullfilled: boolean = false;
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
        this.isFullfilled = true;
        const querySnapshot = await getDoc(this.reference);

        this.origin = querySnapshot.data();

        this.emit("parse", this.origin);
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
                console.log("onSnapshot", document.ref.path);
                this.emit("parse", document.data());
            }
        );
    }
}
