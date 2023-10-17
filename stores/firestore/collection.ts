import type { Collection as UseCollectionType } from ".";
import { useCollection } from ".";
import { Entity } from "./entity";
import { onInitialize } from "./entity";
import type { EntityMetaData } from "./entityMetadata";
import { useFirebase } from "addeus-common-library/stores/firebase";
import type { DocumentReference, DocumentSnapshot } from "firebase/firestore";
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

/**
 * Map model to namespace of all entities
 */
export const entitiesInfos = new Map<
    string,
    { model: typeof Entity; subPaths: string[] }
>();

export function Collection(options: CollectionOptions = {}) {
    return function (target: any, propertyKey?: string) {
        // On class
        if (propertyKey === undefined) {
            target.collectionName = options.namespace ?? target.name;

            // Associate namespace to model
            entitiesInfos.set(target.collectionName, {
                model: target,
                subPaths: [target.collectionName],
            });
        }
        // On property
        else {
            if (options.shallowCopy === true) {
                if (options.namespace === undefined) {
                    throw new Error("namespace is undefined");
                }
                const namespace = options.namespace;
                onInitialize(target, function (this: any, metadata: EntityMetaData) {
                    if (metadata.entity instanceof EntitySubCollection) {
                        const info = entitiesInfos.get(options.namespace!);
                        if (info === undefined)
                            throw new Error(`${options.namespace} info is undefined`);

                        // save propertyKey in subCollections of model
                        if (!info.subPaths.includes(propertyKey))
                            info.subPaths.push(propertyKey);

                        // set property as collection property used in EntitySubCollection to save and parse this property
                        metadata.collectionProperties[propertyKey] = namespace;
                    } else {
                        throw new Error(
                            `SubCollection decorator can only be used on EntitySubCollection`
                        );
                    }
                });
            }
        }
    };
}

export class SubCollection extends Array<Entity> {}

export class EntitySubCollection extends Entity {
    async $save(): Promise<void> {
        await super.$save();
        await this.savePropertyCollections();
        await this.updateEntityToSubCollections();
    }

    $setAndParseFromReference(querySnapshot: DocumentReference | DocumentSnapshot) {
        super.$setAndParseFromReference(querySnapshot);

        const metadata = this.$getMetadata();
        Object.entries(metadata.collectionProperties).map(([propertyKey, namespace]) => {
            if (metadata.reference === null)
                throw new Error("reference in metadata is null");

            const info = entitiesInfos.get(namespace); // constructor.collectionName WRONG
            if (info === undefined) throw new Error(`${namespace} info is undefined`);

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
                        const index = appArray.findIndex(
                            (entity) => entity.$getID() === r.$getID()
                        );
                        if (index !== -1) appArray.splice(index, 1);
                    });
                }
            );

            metadata.firestoreArrays[propertyKey] = firestoreArray;
            (this as any)[propertyKey] = appArray;
        });
    }

    async savePropertyCollections(copyFrom?: EntitySubCollection) {
        const savePropertyCollectionPromises = Object.keys(
            this.$getMetadata().collectionProperties
        ).map(async (propertyKey) => {
            await this.savePropertyCollection(propertyKey, copyFrom);
        });
        await Promise.all(savePropertyCollectionPromises);
    }

    async savePropertyCollection(propertyKey: string, copyFrom?: EntitySubCollection) {
        const metadata = this.$getMetadata();
        if (metadata.reference === null) throw new Error("reference in metadata is null");

        const constructor = this.constructor as typeof Entity;
        const info = entitiesInfos.get(constructor.collectionName);
        if (info === undefined)
            throw new Error(`${constructor.collectionName} info is undefined`);

        // elements changed in array, if copyFrom is defined, it's a new entity, all elements are added from copyFrom
        const { toDelete, toAdd } =
            copyFrom !== undefined
                ? {
                      toDelete: [],
                      toAdd: [
                          ...((copyFrom as any)[propertyKey] as EntitySubCollection[]),
                      ],
                  }
                : getArrayModification(
                      (this as any)[propertyKey],
                      metadata.firestoreArrays[propertyKey]
                  );

        // add or remove elememts in the property collection and all duplicate collections
        const subPathPromises = info.subPaths.map(async (path) => {
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
            const docsPromises = querySnap.docs.map(async (doc) => {
                await updatePropertyCollection(
                    toDelete,
                    toAdd,
                    `${doc.ref.path}/${propertyKey}`
                );
            });
            await Promise.all(docsPromises);
        });
        await Promise.all(subPathPromises);
    }

    /**
     *  Update entity on all its collections
     * @param subCollections
     * @param metadata
     */
    async updateEntityToSubCollections() {
        const constructor = this.constructor as typeof Entity;
        const info = entitiesInfos.get(constructor.collectionName);
        if (info === undefined)
            throw new Error(`${constructor.collectionName} info is undefined`);

        const reference = this.$getMetadata().reference;
        if (reference === null) throw new Error("reference in metadata is null");

        const firebase = useFirebase();
        const subCollectionsPromises = info.subPaths.map(
            async (subCollectionPath: string) => {
                try {
                    const raw = this.$getPlain();
                    const subCollection = collectionGroup(
                        firebase.firestore,
                        subCollectionPath
                    );
                    const result = query(
                        subCollection,
                        or(
                            where("originalId", "==", reference.id),
                            where(documentId(), "==", reference.path)
                        )
                    );
                    const querySnap = await getDocs(result);
                    const saveSubRefPromises = querySnap.docs.map(async (doc) => {
                        await updateDoc(doc.ref, {
                            originalId: reference.id,
                            ...raw,
                        });
                    });
                    await Promise.all(saveSubRefPromises);
                } catch (err) {
                    if (
                        err instanceof Error &&
                        (err as any).code === "permission-denied"
                    ) {
                        throw new Error(
                            `You don't have permission to edit ${subCollectionPath}`
                        );
                    }

                    throw err;
                }
            }
        );
        await Promise.all(subCollectionsPromises);
    }
}

