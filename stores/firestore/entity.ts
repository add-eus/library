import {
    DocumentReference,
    DocumentSnapshot,
    deleteDoc,
    collection,
    doc,
    setDoc,
    updateDoc,
    collectionGroup,
    query,
    where,
    or,
    documentId,
    getDocs,
} from "firebase/firestore";
import { lowerCaseFirst } from "../../utils/string";
import { isReactive, markRaw, shallowReactive } from "vue";
import { useFirebase } from "../firebase";
import { EntityMetaData } from "./entityMetadata";
import { SubCollection, entitiesInfos, updatePropertyCollection } from "./collection";

export function onInitialize(target: any, callback: Function) {
    const constructor = target.constructor;
    if (constructor.onInitialize === undefined) constructor.onInitialize = [];
    constructor.onInitialize.push(callback);
}

export function isEntityClass(entityClass: any): boolean {
    return entityClass.prototype instanceof EntityBase;
}

export function isEntityStandaloneClass(entityClass: any) {
    return entityClass.prototype instanceof Entity;
}

export function isEntity(entity: any, isSaveable: boolean = false) {
    if (typeof entity === "object" && entity !== null)
        return !isSaveable
            ? isEntityClass(entity.constructor)
            : isEntityStandaloneClass(entity.constructor);
    return false;
}

export class EntityBase {
    constructor() {
        const constructor = this.constructor as typeof EntityBase;

        const proxied = new Proxy(this, {
            get(obj, key: string) {
                obj.$getMetadata().emit("get", key);
                return (obj as any)[key];
            },
            set(obj: { [key: string]: any }, key: string, value: any) {
                if (Array.isArray(value)) {
                    if (isReactive(value.constructor) === false)
                        value = EntityArray(value);
                }
                obj[key] = value;

                obj.$getMetadata().emit("set", key, value);
                return true;
            },
        });

        const $metadata = markRaw(new EntityMetaData(proxied));

        Object.defineProperty(this, "$metadata", {
            value: $metadata,
            configurable: false,
            enumerable: false,
            writable: false,
        });

        const reactivity = shallowReactive(proxied);

        if (Array.isArray((constructor as any).onInitialize)) {
            (constructor as any).onInitialize.map((callback: Function) => {
                return callback.call(reactivity, this.$getMetadata());
            });
        }

        return reactivity;
    }

    static addMethod(name: string, callback: Function) {
        (this.prototype as any)["$" + name] = callback;
    }

    $getMetadata(): EntityMetaData {
        return (this as any).$metadata;
    }

    $hasChanged() {
        const $metadata = this.$getMetadata();
        return Object.values($metadata.properties).some(
            (property: any) => property.isChanged
        );
    }

    $reset() {
        if (!this.$getMetadata().reference) throw new Error("No original data to reset");
        this.$getMetadata().emit("parse", this.$getMetadata().origin, true);
        this.$getMetadata().isFullfilled = true;
    }

    $getChangedPlain() {
        const raw = {};
        this.$getMetadata().emit("format", raw, false);
        return raw;
    }

    $getPlain() {
        const raw = {};
        this.$getMetadata().emit("format", raw, true);
        return raw;
    }

    $getModelName() {
        return lowerCaseFirst(this.constructor.name);
    }
}

export class Entity extends EntityBase {
    static collectionName: string;

    initSubCollections(isNew: boolean = false) {
        // init subcollections
        const metadata = this.$getMetadata();
        Object.entries(metadata.collectionProperties).map(([propertyKey, namespace]) => {
            if (!isNew && metadata.reference === null)
                throw new Error("reference in metadata is null, new doc ?");

            const info = entitiesInfos.get(namespace);
            if (info === undefined) throw new Error(`${namespace} info is undefined`);

            const subCollection = (this as any)[propertyKey];
            if (!(subCollection instanceof SubCollection))
                throw new Error(`${propertyKey} is not a SubCollection`);
            subCollection.init(
                info.model,
                isNew ? undefined : `${metadata.reference!.path}/${propertyKey}`
            );
        });
    }

