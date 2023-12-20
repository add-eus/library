import {
    DocumentReference,
    DocumentSnapshot,
    deleteDoc,
    collection,
    doc,
    setDoc,
    updateDoc,
    FirestoreError,
} from "firebase/firestore";
import { lowerCaseFirst } from "../../utils/string";
import { isReactive, markRaw, shallowReactive } from "vue";
import { useFirebase } from "../firebase";
import { EntityMetaData } from "./entityMetadata";
import { FirebaseError } from "firebase/app";

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

        let hasPreventGetEmit = true;
        const proxied = new Proxy(this, {
            get(obj, key: any) {
                if (
                    !hasPreventGetEmit &&
                    (typeof key !== "string" || !key.startsWith("$"))
                )
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

        hasPreventGetEmit = false;

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
        const result = Object.keys($metadata.properties).some((propertyKey: string) => {
            const property = $metadata.properties[propertyKey];
            const isChanged = property.isChanged;
            return isChanged;
        });
        return result;
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

    $setAndParseFromReference(querySnapshot: DocumentReference | DocumentSnapshot) {
        if (querySnapshot instanceof DocumentReference) {
            this.$getMetadata().setReference(querySnapshot);
        } else if (querySnapshot instanceof DocumentSnapshot) {
            this.$getMetadata().setReference(querySnapshot.ref);
            if (!querySnapshot.exists()) return this.$getMetadata().markAsDeleted();
            const data = querySnapshot.data();
            this.$getMetadata().previousOrigin = this.$getMetadata().origin =
                typeof data === "object" && data !== null ? data : {};

            this.$getMetadata().emit("parse", this.$getMetadata().origin);

            this.$getMetadata().isFullfilled = true;
        }
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

    async $save(): Promise<void> {
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
            if (err instanceof FirestoreError && err.code === "permission-denied") {
                throw new Error(
                    `You don't have permission to ${isNew ? "create" : "edit"} ${
                        $metadata.reference?.path
                    }`
                );
            } else if (
                err instanceof FirebaseError &&
                err.code === "auth/network-request-failed"
            )
                return this.$save();

            throw err;
        }
        this.$getMetadata().emit("saved");
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