/**
 * Get array modification between app datas and firestore datas
 * @param appArray Current data in app (with new or deleted entities)
 * @param firestoreArray Current data in firestore
 * @returns {toDelete, toAdd} entities to delete and entities to add
 */
const getArrayModification = (
    appArray: UseCollectionType<EntitySubCollection>,
    firestoreArray: UseCollectionType<EntitySubCollection> | undefined
) => {
    const dbEntities: EntitySubCollection[] = [];
    if (firestoreArray) dbEntities.push(...firestoreArray);
    const appEntities = [...appArray];

    const toDelete = dbEntities.filter(
        (f) => !appEntities.some((a) => a.$getID() === f.$getID())
    );
    const toAdd = appEntities.filter(
        (a) => !dbEntities.some((f) => a.$getID() === f.$getID())
    );
    return { toDelete, toAdd };
};

/**
 * Add and/or remove elements from firestore
 * @param toRemove elements to remove
 * @param toAdd elements to add
 * @param path path of the collection
 */
const updatePropertyCollection = async (
    toRemove: Array<EntitySubCollection>,
    toAdd: Array<EntitySubCollection>,
    path: string
) => {
    const firebase = useFirebase();

    const collectionRef = collection(firebase.firestore, path);
    toRemove.map(async (entity) => {
        const id = entity.$getMetadata().reference!.id;
        const docRef = doc(collectionRef, id);
        await deleteDoc(docRef);
    });
    toAdd.map(async (entity) => {
        let id = entity.$getMetadata().reference?.id;
        if (id === undefined) {
            // entity is new, save it before add to collection
            await entity.$save();
            id = entity.$getMetadata().reference?.id;
        }
        // entity is already in collection
        if (entity.$getMetadata().reference?.path === `${collectionRef.path}/${id}`)
            return;

        const docRef = doc(collectionRef, id);
        await setDoc(
            docRef,
            {
                originalId: id,
                ...entity.$getPlain(),
            },
            { merge: true }
        );

        // save sub collections of added entity recursively
        const constructor = entity.constructor as typeof EntitySubCollection;
        const model = new constructor();
        model.$getMetadata().setReference(docRef);
        await model.savePropertyCollections(entity);
    });
};
