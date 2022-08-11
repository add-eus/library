<script setup lang="ts">
import { ref } from "vue";
import { getFirestore, doc, getDoc, collection } from "firebase/firestore";
import { httpsCallable } from "/@src/lib/stores/firebase";

const firestore = getFirestore();

export type ImageFirestoreProps = {
    path: string;
    collection: string;
    document: string;
};

const props = withDefaults(defineProps<ImageFirestoreProps>(), {
    path: null,
    collection: null,
    document: null,
});

const value = ref(null);

(async () => {
    let data;
    if (props.collection == "customers") {
        data = await httpsCallable.getCustomerById(props.document);
        if (!data) return;
    } else {
        const collec = collection(firestore, props.collection);
        const d = await getDoc(doc(collec, props.document));
        if (!d) return;
        data = d.data();
    }

    if (data) value.value = data[props.path];
})();
</script>

<template>
    <span>{{ value }}</span>
</template>
