import { acceptHMRUpdate, defineStore } from "pinia";

// Import the functions you need from the SDKs you need
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import {
    getFunctions,
    connectFunctionsEmulator,
    httpsCallable as firebaseHttpsCallable,
} from "firebase/functions";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getPerformance } from "firebase/performance";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { initializeApp, Firebase } from "firebase/app";
import { getRemoteConfig, fetchAndActivate } from "firebase/remote-config";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

export type Firebase = Firebase;

export const useFirebase = defineStore("firebase", () => {
    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCSNoCNjpCRsVmiylytuKgHwKRmQelAfig",
        authDomain: "jarveat.firebaseapp.com",
        projectId: "jarveat",
        storageBucket: "jarveat.appspot.com",
        messagingSenderId: "793582365372",
        appId: "1:793582365372:web:dda7e948f32bef4f97beb9",
    };

    // Initialize Firebase
    const firebaseApp = initializeApp(firebaseConfig);

    const auth = getAuth();
    const database = getFirestore();
    const functions = getFunctions(firebaseApp, "europe-west1");
    const liveDatabase = getDatabase(
        firebaseApp,
        "https://jarveat-default-rtdb.europe-west1.firebasedatabase.app"
    );
    const storage = getStorage();
    const analytics = getAnalytics(firebaseApp);
    const performance = getPerformance(firebaseApp);
    const remoteConfig = getRemoteConfig(firebaseApp);

    fetchAndActivate(remoteConfig);
    let recaptchaApiKey = "6LcNhKIgAAAAAIbK7Z0I7ccYD9bj-Gw0idx58C4N";

    if (import.meta.env.DEV) {
        console.log("Development mode");

        connectAuthEmulator(auth, "http://allanic.me:8012");

        connectFirestoreEmulator(database, "allanic.me", 8014);

        connectFunctionsEmulator(functions, "allanic.me", 8013);

        connectDatabaseEmulator(liveDatabase, "allanic.me", 8015);

        connectStorageEmulator(storage, "allanic.me", 8016);

        //self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
        recaptchaApiKey = "6LfXcS0hAAAAAByH_tVnK9GNlF0aIiY-q2bBsxoc";
    }

    const check = initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaV3Provider(recaptchaApiKey),

        // Optional argument. If true, the SDK automatically refreshes App Check
        // tokens as needed.
        //isTokenAutoRefreshEnabled: true,
    });

    return {
        app: firebaseApp,
        remoteConfig,
        auth,
        liveDatabase,
        database,
        functions,
        storage,
        analytics,
        performance,
        check,
    };
});

export const httpsCallable = new Proxy(
    {},
    {
        get(object: Object, name: string) {
            if (!object[name]) {
                const callableFunction = firebaseHttpsCallable(
                    useFirebase().functions,
                    name
                );
                object[name] = async function (...args) {
                    const result = await callableFunction(...args, navigator?.language);
                    return result.data;
                };
            }
            return object[name];
        },
    }
);

export const httpsOpen = async function (path, args) {
    const { functions } = useFirebase();
    const url = functions._url(path);
    const encodedArgs = encodeURIComponent(JSON.stringify(args));
    const w = window.open(`${url}?args=${encodedArgs}`);
    await new Promise((resolve) => {
        const i = setInterval(() => {
            if (w.closed) {
                clearInterval(i);
                resolve(w);
            }
        }, 100);
    });
};

/**
 * Pinia supports Hot Module replacement so you can edit your stores and
 * interact with them directly in your app without reloading the page.
 *
 * @see https://pinia.esm.dev/cookbook/hot-module-replacement.html
 * @see https://vitejs.dev/guide/api-hmr.html
 */
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useFirebase, import.meta.hot));
}
