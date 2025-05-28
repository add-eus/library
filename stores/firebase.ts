// Import the functions you need from the SDKs you need
import { Capacitor } from "@capacitor/core";
import { getAnalytics, initializeAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { ReCaptchaEnterpriseProvider, initializeAppCheck } from "firebase/app-check";
import { connectAuthEmulator, getAuth, indexedDBLocalPersistence, initializeAuth } from "firebase/auth";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { getPerformance, initializePerformance } from "firebase/performance";
import { fetchAndActivate, getRemoteConfig } from "firebase/remote-config";
import { connectStorageEmulator, getStorage } from "firebase/storage";

if (Capacitor.isNativePlatform()) {
    window["gapi"] = {
        load: (name) => Promise.resolve(),
        iframes: {
            getContext: () => {
                return {
                    iframe: {
                        contentWindow: {
                            postMessage: (message) => {
                                console.log("gapi iframe message:", message);
                            },
                        },
                    },
                };
            },
        },
    };
}

export function useFirebase() {
    if (window.providers === undefined) {
        window.providers = {};

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
        window.providers.app = initializeApp(firebaseConfig);

        if (Capacitor.isNativePlatform()) {
            window.providers.auth = initializeAuth(window.providers.app, {
              persistence: indexedDBLocalPersistence
            })
        }
        else {
            window.providers.auth = getAuth(window.providers.app);
        }
        window.providers.firestore = getFirestore(window.providers.app);
        window.providers.database = getDatabase(window.providers.app);
        window.providers.storage = getStorage(window.providers.app);
        window.providers.functions = getFunctions(window.providers.app, "europe-west1");

        window.providers.remoteConfig = getRemoteConfig(window.providers.app);

        void fetchAndActivate(window.providers.remoteConfig);

        if (import.meta.env.DEV && (<any>window).emulatorLoaded !== true) {
            // eslint-disable-next-line no-console
            console.log("Development mode");

            const host =
                import.meta.env.VITE_HOST !== undefined
                    ? import.meta.env.VITE_HOST
                    : "localhost";

            connectAuthEmulator(
                window.providers.auth,
                import.meta.env.VITE_FIRESTORE_AUTH_HOST !== undefined
                    ? import.meta.env.VITE_FIRESTORE_AUTH_HOST
                    : `http://${host}:${
                          import.meta.env.VITE_AUTH_PORT !== undefined
                              ? import.meta.env.VITE_AUTH_PORT
                              : 8012
                      }`,
            );

            connectFirestoreEmulator(
                window.providers.firestore,
                host,
                import.meta.env.VITE_FIRESTORE_PORT !== undefined
                    ? import.meta.env.VITE_FIRESTORE_PORT
                    : 8014,
            );

            connectFunctionsEmulator(
                window.providers.functions,
                host,
                import.meta.env.VITE_FUNCTION_PORT !== undefined
                    ? import.meta.env.VITE_FUNCTION_PORT
                    : 8013,
            );

            connectDatabaseEmulator(
                window.providers.database,
                host,
                import.meta.env.VITE_DATABASE_PORT !== undefined
                    ? import.meta.env.VITE_DATABASE_PORT
                    : 8015,
            );

            connectStorageEmulator(
                window.providers.storage,
                host,
                import.meta.env.VITE_STORAGE_PORT !== undefined
                    ? import.meta.env.VITE_STORAGE_PORT
                    : 8016,
            );

            (<any>window).FIREBASE_APPCHECK_DEBUG_TOKEN =
                import.meta.env.VITE_APP_CHECK_DEBUG_TOKEN;

            (<any>window).emulatorLoaded = true;

            window.providers.analytics = initializeAnalytics(window.providers.app, {
                allow_google_signals: false,
                allow_ad_perzonalization_signals: false,
                event_category: "dev",
            });
            window.providers.performance = initializePerformance(window.providers.app, {
                dataCollectionEnabled: false,
                instrumentationEnabled: false,
            });
        } else {
            window.providers.analytics = getAnalytics(window.providers.app);
            window.providers.performance = getPerformance(window.providers.app);
        }

        window.providers.check = initializeAppCheck(window.providers.app, {
            provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_RECAPTCHA_KEY),

            // Optional argument. If true, the SDK automatically refreshes App Check
            // tokens as needed.
            isTokenAutoRefreshEnabled: true
        });
    }

    const cleanup = () => {
        if (!window.providers) return;

        let unsubscribeAuth;
        if (window.providers.auth) {
            unsubscribeAuth = window.providers.auth.onAuthStateChanged(() => {});
            if (unsubscribeAuth) unsubscribeAuth();
        }

        if (window.providers.database) {
            try {
                window.providers.database.goOffline();
                window.providers.database.app.delete();
            } catch (e) {
                console.debug("Error cleaning up database", e);
            }
        }

        if (window.providers.firestore) {
            try {
                window.providers.firestore.terminate();
            } catch (e) {
                console.debug("Error cleaning up firestore", e);
            }
        }

        if (window.providers.storage) {
            try {
                window.providers.storage.app.delete();
            } catch (e) {
                console.debug("Error cleaning up storage", e);
            }
        }

        if (window.providers.analytics) {
            try {
                window.providers.analytics.app.delete();
            } catch (e) {
                console.debug("Error cleaning up analytics", e);
            }
        }

        if (window.providers.performance) {
            try {
                window.providers.performance.app.delete();
            } catch (e) {
                console.debug("Error cleaning up performance", e);
            }
        }

        window.providers = undefined;
    };

    return {
        ...window.providers,
        cleanup,
    };
}

export const useFirestore = () => useFirebase().firestore;