import {
    DocumentReference,
    DocumentSnapshot,
    deleteDoc,
    collection,
    doc,
    setDoc,
} from "firebase/firestore";
import { reactive, markRaw } from "vue";
import { useFirebase } from "../firebase";
import { EntityMetaData } from "./entityMetadata";
import { lowerCaseFirst } from "../text";

function initClassDeclaration(target: any) {
    // eslint-disable-next-line prefer-const
    /*let init: Function = () => {};
    eval(`init = function (target, markRaw, reactive, DocumentReference, EntityMetaData, DocumentSnapshot) {
            return class ${target.name} extends target {
                $metadata = markRaw(new EntityMetaData(this));
                constructor(querySnapshot) {
                    super();

                    const reactivity = new Proxy(reactive(this), {
                        get(obj, key) {
                            obj.$metadata.emit('get', key);
                            return obj[key];
                        },
                        set(obj, key, value) {
                            obj[key] = value;
                            obj.$metadata.emit('set', key, value);
                            return true;
                        }
                    });

                    if (Array.isArray(this.constructor.onInitialize)) {
                        this.constructor.onInitialize.map((callback) => {
                            return callback.call(reactivity, this.$metadata);
                        });
                    }
            
                    if (querySnapshot instanceof DocumentReference) {
                        this.$metadata.setReference(querySnapshot);
                    } else if (querySnapshot instanceof DocumentSnapshot) {
                        this.$metadata.setReference(querySnapshot.ref);
                        this.$metadata.origin = querySnapshot.data();
                        this.$metadata.emit('parse', this.$metadata.origin);
                        this.$metadata.isFullfilled = true;
                    }
                    return reactivity;
                }
            }
        }`);
    return init(
        target,
        markRaw,
        reactive,
        DocumentReference,
        EntityMetaData,
        DocumentSnapshot
    );*/
    return class extends target {
        $metadata = markRaw(new EntityMetaData(this));
        constructor(querySnapshot?: DocumentSnapshot | DocumentReference) {
            super();

            const reactivity = new Proxy(reactive(this), {
                get(obj, key: string) {
                    obj.$metadata.emit("get", key);
                    return obj[key];
                },
                set(obj: { [key: string]: any }, key: string, value: any) {
                    obj[key] = value;
                    obj.$metadata.emit("set", key, value);
                    return true;
                },
            });

            if (Array.isArray(this.constructor.onInitialize)) {
                this.constructor.onInitialize.map((callback: Function) => {
                    return callback.call(reactivity, this.$metadata);
                });
            }

            if (querySnapshot instanceof DocumentReference) {
                this.$metadata.setReference(querySnapshot);
            } else if (querySnapshot instanceof DocumentSnapshot) {
                this.$metadata.setReference(querySnapshot.ref);
                this.$metadata.origin = querySnapshot.data();
                this.$metadata.emit("parse", this.$metadata.origin);
                this.$metadata.isFullfilled = true;
            }
            return reactivity;
        }
    };
}
function Entity(options?: { collection?: string }) {
    return function (target: any) {
        target.collectionName =
            (options && options.collection) || lowerCaseFirst(target.name) + "s";

        const classDeclaration = initClassDeclaration(target);

        const prototypeKeys: string[] = Object.getOwnPropertyNames(EntityORM.prototype);
        prototypeKeys.forEach((key) => {
            if (key === "constructor") {
                return;
            }
            classDeclaration.prototype[key] = EntityORM.prototype[key];
        });

        target.addMethod = function (name, callback) {
            classDeclaration.prototype["$" + name] = callback;
        };

        return classDeclaration;
    };
}

class EntityORM {
    private $metadata: any;

    $getID() {
        if (!this.$metadata.reference) return;
        return this.$metadata.reference.id;
    }

    async $save() {
        const raw = {};
        this.$metadata.emit("format", raw);

        if (!this.$metadata.reference) {
            const firebase = useFirebase();
            this.$metadata.setReference(
                doc(collection(firebase.firestore, this.constructor.collectionName))
            );
        }

        console.log(raw);
        await setDoc(this.$metadata.reference, raw);

        this.$metadata.emit("saved");
    }

    async $delete() {
        if (this.$metadata.reference) await deleteDoc(this.$metadata.reference);
        this.$metadata.destroy();
    }

    $reset() {
        if (!this.$metadata.reference) throw new Error("No original data to reset");
        Object.values(this.$metadata.properties).forEach(
            (property: any) => (property.isChanged = false)
        );
        this.$metadata.emit("parse", this.$metadata.origin);
        this.$metadata.isFullfilled = true;
    }
}

function onInitialize(target: any, callback: Function) {
    const constructor = target.constructor;
    if (!constructor.onInitialize) constructor.onInitialize = [];
    constructor.onInitialize.push(callback);
}

function isEntityClass(entityClass: any) {
    return (
        entityClass &&
        entityClass.prototype &&
        typeof entityClass.prototype.$getID == "function"
    );
}

export { Entity, EntityORM, onInitialize, isEntityClass };
