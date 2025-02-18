import type { DocumentReference, DocumentSnapshot } from "firebase/firestore";
import { getDoc, onSnapshot } from "firebase/firestore";
import { SubCollection, entitiesInfos } from "./collection";
import type { Entity } from "./entity";
import EventEmitter from "./event";

export interface CollectionProperties {
    [key: string]: { namespace: string; blacklistedProperties: string[] };
}

export class EntityMetaData extends EventEmitter {
    reference: DocumentReference | null = null;
    isFullfilled: boolean = false;
    isFullfilling: null | Promise<any> = null;
    isDeleted: boolean = false;
    origin: any = {};
    previousOrigin: any = {};
    properties: { [key: string]: any } = {};
    entity: Entity;
    unsuscribeSnapshot: (() => void) | null = null;
    disableWatch: boolean = false;

    blacklistedProperties: string[] = [];
    collectionProperties: CollectionProperties = {};
    saveNewDocPath?: string;
    saveNewDocId?: string;

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
            this.isFullfilling = getDoc(this.reference);

            const querySnapshot = await this.isFullfilling;

            this.entity.$setAndParseFromReference(querySnapshot);
        }

        try {
            await this.isFullfilling;
        } catch (e) {
            throw new Error(`Error from getting ${this.reference.path}: ${e.message}`);
        }
    }

    async waitFullfilled() {
        return this.isFullfilling;
    }

    markAsDeleted() {
        this.isDeleted = true;
        this.emit("deleted");
    }

    watch() {
        if (this.unsuscribeSnapshot) return;
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
                        `You don't have permission to access ${this.reference?.path}`,
                    );
                }
                throw err;
            },
        );
    }

    stopWatch() {
        this.unsuscribeSnapshot?.();
        this.unsuscribeSnapshot = null;
    }

    setReference(reference: DocumentReference) {
        if (this.reference) return;
        this.reference = reference;

        this.watch();
        this.on("destroy", () => {
            this.unsuscribeSnapshot?.();
        });
    }

    initSubCollections(isNew: boolean = false) {
        // init subcollections
        Object.entries(this.collectionProperties)
            .filter(([propertyKey]) => !this.blacklistedProperties.includes(propertyKey))
            .map(([propertyKey, { namespace, blacklistedProperties }]) => {
                if (!isNew && this.reference === null)
                    throw new Error("reference in metadata is null, new doc ?");

                const info = entitiesInfos.get(namespace);
                if (info === undefined) throw new Error(`${namespace} info is undefined`);

                const subCollection = (this.entity as any)[propertyKey];
                if (!(subCollection instanceof SubCollection))
                    throw new Error(`${propertyKey} is not a SubCollection`);
                subCollection.init(
                    info.model,
                    isNew ? undefined : `${this.reference!.path}/${propertyKey}`,
                    blacklistedProperties,
                );
            });
    }
}
