import { ref, watch, isRef } from "vue";
import {
    getDocs,
    deleteDoc,
    limit,
    where,
    startAfter,
    orderBy,
    query,
    collection,
    doc,
    DocumentData,
    QueryDocumentSnapshot,
    WhereFilterOp,
    QueryConstraint,
    OrderByDirection,
    onSnapshot,
} from "firebase/firestore";
import { useFirestore as useInternalFirestore } from "@vueuse/firebase/useFirestore";
import { useFirebase } from "../firebase";
import { EntityORM } from "./entity";

const cachedEntities: { [key: string]: EntityORM } = {};

function transformWheres(whereOptions: [] = []): QueryConstraint[] {
    return whereOptions.map((whereOption: [string, WhereFilterOp, any]) => {
        return where(...whereOption);
    });
}

function transformOrders(orderOptions: [] = []): QueryConstraint[] {
    return orderOptions.map((orderOption: [string, OrderByDirection]) => {
        return orderBy(...orderOption);
    });
}

function transformLimits(limitOptions: number[] | number | undefined): QueryConstraint[] {
    if (!limitOptions) return [];
    if (!Array.isArray(limitOptions)) {
        limitOptions = [limitOptions];
    }
    return limitOptions.map((limitOption: number) => {
        return limit(limitOption);
    });
}

function transformStartAfters(
    startAfterOptions: any[] | any | undefined
): QueryConstraint[] {
    if (!startAfterOptions) return [];

    if (!Array.isArray(startAfterOptions)) {
        startAfterOptions = [startAfterOptions];
    }
    return startAfterOptions.map((startAfterOption: any) => {
        return startAfter(startAfterOption);
    });
}

/**
 * Get an updated collection from firestore
 *
 * @param collectionModel A Model declared in src/models
 * @param options An options of refs
 * @returns ref<any[]>
 */
export function useCollection(collectionModel: any, options: any) {
    const entities = ref(<any[]>[]);
    const firebase = useFirebase();
    console.log([collectionModel]);
    const collectionRef = collection(firebase.firestore, collectionModel.collectionName);

    let wheres: QueryConstraint[] = transformWheres(
        isRef(options.wheres) ? options.wheres.value : options.wheres
    );
    let orders: QueryConstraint[] = transformOrders(
        isRef(options.orders) ? options.orders.value : options.orders
    );
    let limits: QueryConstraint[] = transformLimits(
        isRef(options.limit) ? options.limit.value : options.limit
    );
    let startAfters: QueryConstraint[] = transformStartAfters(
        isRef(options.startAfter) ? options.startAfter.value : options.startAfter
    );

    let unsuscribeOnSnapshot: Function | undefined;
    async function fetch() {
        const constraints = [
            ...wheres,
            ...orders,
            ...limits,
            ...startAfters,
        ] as QueryConstraint[];
        const q = query(collectionRef, ...constraints);

        if (unsuscribeOnSnapshot) unsuscribeOnSnapshot();
        unsuscribeOnSnapshot = onSnapshot(q, async (snapshot) => {
            entities.value = await Promise.all(
                snapshot.docs.map(async (doc) => {
                    return transform(doc, collectionModel);
                })
            );
        });
    }

    if (isRef(options.wheres))
        watch(options.wheres, () => {
            wheres = transformWheres(options.wheres.value);
            fetch();
        });

    if (isRef(options.orders))
        watch(options.orders, () => {
            orders = transformOrders(options.orders.value);
            fetch();
        });

    if (isRef(options.startAfter))
        watch(options.startAfter, () => {
            startAfters = transformStartAfters(options.startAfter.value);
            fetch();
        });

    if (isRef(options.limit))
        watch(options.limit, () => {
            limits = transformLimits(options.limit.value);
            fetch();
        });

    fetch();

    return entities;
}

export function useDoc(collectionModel: any, id?: string) {
    if (!id) return newDoc(collectionModel);
    const { firestore } = useFirebase();
    const reference = doc(collection(firestore, collectionModel.collectionName), id);
    const model = new collectionModel(reference);
    model.$metadata.refresh();
    const entity = ref(<EntityORM>model);
    return entity;
}

export function newDoc(collectionModel: any) {
    const entity = new collectionModel();
    entity.$metadata.on("saved", () => {
        const cachedIdEntity = `${collectionModel.collectionName}/${entity.$getID().id}`;
        if (!cachedEntities[cachedIdEntity]) cachedEntities[cachedIdEntity] = entity;
    });
    return entity;
}

function transform(doc: any, Model: any) {
    const cachedIdEntity = `${Model.collectionName}/${doc.id}`;
    if (!cachedEntities[cachedIdEntity]) cachedEntities[cachedIdEntity] = new Model(doc);
    return cachedEntities[cachedIdEntity];
}

export { Input } from "./input";
export { Entity, EntityORM } from "./entity";
export { Var } from "./var";
