import type { MaybeRef } from "@vueuse/core";
import { doc, getDoc } from "firebase/firestore";
import type { Ref } from "vue";
import type {
    CollectionOptions as UseCollectionOption,
    Collection as UseCollectionType,
    WhereOption,
} from ".";
import { newDoc, useCollection, useCount, useDoc } from ".";
import { useFirestore } from "../firebase";
import type { Entity, EntityBase } from "./entity";
import { onInitialize } from "./entity";
import type { EntityMetaData } from "./entityMetadata";
import { securityCollectionCallbacks } from "./security/securityDecorators";

export type FunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

export type NonFunctionProperties<T> = {
    [K in Exclude<keyof T, FunctionPropertyNames<T>>]: T[K];
};

export interface CollectionOptions<T> {
    namespace: string;
    backlistFields?: Partial<
        Omit<Record<keyof NonFunctionProperties<T>, boolean>, "blacklistedProperties">
    >;
}

export interface EntityInfo {
    model: typeof Entity;
    subPaths: { path: string; blacklistedProperties: string[] }[];
}

/**
 * Map model to namespace of all entities
 */
export const entitiesInfos = new Map<string, EntityInfo>();

const onCollectionsInitialize = new Map<string, (() => void)[]>();

export const entitiesDeclared: { [key: string]: EntityBase } = {};
export function Collection<T>(options: CollectionOptions<T>) {
    return function (target: any, propertyKey?: string) {
        const name = target.name !== undefined ? target.name : target.constructor.name;
        if (entitiesDeclared[name] === undefined)
            entitiesDeclared[name] = target.constructor;
        // On class
        if (propertyKey === undefined) {
            target.collectionName = options.namespace;

            // Associate namespace to model
            entitiesInfos.set(target.collectionName, {
                model: target,
                subPaths: [{ path: target.collectionName, blacklistedProperties: [] }],
            });
            onCollectionsInitialize.get(target.collectionName)?.forEach((init) => init());
            securityCollectionCallbacks.get(target.name)?.forEach((init) => init());
        }
        // On property
        else {
            if (options.namespace === undefined) {
                throw new Error("namespace is undefined");
            }
            const namespace = options.namespace;
            const onCollectionInitialize = () => {
                const info = entitiesInfos.get(namespace);
                if (info === undefined) {
                    throw new Error(`${namespace} info is undefined`);
                }

                const blacklistedProperties = Object.entries(options.backlistFields ?? {})
                    .filter(([, value]) => value)
                    .map(([key]) => key);

                // save propertyKey in subCollections of model
                const subPathInfo = info.subPaths.find(
                    ({ path }) => path === propertyKey,
                );
                if (subPathInfo !== undefined) {
                    subPathInfo.blacklistedProperties.forEach((blacklistedProperty) => {
                        if (!blacklistedProperties.includes(blacklistedProperty)) {
                            throw new Error(
                                `property ${propertyKey} already exists, a subcollection name must have the same blacklistedProperties`,
                            );
                        }
                    });
                } else {
                    info.subPaths.push({
                        path: propertyKey,
                        blacklistedProperties,
                    });
                }

                onInitialize(target, function (this: any, metadata: EntityMetaData) {
                    // tag property as collection property, used in Entity to save and parse this property
                    metadata.collectionProperties[propertyKey] = {
                        namespace,
                        blacklistedProperties,
                    };
                });
            };

            // wait Collection decorator on model
            const info = entitiesInfos.get(namespace);
            if (info === undefined) {
                const inits = onCollectionsInitialize.get(namespace);
                if (inits === undefined) {
                    onCollectionsInitialize.set(namespace, [onCollectionInitialize]);
                } else {
                    inits.push(onCollectionInitialize);
                }
            } else {
                onCollectionInitialize();
            }
        }
    };
}

export class SubCollection<T extends Entity> {
    private model?: typeof Entity;
    private path?: string;
    private initialized = false;
    private new = false;
    public blacklistedProperties: string[] = [];

    init(
        model: typeof Entity,
        path: string | undefined,
        blacklistedProperties: string[],
    ) {
        this.model = model;
        this.path = path;
        this.blacklistedProperties = blacklistedProperties;
        this.initialized = true;
        this.new = path === undefined;
    }

    async exists(entity: Entity): Promise<boolean> {
        const id = entity.$getID();
        if (id === undefined) throw new Error("id is undefined");
        return await this.existsById(id);
    }

    async existsById(id: string): Promise<boolean> {
        if (!this.initialized) throw new Error(`property subcollection not initialized`);
        if (this.new) throw new Error(`property subcollection is new`);
        const firestore = useFirestore();
        const snap = await getDoc(doc(firestore, `${this.path}/${id}`));
        return snap.exists();
    }

    get entityModel() {
        return this.model;
    }

    get isInitialized() {
        return this.initialized;
    }

    get isNew() {
        return this.new;
    }

    newDoc(toClone?: T): T {
        if (!this.isInitialized)
            throw new Error(`property subcollection not initialized`);
        if (this.model === undefined) throw new Error(`model is undefined`);
        if (toClone === undefined) {
            const entity = newDoc(this.model) as T;
            entity.$getMetadata().saveNewDocPath = this.path;
            return entity;
        } else {
            if (this.path === undefined) throw new Error(`path is undefined`);
            const entity = toClone.$clone() as T;
            entity.$getMetadata().saveNewDocPath = this.path;
            entity.$getMetadata().saveNewDocId = toClone.$getID();
            return entity;
        }
    }

    useDoc(id: string): T {
        if (!this.isInitialized)
            throw new Error(`property subcollection not initialized`);
        if (this.model === undefined) throw new Error(`model is undefined`);
        const entity = useDoc(this.model, id, {
            fetch: true,
            collection: this.path,
        }) as T;
        return entity;
    }

    useCollection(options?: UseCollectionOption): UseCollectionType<T> {
        if (!this.isInitialized)
            throw new Error(`property subcollection not initialized`);
        if (this.model === undefined) throw new Error(`model is undefined`);

        const useCollectionOptions: UseCollectionOption = {
            ...options,
            path: this.path,
            blacklistedProperties: this.blacklistedProperties,
        };

        return useCollection(this.model, useCollectionOptions) as UseCollectionType<T>;
    }

    useCount(whereOptions?: MaybeRef<WhereOption[]>): Ref<number> {
        if (!this.isInitialized)
            throw new Error(`property subcollection not initialized`);
        if (this.path === undefined) throw new Error(`path is undefined`);
        return useCount(this.path, whereOptions);
    }
}
