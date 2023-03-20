import { acceptHMRUpdate, defineStore } from "pinia";

import {
    ref as refStorage,
    deleteObject,
    getBlob,
    uploadBytes,
    updateMetadata,
} from "firebase/storage";
import { useFirebase } from "./firebase";
import { v4 as uuid } from "uuid";

export const useStorage = defineStore("Storage", () => {
    const storage = useFirebase().storage;
    const cached = {};
    return {
        async upload(file: File | Path | Blob, path: string) {
            const pathName = path + "/" + uuid();
            const refFile = refStorage(storage, pathName);
            const arrayBuffer = await file.arrayBuffer();

            cached[pathName] = file;

            await uploadBytes(refFile, arrayBuffer);

            await updateMetadata(refFile, {
                contentType: file.type,
            });

            return refFile.fullPath;
        },
        async remove(url: string) {
            const ref = refStorage(storage, url);
            await deleteObject(ref);
        },
        async fetch(url: string) {
            if (cached[url] !== undefined) return cached[url];
            const refFile = refStorage(storage, url);
            const blob = await getBlob(refFile);
            cached[url] = blob;
            return blob;
        },
    };
});

/**
 * Pinia supports Hot Module replacement so you can edit your stores and
 * interact with them directly in your app without reloading the page.
 *
 * @see https://pinia.esm.dev/cookbook/hot-module-replacement.html
 * @see https://vitejs.dev/guide/api-hmr.html
 */
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useStorage, import.meta.hot));
}
