import type { Entity } from "./entity";
import type { DocumentReference, DocumentSnapshot } from "firebase/firestore";
import { getDoc, onSnapshot } from "firebase/firestore";
import EventEmitter from "./event";
export class EntityMetaData extends EventEmitter {
    reference: DocumentReference | null = null;
    isFullfilled: boolean = false;
    isFullfilling: null | Promise<any> = null;
    isDeleted: boolean = false;
    origin: any = {};
    previousOrigin: any = {};
    properties: { [key: string]: any } = {};
    entity: Entity;
    unsuscribeSnapshot: Function | null = null;

    constructor(entity: any) {
        super();
        this.entity = entity;
    }

    destroy() {
        this.emit("destroy");
        if (this.unsuscribeSnapshot) this.unsuscribeSnapshot();
    }

    async refresh() {
        if (!this.reference) return;
        if (!this.isFullfilling) {
            this.isFullfilling = getDoc(this.reference).then(async (querySnapshot) => {
                // this.previousOrigin = this.origin;
                this.entity.$setAndParseFromReference(querySnapshot);
                // this.origin = querySnapshot.data();
                // if (this.origin === undefined)
                //     throw new Error(`${this.reference.path} does not exist`);

                // this.emit("parse", this.origin);
                // this.isFullfilled = true;
            });
        }

        await this.isFullfilling;
    }

    async waitFullfilled() {
        return this.isFullfilling;
    }

    markAsDeleted() {
        this.isDeleted = true;
        this.emit("deleted");
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

                // if (document.metadata.hasPendingWrites) return;

                if (!document.exists()) {
                    this.markAsDeleted();
                    return;
                }
                const data = document.data();

                if (data === undefined) return;
                this.emit("parse", data);
            },
            (err) => {
                if (err instanceof Error && err.code === "permission-denied") {
                    throw new Error(
                        `You don't have permission to access ${this.reference?.path}`
                    );
                }
            }
        );
        this.on("destroy", () => {
            this.unsuscribeSnapshot?.();
        });
    }
}
