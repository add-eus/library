// Import the functions you need from the SDKs you need
import type { Auth } from "firebase/auth";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import type { Functions } from "firebase/functions";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import type { FirebaseStorage } from "firebase/storage";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import type { Analytics } from "firebase/analytics";
import { getAnalytics } from "firebase/analytics";
import type { FirebasePerformance } from "firebase/performance";
import { getPerformance } from "firebase/performance";
import type { Database } from "firebase/database";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import type { FirebaseApp } from "firebase/app";
import { initializeApp } from "firebase/app";
import type { RemoteConfig } from "firebase/remote-config";
import { getRemoteConfig, fetchAndActivate } from "firebase/remote-config";
import type { AppCheck } from "firebase/app-check";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

function connectToEmulator(
    auth: Auth,
    firestore: Firestore,
    functions: Functions,
    database: Database,
    storage: FirebaseStorage
) {
    if (import.meta.env.DEV && (<any>window).emulatorLoaded !== true) {
        // eslint-disable-next-line no-console
        console.log("Development mode");

        const host =
            import.meta.env.VITE_HOST !== undefined
                ? import.meta.env.VITE_HOST
                : "localhost";

        connectAuthEmulator(
            auth,
            import.meta.env.VITE_FIRESTORE_AUTH_HOST !== undefined
                ? import.meta.env.VITE_FIRESTORE_AUTH_HOST
                : `http://${host}:${
                      import.meta.env.VITE_AUTH_PORT !== undefined
                          ? import.meta.env.VITE_AUTH_PORT
                          : 8012
                  }`
        );

        connectFirestoreEmulator(
            firestore,
            host,
            import.meta.env.VITE_FIRESTORE_PORT !== undefined
                ? import.meta.env.VITE_FIRESTORE_PORT
                : 8014
        );

        connectFunctionsEmulator(
            functions,
            host,
            import.meta.env.VITE_FUNCTION_PORT !== undefined
                ? import.meta.env.VITE_FUNCTION_PORT
                : 8013
        );

        connectDatabaseEmulator(
            database,
            host,
            import.meta.env.VITE_DATABASE_PORT !== undefined
                ? import.meta.env.VITE_DATABASE_PORT
                : 8015
        );

        connectStorageEmulator(
            storage,
            host,
            import.meta.env.VITE_STORAGE_PORT !== undefined
                ? import.meta.env.VITE_STORAGE_PORT
                : 8016
        );

        (<any>window).FIREBASE_APPCHECK_DEBUG_TOKEN =
            import.meta.env.VITE_APP_CHECK_DEBUG_TOKEN;

        (<any>window).emulatorLoaded = true;
    }
}

let providers:
    | {
          app: FirebaseApp;
          remoteConfig: RemoteConfig;
          auth: Auth;
          database: Database;
          firestore: Firestore;
          functions: Functions;
          storage: FirebaseStorage;
          analytics: Analytics;
          performance: FirebasePerformance;
          check: AppCheck;
      }
    | undefined;

export function useFirebase() {
    if (providers === undefined) {
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

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);

        const auth = getAuth(app);
        const firestore = getFirestore(app);
        const database = getDatabase(app);
        const storage = getStorage(app);
        const functions = getFunctions(app, "europe-west1");
        const analytics = getAnalytics(app);
        const performance = getPerformance(app);
        const remoteConfig = getRemoteConfig(app);

        void fetchAndActivate(remoteConfig);

        void connectToEmulator(auth, firestore, functions, database, storage);

        const check = initializeAppCheck(app, {
            provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_RECAPTCHA_KEY),

            // Optional argument. If true, the SDK automatically refreshes App Check
            // tokens as needed.
            isTokenAutoRefreshEnabled: true,
        });
        providers = {
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
    }
    return providers;
}
