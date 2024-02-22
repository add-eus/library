import {
    get as getDatabase,
    onChildAdded as onChildAddedDatabase,
    onChildRemoved as onChildRemovedDatabase,
    push as pushDatabase,
    ref as refDatabase,
    remove as removeDatabase,
    set as setDatabase,
} from "firebase/database";
import { ref, toRaw } from "vue";
import { useFirebase } from "./firebase";

export const useDatabase = (path: string, options = {}) => {
    const firebase = useFirebase();

    const dataRef = refDatabase(toRaw(firebase.database), path);
    const cible = options.toArray !== undefined ? [] : {};
    const data = ref(cible);

    const refs = {};

    onChildAddedDatabase(dataRef, (childRef) => {
        if (options.toArray !== undefined) {
            data.value.push(childRef.val());
            refs[childRef.key] = childRef.val();
        } else {
            data.value[childRef.key] = childRef.val();
        }
    });

    onChildRemovedDatabase(dataRef, (childRef) => {
        if (options.toArray !== undefined) {
            const refO = refs[childRef.key];
            const index = data.value.findIndex((childRef) => childRef === refO);
            data.value.splice(index, 1);
        } else delete data.value[childRef.key];
    });

    return data.value;
};

export async function setFromPath(path, value) {
    const firebase = useFirebase();
    const ref = refDatabase(toRaw(firebase.database), path);
    await setDatabase(ref, value);
}

export async function pushFromPath(path, value) {
    const firebase = useFirebase();
    const ref = refDatabase(toRaw(firebase.database), path);
    await pushDatabase(ref, value);
    const r = await getDatabase(ref);
    return r.val();
}

export async function removeFromPath(path) {
    const firebase = useFirebase();
    const ref = refDatabase(toRaw(firebase.database), path);
    await removeDatabase(ref);
    const r = await getDatabase(ref.parent);
    return r.val();
}
