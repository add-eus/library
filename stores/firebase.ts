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
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
      };
    console.log(firebaseConfig, import.meta);
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    const auth = getAuth();
    const firestore = getFirestore();
    const functions = getFunctions(app, "europe-west1");
    const database = getDatabase(
        app,
        import.meta.env.NODE_FIREBASE_DATABASE_URL
    );
    const storage = getStorage();
    const analytics = getAnalytics(app);
    const performance = getPerformance(app);
    const remoteConfig = getRemoteConfig(app);

    fetchAndActivate(remoteConfig);
    let recaptchaApiKey = "6LcNhKIgAAAAAIbK7Z0I7ccYD9bj-Gw0idx58C4N";

    if (import.meta.env.DEV) {
        console.log("Development mode");

        connectAuthEmulator(
            auth,
            `http://${import.meta.env.VITE_HOST || "localhost"}:${
                import.meta.env.VITE_AUTH_PORT || 8012
            }`
        );

        connectFirestoreEmulator(
            firestore,
            import.meta.env.VITE_HOST || "localhost",
            import.meta.env.VITE_FIRESTORE_PORT || 8014
        );

        connectFunctionsEmulator(
            functions,
            import.meta.env.VITE_HOST || "localhost",
            import.meta.env.VITE_FUNCTION_PORT || 8013
        );

        connectDatabaseEmulator(
            database,
            import.meta.env.VITE_HOST || "localhost",
            import.meta.env.VITE_DATABASE_PORT || 8015
        );

        connectStorageEmulator(
            storage,
            import.meta.env.VITE_HOST || "localhost",
            import.meta.env.VITE_STORAGE_PORT || 8016
        );

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
