import { acceptHMRUpdate, defineStore } from "pinia";

// Import the functions you need from the SDKs you need
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getPerformance } from "firebase/performance";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { initializeApp } from "firebase/app";
import { getRemoteConfig, fetchAndActivate } from "firebase/remote-config";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

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
    const app = initializeApp(firebaseConfig);

    const auth = getAuth();
    const firestore = getFirestore();
    const functions = getFunctions(app, "europe-west1");
    const database = getDatabase(
        app,
        "https://jarveat-default-rtdb.europe-west1.firebasedatabase.app"
    );
    const storage = getStorage();
    const analytics = getAnalytics(app);
    const performance = getPerformance(app);
    const remoteConfig = getRemoteConfig(app);

    fetchAndActivate(remoteConfig);
    let recaptchaApiKey = "6LcNhKIgAAAAAIbK7Z0I7ccYD9bj-Gw0idx58C4N";

    if (import.meta.env.DEV) {
        console.log("Development mode");

        connectAuthEmulator(auth, `http://${import.meta.env.HOST || 'localhost'}:${import.meta.env.AUTH_PORT || 8012}`);

        connectFirestoreEmulator(firestore, import.meta.env.HOST  || 'localhost', import.meta.env.FIRESTORE_PORT || 8014);

        connectFunctionsEmulator(functions, import.meta.env.HOST  || 'localhost', import.meta.env.FUNCTION_PORT || 8013);

        connectDatabaseEmulator(database, import.meta.env.HOST  || 'localhost', import.meta.env.DATABASE_PORT || 8015);

        connectStorageEmulator(storage, import.meta.env.HOST  || 'localhost', import.meta.env.STORAGE_PORT || 8016);

        //self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
        recaptchaApiKey = "6LfXcS0hAAAAAByH_tVnK9GNlF0aIiY-q2bBsxoc";
    }

    const check = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaApiKey),

        // Optional argument. If true, the SDK automatically refreshes App Check
        // tokens as needed.
        //isTokenAutoRefreshEnabled: true,
    });

    return {
        app,
        remoteConfig,
        auth,
        database,
        firestore,
        functions,
        storage,
        analytics,
        performance,
        check,
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
    import.meta.hot.accept(acceptHMRUpdate(useFirebase, import.meta.hot));
}
