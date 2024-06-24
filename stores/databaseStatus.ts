import { createGlobalState } from "@vueuse/core";
import { getDatabase, onValue, ref } from "firebase/database";
import type { Ref } from "vue";
import { ref as vRef } from "vue";

export const useDatabaseStatus = createGlobalState(() => {
    const isOnline: Ref<boolean | null> = vRef(null);

    const db = getDatabase();
    const connectedRef = ref(db, ".info/connected");
    onValue(connectedRef, (snap) => {
        isOnline.value = snap.val();
    });

    return {
        isOnline,
    };
});
