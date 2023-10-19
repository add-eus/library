import type {
    CollectionOptions as UseCollectionOption,
    Collection as UseCollectionType,
} from ".";
import { useCollection } from ".";
import type { Entity } from "./entity";
import { onInitialize } from "./entity";
import type { EntityMetaData } from "./entityMetadata";
import { useFirebase } from "addeus-common-library/stores/firebase";
import { collection, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { shallowReactive } from "vue";
import { watchArray } from "@vueuse/core";

type FunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

type NonFunctionProperties<T> = {
    [K in Exclude<keyof T, FunctionPropertyNames<T>>]: T[K];
};

export interface CollectionOptions<T> {
    namespace?: string;
    backlistFields?: Partial<Record<keyof NonFunctionProperties<T>, boolean>>;
}

/**
 * Map model to namespace of all entities
 */
export const entitiesInfos = new Map<
    string,
    { model: typeof Entity; subPaths: string[] }
>();

export function Collection<T>(options: CollectionOptions<T> = {}) {
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
            if (options.namespace === undefined) {
                throw new Error("namespace is undefined");
            }
            const namespace = options.namespace;
            onInitialize(target, function (this: any, metadata: EntityMetaData) {
                const info = entitiesInfos.get(namespace);
                if (info === undefined) throw new Error(`${namespace} info is undefined`);

                // save propertyKey in subCollections of model
                if (!info.subPaths.includes(propertyKey)) info.subPaths.push(propertyKey);

                const blacklistedProperties = Object.entries(options.backlistFields ?? {})
                    .filter(([, value]) => value)
                    .map(([key]) => key);

                // set property as collection property, used in Entity to save and parse this property
                metadata.collectionProperties[propertyKey] = {
                    namespace,
                    blacklistedProperties,
                };
            });
        }
    };
}

export class SubCollection<T extends Entity> {
    private firestoreArray?: UseCollectionType<T>;
    private currentList = shallowReactive(new Array<T>());
    private model?: typeof Entity;
    public path?: string;
    private initialized = false;
    private stopWatch?: () => void;
    private isFetched = false;
    private isNew = false;
    private blacklistedProperties: string[] = [];

    init(
        model: typeof Entity,
        path: string | undefined,
        blacklistedProperties: string[]
    ) {
        this.model = model;
        this.path = path;
        this.blacklistedProperties = blacklistedProperties;
        this.initialized = true;
        this.isNew = path === undefined;
    }

    setOptions(options?: Omit<UseCollectionOption, "path" | "blacklistedProperties">) {
        if (!this.initialized) throw new Error(`property subcollection not initialized`);
        if (this.model === undefined)
            throw new Error(`model in property ${this.path} is undefined`);
        if (this.path === undefined)
            throw new Error(`path in property ${this.path} is undefined`);

        this.stopWatch?.();

        const useCollectionOptions: UseCollectionOption = {
            ...options,
            path: this.path,
            blacklistedProperties: this.blacklistedProperties,
        };
        this.firestoreArray = useCollection(this.model, useCollectionOptions) as any;

        this.currentList.splice(0, this.currentList.length);

        this.stopWatch = watchArray(
            this.firestoreArray!,
            (value, oldValue, added: T[], removed: T[]) => {
                added.forEach((a) => {
                    const alreadyInArray = this.currentList.some(
                        (entity) => entity.$getID() === a.$getID()
                    );
                    if (!alreadyInArray) this.currentList.push(a);
                });
                removed.forEach((r) => {
                    const index = this.currentList.findIndex(
                        (entity) => entity.$getID() === r.$getID()
                    );
                    if (index !== -1) this.currentList.splice(index, 1);
                });
            }
        );
        this.isFetched = true;
    }

    async exists(entity: Entity): Promise<boolean> {
        const id = entity.$getID();
        if (id === undefined) throw new Error("id is undefined");
        return await this.existsById(id);
    }

    async existsById(id: string): Promise<boolean> {
        if (!this.initialized) throw new Error(`property subcollection not initialized`);
        const firebase = useFirebase();
        const snap = await getDoc(doc(firebase.firestore, `${this.path}/${id}`));
        return snap.exists();
    }

    get list() {
        if (!this.isFetched && !this.isNew) this.setOptions();
        return this.currentList;
    }

    get entityModel() {
        return this.model;
    }

    /**
     * Get array modification between app datas and firestore datas
     * @param appArray Current data in app (with new or deleted entities)
     * @param firestoreArray Current data in firestore
     * @returns {toDelete, toAdd} entities to delete and entities to add
     */
    getArrayModification() {
        const dbEntities: Entity[] = [];
        if (this.firestoreArray) dbEntities.push(...this.firestoreArray);
        const appEntities = [...this.currentList];

        const toDelete = dbEntities.filter(
            (f) => !appEntities.some((a) => a.$getID() === f.$getID())
        );
        const toAdd = appEntities.filter(
            (a) => !dbEntities.some((f) => a.$getID() === f.$getID())
        );
        return { toDelete, toAdd };
    }
}

/**
 * Add and/or remove elements from firestore
 * @param toRemove elements to remove
 * @param toAdd elements to add
 * @param path path of the collection
 */
export const updatePropertyCollection = async (
    toRemove: Array<Entity>,
    toAdd: Array<Entity>,
    path: string
) => {
    const firebase = useFirebase();

    const collectionRef = collection(firebase.firestore, path);
    const removePromises = toRemove.map(async (entity) => {
        const id = entity.$getMetadata().reference!.id;
        const docRef = doc(collectionRef, id);
        await deleteDoc(docRef);
    });
    const addPromises = toAdd.map(async (entity) => {
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
        const constructor = entity.constructor as typeof Entity;
        const model = new constructor();
        model.$getMetadata().setReference(docRef);
        model.blacklistedProperties = entity.blacklistedProperties;
        await model.savePropertyCollections(entity);
    });
    await Promise.all([...removePromises, ...addPromises]);
};
