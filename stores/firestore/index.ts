import { ref, watch, isRef, shallowReactive } from "vue";
import algoliasearch from "algoliasearch";
import {
    getDocs,
    deleteDoc,
    limit,
    where,
    startAfter,
    startAt,
    endAt,
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
    documentId,
    DocumentSnapshot,
} from "firebase/firestore";
import { useFirestore as useInternalFirestore } from "@vueuse/firebase/useFirestore";
import { useFirebase } from "../firebase";
import { EntityORM } from "./entity";
import { until } from "@vueuse/core";
import { Query } from "./query";
import { QuerySearch } from "./querySearch";

console.log(import.meta.env);

const cachedEntities: { [key: string]: EntityORM } = {};
const algoliaClient = algoliasearch(import.meta.env.VITE_ALGOLIA_APPLICATION_ID, import.meta.env.VITE_ALGOLIA_API_KEY);

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

export class Collection extends Array {
    isUpdating: boolean = false;
}

/**
 * Get an updated collection from firestore
 *
 * @param collectionModel A Model declared in src/models
 * @param options An options of refs
 * @returns ref<any[]>
 */
export function useCollection(collectionModel: any, options: any) {
    const entities = shallowReactive<any>(new Collection());
    const firebase = useFirebase();
    const algoliaIndex = algoliaClient.initIndex(collectionModel.collectionName);
    const collectionRef = collection(firebase.firestore, collectionModel.collectionName);

    entities.isUpdating = true;

    let wheres: QueryConstraint[] = transformWheres(
        isRef(options.wheres) ? options.wheres.value : options.wheres
    );
    let orders: QueryConstraint[] = transformOrders(
        isRef(options.orders) ? options.orders.value : options.orders
    );
    let search: string = isRef(options.search) ? options.search.value : options.search;

    let query: Query | QuerySearch | null;

    async function clear() {
        entities.splice(0, entities.length);
    }

    async function fetch() {
        clear();
        if (query) query.destroy();

        if (search && search.length > 0) {
            query = new QuerySearch(
                [...wheres, ...orders],
                entities,
                (doc: DocumentSnapshot) => {
                    return transform(doc, collectionModel);
                },
                collectionRef,
                search,
                algoliaIndex
            );
        } else {
            query = new Query(
                [...wheres, ...orders],
                entities,
                (doc: DocumentSnapshot) => {
                    return transform(doc, collectionModel);
                },
                collectionRef
            );
        }

        entities.isUpdating = true;

        let limit = 10;
        if (isRef(options.limit) && typeof options.limit.value === 'number') 
            limit = options.limit.value;
        else if (typeof options.limit === 'number')
            limit = options.limit;
        if (limit == 0)
            return 
            
        await query.next(limit);
        entities.isUpdating = false;
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

    if (isRef(options.limit))
        watch(options.limit, async (newLimit: number, oldLimit: number) => {
            if (!query) return;
            const limit = newLimit - oldLimit;
            if (limit <= 0) return;
            entities.isUpdating = true;
            await query.next(limit);
            entities.isUpdating = false;
        });

    if (isRef(options.search))
        watch(options.search, async () => {
            search = options.search.value;
            await fetch();
        });

    fetch();

    return entities;
}

export function useDoc(collectionModel: any, id?: string) {
    if (!id) return newDoc(collectionModel);
    const { firestore } = useFirebase();
    const reference = doc(collection(firestore, collectionModel.collectionName), id);
    return transform(reference, collectionModel);
}

export function newDoc(collectionModel: any) {
    const entity = new collectionModel();
    entity.$metadata.on("saved", () => {
        const cachedIdEntity = `${collectionModel.collectionName}/${entity.$getID().id}`;
        if (!cachedEntities[cachedIdEntity]) cachedEntities[cachedIdEntity] = entity;
    });
    return entity;
}

export async function findDoc(collectionModel: any, options: any): Promise<any> {
    let wheres: QueryConstraint[] = transformWheres(
        isRef(options.wheres) ? options.wheres.value : options.wheres
    );
    let orders: QueryConstraint[] = transformOrders(
        isRef(options.orders) ? options.orders.value : options.orders
    );
    let search: string = isRef(options.search) ? options.search.value : options.search;

    let query: Query | QuerySearch | null;

    const entities: any[] = [];
    const firebase = useFirebase();

    const collectionRef = collection(firebase.firestore, collectionModel.collectionName);

    if (search && search.length > 0) {
        const algoliaIndex = algoliaClient.initIndex(collectionModel.collectionName);
        query = new QuerySearch(
            [...wheres, ...orders],
            entities,
            (doc: DocumentSnapshot) => {
                return transform(doc, collectionModel);
            },
            collectionRef,
            search,
            algoliaIndex
        );
    } else {
        query = new Query(
            [...wheres, ...orders],
            entities,
            (doc: DocumentSnapshot) => {
                return transform(doc, collectionModel);
            },
            collectionRef
        );
    }
    const docs = await query.next(1);
    return transform(docs[0], collectionModel);
}

function transform(doc: any, Model: any) {
    const cachedIdEntity = `${Model.collectionName}/${doc.id}`;
    if (!cachedEntities[cachedIdEntity]) cachedEntities[cachedIdEntity] = new Model(doc);
    return cachedEntities[cachedIdEntity];
}

export { Input } from "./input";
export { Entity, EntityORM } from "./entity";
export { Var } from "./var";