    $setAndParseFromReference(querySnapshot: DocumentReference | DocumentSnapshot) {
        const metadata = this.$getMetadata();
        if (querySnapshot instanceof DocumentReference) {
            metadata.setReference(querySnapshot);
        } else if (querySnapshot instanceof DocumentSnapshot) {
            metadata.setReference(querySnapshot.ref);
            if (!querySnapshot.exists()) return metadata.markAsDeleted();
            const data = querySnapshot.data();
            metadata.previousOrigin = metadata.origin =
                typeof data === "object" && data !== null ? data : {};

            metadata.emit("parse", metadata.origin);

            metadata.isFullfilled = true;
        }
        this.initSubCollections();
    }

    static addMethod(name: string, callback: Function) {
        (this.prototype as any)["$" + name] = callback;
    }

    $getID() {
        if (this.$getMetadata().reference === null) return;
        return this.$getMetadata().reference?.id;
    }

    $isNew() {
        return this.$getID() === "" || this.$getID() === undefined;
    }

    $isSame(other: any) {
        if (!isEntity(other)) return false;
        if (this.$getMetadata() === undefined || this.$getMetadata().reference === null)
            return false;
        if (other.$getMetadata() === undefined || other.$getMetadata().reference === null)
            return false;
        return (
            this.$getMetadata().reference?.path === other.$getMetadata().reference?.path
        );
    }

    async $save() {
        const constructor = this.constructor as typeof Entity;

        const raw = this.$getChangedPlain();
        const $metadata = this.$getMetadata();
        const isNew = $metadata.reference === null;
        try {
            if (isNew) {
                const firebase = useFirebase();
                const docRef = doc(
                    collection(firebase.firestore, constructor.collectionName)
                );

                await setDoc(docRef, raw);
                $metadata.setReference(docRef);
            } else if (Object.keys(raw).length > 0 && $metadata.reference !== null) {
                await updateDoc($metadata.reference, raw);
            }
            $metadata.previousOrigin = $metadata.origin;
            $metadata.origin = this.$getPlain();
        } catch (err) {
            if (err instanceof Error && err.code === "permission-denied") {
                throw new Error(
                    `You don't have permission to ${isNew ? "create" : "edit"} ${
                        $metadata.reference?.path
                    }`
                );
            }

            throw err;
        }

        // save subcollections
        await this.savePropertyCollections();
        await this.updateEntityToSubCollections();

        this.$getMetadata().emit("saved");
    }

    async savePropertyCollections(copyFrom?: Entity) {
        const savePropertyCollectionPromises = Object.keys(
            this.$getMetadata().collectionProperties
        ).map(async (propertyKey) => {
            await this.savePropertyCollection(propertyKey, copyFrom);
        });
        await Promise.all(savePropertyCollectionPromises);
    }

    async savePropertyCollection(propertyKey: string, copyFrom?: Entity) {
        const metadata = this.$getMetadata();
        if (metadata.reference === null) throw new Error("reference in metadata is null");

        const constructor = this.constructor as typeof Entity;
        const info = entitiesInfos.get(constructor.collectionName);
        if (info === undefined)
            throw new Error(`${constructor.collectionName} info is undefined`);

        const subCollection = (this as any)[propertyKey] as SubCollection<Entity>;
        const copiedSubCollection =
            copyFrom === undefined
                ? undefined
                : ((copyFrom as any)[propertyKey] as SubCollection<Entity>);
        // elements changed in array, if copyFrom is defined, it's a new entity, all elements are added from copyFrom
        const { toDelete, toAdd } =
            copiedSubCollection !== undefined
                ? {
                      toDelete: [],
                      toAdd: [...copiedSubCollection.list],
                  }
                : subCollection.getArrayModification();

        copiedSubCollection?.init(
            copiedSubCollection.entityModel!,
            `${metadata.reference.path}/${propertyKey}`
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

    $isDeleted() {
        return this.$getMetadata().isDeleted;
    }

    async $delete() {
        if (this.$getMetadata().reference) await deleteDoc(this.$getMetadata().reference);
        this.$getMetadata().markAsDeleted();
        this.$getMetadata().destroy();
    }

    $getPlainForLogs() {
        return {
            docName: this.$getModelName(),
            uid: this.$getID(),
            ...this.$getPlain(),
        };
    }

    $getModelName() {
        return (this.constructor as typeof Entity).collectionName.replace(/s$/, "");
    }
}

export function EntityArray(a: [] = []) {
    return shallowReactive(a);
}
