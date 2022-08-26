import { useFirebase } from "./firebase";
import {
    httpsCallable as firebaseHttpsCallable,
} from "firebase/functions";

export default new Proxy(
    {},
    {
        get(object: {[key: string]: Function}, name: string) {
            if (!object[name]) {
                const callableFunction = firebaseHttpsCallable(
                    useFirebase().functions,
                    name
                );
                object[name] = async function (...args: any[]) {
                    const result = await callableFunction(...args, navigator?.language);
                    return result.data;
                };
            }
            return object[name];
        },
    }
);