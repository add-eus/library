// Import the functions you need from the SDKs you need
import {
  Firestore,
} from "firebase/firestore";

let firestore: Firestore | undefined = undefined;

export const initORM = (clientFirestore: Firestore) => {
    firestore = clientFirestore;
};

export const useFirestore = () => {
    if (!firestore) {
        throw new Error("ORM not initialized");
    }
    return firestore;
};
