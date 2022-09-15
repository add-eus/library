import { acceptHMRUpdate, defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User as UserFirebase } from "firebase/auth";
import {
    signInWithEmailAndPassword,
    setPersistence,
    browserSessionPersistence,
    browserLocalPersistence,
    signInWithPhoneNumber,
    updateProfile,
    deleteUser,
    signOut,
    ConfirmationResult,
    ApplicationVerifier,
} from "firebase/auth";

import { collection, addDoc } from "firebase/firestore";

import { useStorage } from "@vueuse/core";

import { useFirebase } from "/@src/lib/stores/firebase";

import { Visit } from "/@src/lib/models/visit";

export type UserData = Record<string, any> | null;

interface User extends UserFirebase {
    reloadUserInfo?: any;
}

export const useUserSession = defineStore("userSession", () => {
    const firebase = useFirebase();
    // token will be synced with local storage
    // @see https://vueuse.org/core/usestorage/

    const auth = firebase.auth;
    const database = firebase.database;
    const user = ref<User | null>(auth.currentUser);
    const visits = useStorage("visits", <Visit[]>[]);

    console.log(user);

    const loading = ref(true);

    const isAdmin = computed(() => {
        if (!user.value) return false;
        const customAttributes = JSON.parse(user.value.reloadUserInfo.customAttributes);
        return customAttributes.roles.indexOf("admin") >= 0;
    });

    async function waitLoaded() {
        return new Promise((resolve) => {
            on("login", () => {
                resolve(true);
            });
        });
    }

    async function isLoggedIn() {
        if (!isLoaded) await waitLoaded();
        return !!auth.currentUser;
    }

    function isLoggedInSync() {
        return !!user.value;
    }

    function setLoading(newLoading: boolean) {
        loading.value = newLoading;
    }

    async function loginUser(username: string, password: string, hasRemember: Boolean) {
        if (hasRemember) await setPersistence(auth, browserLocalPersistence);
        else await setPersistence(auth, browserSessionPersistence);

        await signInWithEmailAndPassword(auth, username, password);

        return user;
    }

    async function logoutUser() {
        auth.signOut();
        user.value = null;
    }

    function getUser() {
        return user;
    }

    function updateUser(data: { displayName?: string; photoUrl?: string }) {
        const user = getUser();
        if (!user.value) throw new Error("No user");

        return updateProfile(user.value, data);
    }

    function hasRole(role: string) {
        if (!user.value) return false;
        const customAttributes = JSON.parse(user.value.reloadUserInfo.customAttributes);
        return customAttributes.roles.indexOf(role) >= 0;
    }

    function hasOneRole(roles: string[]) {
        if (typeof roles === "string") return hasRole(roles);
        for (let i = 0; i < roles.length; i++) if (hasRole(roles[i])) return true;
        return false;
    }

    async function getStats() {
        return {
            visits: 2,
        };
    }

    async function addVisit(place: string) {
        const visit = <Visit>{
            place,
            date: new Date(),
        };
        if (await isLoggedIn()) {
            await registerVisit(visit);
        } else {
            visits.value.push(visit);
        }
    }

    async function registerVisit(visit: Visit) {
        if (!user.value) throw new Error("No User");
        visit.customer = user.value.uid;
        await addDoc(collection(database, "visits"), visit);
    }

    async function loginOrRegisterWithPhoneNumber(
        phoneNumber: string,
        recaptchaVerifier: ApplicationVerifier
    ): Promise<ConfirmationResult> {
        return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    }

    async function signout() {
        return signOut(auth);
    }

    async function deleteAccount() {
        if (!user.value) throw new Error("No User");
        return deleteUser(user.value);
    }

    let isLoaded = false;

    const callbacks: { [key: string]: Function[] } = {};

    function on(name: string, callback: Function) {
        if (!callbacks[name]) callbacks[name] = [];
        callbacks[name].push(callback);
    }

    function emit(name: string, ...args: any[]) {
        if (!callbacks[name]) return;
        callbacks[name].forEach((callback) => callback(...args));
    }

    function onLogin(authUser: User | null) {
        //if (!authUser) return;
        user.value = authUser;
        if (!isLoaded) {
            isLoaded = true;
        }
        if (visits.value.length > 0 && authUser) {
            visits.value.forEach((visit: Visit) => registerVisit(visit));
            visits.value = [];
        }

        emit("login", authUser);
    }
    auth.onIdTokenChanged(onLogin);
    auth.onAuthStateChanged(onLogin);

    return {
        getUser,
        updateUser,
        isLoggedIn,
        loading,
        on,
        isAdmin,
        loginUser,
        hasRole,
        hasOneRole,
        logoutUser,
        getStats,
        addVisit,
        loginOrRegisterWithPhoneNumber,
        setLoading,
        isLoggedInSync,
        signout,
        deleteAccount,
    } as const;
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
