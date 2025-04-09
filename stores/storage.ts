import { acceptHMRUpdate, defineStore } from "pinia";

import {
    deleteObject,
    getBlob,
    getDownloadURL,
    getMetadata as getMetadataStorage,
    ref as refStorage,
    updateMetadata,
    uploadBytes,
} from "firebase/storage";
import { v4 as uuid } from "uuid";
import { useFirebase } from "./firebase";

export const useStorage = defineStore("Storage", () => {
    const storage = useFirebase().storage;
    const cached = {};

    const upload = async (file: File | Blob, path: string, fileName?: string) => {
        const pathName = path + "/" + (fileName ?? uuid());
        const refFile = refStorage(storage, pathName);
        const arrayBuffer = await file.arrayBuffer();

        cached[pathName] = file;

        await uploadBytes(refFile, arrayBuffer);

        await updateMetadata(refFile, {
            contentType: file.type,
        });

        return refFile;
    };

    const remove = async (url: string) => {
        const ref = refStorage(storage, url);
        await deleteObject(ref);
    };
    const fetch = async (url: string) => {
        if (cached[url] !== undefined) return cached[url];
        const refFile = refStorage(storage, url);
        const blob = await getBlob(refFile);
        cached[url] = blob;
        return blob;
    };
    const fetchAsDataUrl = async (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            fetch(url)
                .then((blob) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onload = () => {
                        resolve(reader.result as string);
                    };
                })
                .catch(reject);
        });
    };

    function publicUrlToPath(publicUrl: string): string {
        return publicUrl
            .replace(
                `${storage._protocol}://${
                    storage.host
                }${storage._bucket.fullServerUrl()}`,
                "",
            )
            .replace(/\?.*$/, "");
    }

    async function pathToPublicUrl(path: string): Promise<string> {
        const refFile = refStorage(storage, path);
        return getDownloadURL(refFile);
    }

    async function getMetadata(url: string) {
        const refFile = refStorage(storage, url);
        return getMetadataStorage(refFile);
    }

    return {
        upload,
        remove,
        fetch,
        fetchAsDataUrl,
        pathToPublicUrl,
        publicUrlToPath,
        getMetadata,
    };
});

/**
 * Pinia supports Hot Module replacement so you can edit your stores and
 * interact with them directly in your app without reloading the page.
 *
 * @see https://pinia.esm.dev/cookbook/hot-module-replacement.html
 * @see https://vitejs.dev/guide/api-hmr.html
 */
if ((import.meta as any).hot) {
    (import.meta as any).hot.accept(
        acceptHMRUpdate(useStorage, (import.meta as any).hot),
    );
}
