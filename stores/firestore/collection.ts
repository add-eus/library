import type { Collection as UseCollectionType } from ".";
import { useCollection } from ".";
import { Entity } from "./entity";
import { onInitialize } from "./entity";
import type { EntityMetaData } from "./entityMetadata";
import { useFirebase } from "addeus-common-library/stores/firebase";
import {
    collection,
    collectionGroup,
    deleteDoc,
    doc,
    documentId,
    getDocs,
    or,
    query,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { shallowReactive } from "vue";
import { watchArray } from "@vueuse/core";

export interface CollectionOptions {
    namespace?: string;
    shallowCopy?: boolean;
}

export const entitiesInfos = new Map<
    string,
    { model: typeof Entity; subPaths: string[]; subCollectionFields: string[] }
>();

/**
 *  Update an entity on all its collections
 * @param subCollections
 * @param metadata
 */
const updateEntityToSubCollections = async (
    subCollections: string[],
    metadata: EntityMetaData
) => {
    const firebase = useFirebase();
    const subCollectionsPromises = subCollections.map(
        async (subCollectionPath: string) => {
            try {
                const raw = metadata.entity.$getPlain();
                const subCollection = collectionGroup(
                    firebase.firestore,
                    subCollectionPath
                );
                const result = query(
                    subCollection,
                    or(
                        where("originalId", "==", metadata.reference!.id),
                        where(documentId(), "==", metadata.reference!.path)
                    )
                );
                const querySnap = await getDocs(result);
                const saveSubRefPromises = querySnap.docs.map(async (doc) => {
                    await updateDoc(doc.ref, {
                        originalId: metadata.reference!.id,
                        ...raw,
                    });
                });
                await Promise.all(saveSubRefPromises);
            } catch (err) {
                if (err instanceof Error && (err as any).code === "permission-denied") {
                    throw new Error(
                        `You don't have permission to edit ${subCollectionPath}`
                    );
                }

                throw err;
            }
        }
    );
    await Promise.all(subCollectionsPromises);
};

/**
 * Get array modification between app datas and firestore datas
 * @param appArray Current data in app (with new or deleted entities)
 * @param firestoreArray Current data in firestore
 * @returns {toDelete, toAdd} entities to delete and entities to add
 */
const getArrayModification = (
    appArray: UseCollectionType<Entity>,
    firestoreArray: UseCollectionType<Entity> | undefined
) => {
    const dbEntities: any[] = [];
    if (firestoreArray) dbEntities.push(...firestoreArray);
    const appEntities = [...appArray];

    const toDelete = dbEntities.filter(
        (f) => !appEntities.some((a) => a.$getID() === f.$getID())
    );
    const toAdd = appEntities.filter((a) => !dbEntities.includes(a));
    return { toDelete, toAdd };
};

/**
 * Add and/or remove elements from firestore
 * @param toRemove elements to remove
 * @param toAdd elements to add
 * @param path path of the collection
 */
const updateSubCollection = async (
    toRemove: Array<Entity>,
    toAdd: Array<Entity>,
    path: string
) => {
    const firebase = useFirebase();

    const collectionRef = collection(firebase.firestore, path);
    toRemove.map(async (d) => {
        const id = d.$getMetadata().reference!.id;
        const docRef = doc(collectionRef, id);
        await deleteDoc(docRef);
    });
    toAdd.map(async (d) => {
        const id = d.$getMetadata().reference?.id;
        if (id === undefined) return;
        const docRef = doc(collectionRef, id);
        await setDoc(
            docRef,
            {
                originalId: id,
                ...d.$getPlain(),
            },
            { merge: true }
        );
    });
};

const getPropertyInitialzer = (namespace: string, propertyKey: string, target: any) =>
    function (this: any, metadata: EntityMetaData) {
        const info = entitiesInfos.get(namespace);
        if (info === undefined) throw new Error(`${namespace} info is undefined`);

        // save propertyKey in subCollections of model
        if (!info.subPaths.includes(propertyKey)) info.subPaths.push(propertyKey);

        metadata.on("parse", () => {
            if (metadata.reference === null)
                throw new Error("reference in metadata is null");

            // array used in app
            const appArray = shallowReactive(new SubCollection());

            // array update from firestore
            const firestoreArray = useCollection(info.model, {
                path: `${metadata.reference.path}/${propertyKey}`,
            });
            // update app array from firestore array
            watchArray(
                firestoreArray,
                (value, oldValue, added: Entity[], removed: Entity[]) => {
                    added.forEach((a) => {
                        const alreadyInArray = appArray.some(
                            (entity) => entity.$getID() === a.$getID()
                        );
                        if (!alreadyInArray) appArray.push(a);
                    });
                    removed.forEach((r) => {
                        const index = appArray.indexOf(r);
                        if (index !== -1) appArray.splice(index, 1);
                    });
                }
            );

            metadata.firestoreArrays[propertyKey] = firestoreArray;
            this[propertyKey] = appArray;
        });
        metadata.on("saved", () => {
            if (metadata.reference === null)
                throw new Error("reference in metadata is null");

            const collectionName = target.constructor.collectionName;
            const info = entitiesInfos.get(collectionName);
            if (info === undefined)
                throw new Error(`${collectionName} info is undefined`);

            // elements changed in array
            const { toDelete, toAdd } = getArrayModification(
                this[propertyKey],
                metadata.firestoreArrays[propertyKey]
            );

            // change collection and all duplicate collections
            info.subPaths.map(async (path) => {
                const firebase = useFirebase();
                const subCollection = collectionGroup(firebase.firestore, path);
                const result = query(
                    subCollection,
                    or(
                        where("originalId", "==", metadata.reference!.id),
                        where(documentId(), "==", metadata.reference!.path)
                    )
                );
                const querySnap = await getDocs(result);
                querySnap.docs.map(async (doc) => {
                    await updateSubCollection(
                        toDelete,
                        toAdd,
                        `${doc.ref.path}/${propertyKey}`
                    );
                });
            });
        });
    };

const getClassInitialzer = (target: any) =>
    function (this: any, metadata: EntityMetaData) {
        metadata.on("saved", () => {
            const info = entitiesInfos.get(target.collectionName);
            if (info === undefined)
                throw new Error(`${target.collectionName} info is undefined`);
        });
    };

export function Collection(options: CollectionOptions = {}) {
    return function (target: any, propertyKey?: string) {
        // On class
        if (propertyKey === undefined) {
            target.collectionName = options.namespace ?? target.name;

            // Associate namespace to model
            entitiesInfos.set(target.collectionName, {
                model: target,
                subPaths: [target.collectionName],
                subCollectionFields: [],
            });

            // copy entity to sub collections on save
            target.onInitialize.push(getClassInitialzer(target));
        }
        // On property
        else {
            if (options.shallowCopy === true) {
                if (options.namespace === undefined) {
                    throw new Error("namespace is undefined");
                }
                onInitialize(
                    target,
                    getPropertyInitialzer(options.namespace, propertyKey, target)
                );
            }
        }
    };
}

export class SubCollection extends Array<Entity> {}

export class EntitySubCollection extends Entity {
    async $save(): Promise<void> {
        const constructor = this.constructor as typeof Entity;
        const info = entitiesInfos.get(constructor.collectionName);
        if (info === undefined)
            throw new Error(`${constructor.collectionName} info is undefined`);
        await super.$save();
        await updateEntityToSubCollections(info.subPaths, this.$getMetadata());
    }
}
