import { acceptHMRUpdate, defineStore } from "pinia";
import type { ComputedRef } from "vue";
import { computed, ref } from "vue";
import type {
    User as UserFirebase,
    ConfirmationResult,
    ApplicationVerifier,
} from "firebase/auth";
import { signInWithEmailLink } from "firebase/auth";
import { isSignInWithEmailLink } from "firebase/auth";
import {
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    verifyPasswordResetCode,
    confirmPasswordReset,
    setPersistence,
    browserSessionPersistence,
    browserLocalPersistence,
    signInWithPhoneNumber,
    updateProfile,
    reload,
    deleteUser,
    signOut,
} from "firebase/auth";

import { useFirebase } from "addeus-common-library/stores/firebase";
import { until } from "@vueuse/core";

export type UserData = Record<string, any> | null;

interface User extends UserFirebase {
    reloadUserInfo?: any;
}

export const useUserSession = defineStore("userSession", () => {
    const firebase = useFirebase();

    const auth = firebase.auth;
    const user = ref<User | null>(null);
    const users = ref([]);

    const isLoggedIn = computed(() => {
        return user.value !== null;
    });

    const loading = ref(true);

    function setLoading(newLoading: boolean) {
        loading.value = newLoading;
    }

    async function login(username: string, password: string, hasRemember: boolean) {
        if (hasRemember) await setPersistence(auth, browserLocalPersistence);
        else await setPersistence(auth, browserSessionPersistence);

        const userCredential = await signInWithEmailAndPassword(auth, username, password);

        const user = userCredential.user;

        return user;
    }

    async function logout() {
        user.value = null;
        await signOut(auth);
    }

    function update(data: { displayName?: string; photoUrl?: string }) {
        if (!user.value) throw new Error("No user");

        return updateProfile(user.value, data);
    }

    async function loginOrRegisterWithPhoneNumber(
        phoneNumber: string,
        recaptchaVerifier: ApplicationVerifier
    ): Promise<ConfirmationResult> {
        return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    }

    async function deleteAccount() {
        if (!user.value) throw new Error("No User");
        return deleteUser(user.value);
    }

    async function sendPasswordReset(email?: string) {
        if (email === undefined) {
            if (user.value === null) throw new Error("No user to reset");
            if (typeof user.value.email !== "string")
                throw new Error("No email configured in current user");

            email = user.value.email;
        }

        if (email === undefined) throw new Error("No user to reset");

        return sendPasswordResetEmail(auth, email);
    }

    async function resetPassword(actionCode: string, password: string) {
        await verifyPasswordResetCode(auth, actionCode);
        await confirmPasswordReset(auth, actionCode, password);
    }

    let permissionManagement: (user: User, permission: string) => boolean = () => true;
    function configurePermissionManagement(
        callbackPermissionManagement: (user: User, permission: string) => boolean
    ) {
        if (!isLoggedIn.value) return;

        permissionManagement = callbackPermissionManagement;
    }

    function hasPermission(permission: string | string[]) {
        if (!isLoggedIn.value || user.value === null) return false;

        if (Array.isArray(permission))
            return permission.some((p) => permissionManagement(user.value, p));

        return permissionManagement(user.value, permission);
    }

    const isLoaded = ref(false);
    const hasMagicLink = ref(false);

    (() => {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            hasMagicLink.value = true;
            // Additional state parameters can also be passed via URL.
            // This can be used to continue the user's intended action before triggering
            // the sign-in operation.
            // Get the email if available. This should be available if the user completes
            // the flow on the same device where they started it.
            const params = new URL(document.location.toString()).searchParams;
            const email = params.get("email");

            if (email === null) {
                // User opened the link on a different device. To prevent session fixation
                // attacks, ask the user to provide the associated email again. For example:
                return;
            }
            // The client SDK will parse the code from the link for you.

            params.delete("email");
            params.delete("mode");
            params.delete("lang");
            params.delete("oobCode");
            params.delete("apiKey");

            const removeParamsURL = window.location.pathname + "?" + params.toString();

            signInWithEmailLink(auth, email, window.location.href).finally(() => {
                hasMagicLink.value = false;
                // eslint-disable-next-line no-console
                onLogin(auth.currentUser).catch(console.error);
                window.addEventListener("load", () => {
                    until(isLoaded)
                        .toBe(true)
                        .finally(() => {
                            window.history.replaceState(
                                {},
                                document.title,
                                removeParamsURL
                            );
                        });
                });
            });
        }
    })();

    const onUserChangeCallbacks: Function[] = [];
    async function onUserChange(callback: Function) {
        if (isLoaded.value) {
            const authUser = auth.currentUser;
            if (
                authUser !== undefined &&
                authUser !== null &&
                authUser.reloadUserInfo !== undefined
            ) {
                const customAttributes = JSON.parse(
                    authUser.reloadUserInfo.customAttributes !== undefined
                        ? authUser.reloadUserInfo.customAttributes
                        : "{}"
                );
                await callback(authUser, customAttributes);
            } else {
                await callback(authUser, null);
            }
        }

        onUserChangeCallbacks.push(callback);
    }

    const onLogin = async function (authUser: User | null) {
        if (hasMagicLink.value) return;
        if (!authUser) {
            isLoaded.value = true;
            await Promise.all(
                onUserChangeCallbacks.map((onUserChangeCallback) => {
                    return onUserChangeCallback(authUser, null);
                })
            );
            return;
        }

        if (authUser.reloadUserInfo === undefined) await reload(authUser);
        const customAttributes = JSON.parse(
            authUser.reloadUserInfo.customAttributes !== undefined
                ? authUser.reloadUserInfo.customAttributes
                : "{}"
        );
        user.value = authUser;

        await Promise.all(
            onUserChangeCallbacks.map((onUserChangeCallback) => {
                return onUserChangeCallback(authUser, customAttributes);
            })
        );

        if (
            customAttributes.owners === undefined ||
            Object.keys(customAttributes.owners).length <= 0
        ) {
            if (!isLoaded.value) {
                isLoaded.value = true;
            }
            return;
        }
    };
    // auth.onIdTokenChanged(onLogin);
    auth.onAuthStateChanged((authUser) => void onLogin(authUser));

    return {
        user,
        users,
        onUserChange,
        hasPermission,
        configurePermissionManagement,
        waitInitialize: until(isLoaded).toBe(true),
        update,
        isLoggedIn,
        loading,
        login,
        logout,
        loginOrRegisterWithPhoneNumber,
        setLoading,
        deleteAccount,
        sendPasswordReset,
        resetPassword,
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
    import.meta.hot.accept(acceptHMRUpdate(useUserSession, import.meta.hot));
}
