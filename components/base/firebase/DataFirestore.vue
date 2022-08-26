<script setup lang="ts">
import { ref } from "vue";
import { getFirestore, doc, getDoc, collection } from "firebase/firestore";

const firestore = getFirestore();

export type ImageFirestoreProps = {
    path?: string | Function;
    collection: string;
    document: string;
};

const props = defineProps<ImageFirestoreProps>();

const value = ref(<any>{});

function getValueFromPath() {
    if (!value.value) return;
    if (typeof props.path == "string") return value.value[props.path];
    else if (typeof props.path == "function") return props.path(value.value);
}

(async () => {
    const collec = collection(firestore, props.collection);
    const d = await getDoc(doc(collec, props.document));
    if (!d) return;
    value.value = d.data();
})();
</script>

<template>
    <slot :data="value">
        <span>{{ getValueFromPath() }}</span>
    </slot>
</template>
