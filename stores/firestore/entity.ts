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

function Entity(options?: { collection?: string }) {
    return function (target: any) {
        target.collectionName =
            (options && options.collection) || lowerCaseFirst(target.name) + "s";

        //target.prototype = EntityORM.prototype;
        let classDeclaration: any;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const EntityMetaDataClass = EntityMetaData,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            DocumentReferenceClass = DocumentReference,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            DocumentSnapshotClass = DocumentSnapshot,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            reactiveInitiator = reactive,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            markRawInitiator = markRaw;
        eval(`classDeclaration = class ${target.name} extends target {
            $metadata = markRawInitiator(new EntityMetaDataClass(this));
            constructor(querySnapshot) {
                super();

                const reactivity = new Proxy(reactiveInitiator(this), {
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
        
                if (querySnapshot instanceof DocumentReferenceClass) {
                    this.$metadata.setReference(querySnapshot);
                } else if (querySnapshot instanceof DocumentSnapshotClass) {
                    this.$metadata.setReference(querySnapshot.ref);
                    this.$metadata.origin = querySnapshot.data();
                    this.$metadata.emit('parse', this.$metadata.origin);
                    this.$metadata.isFullfilled = true;
                }
                return reactivity;
            }
        }`);

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
