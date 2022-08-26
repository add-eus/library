import { ref, watch } from "vue";
import {
    collection, query, doc
} from "firebase/firestore";
import { useFirestore as useInternalFirestore } from "@vueuse/firebase/useFirestore";
import { useFirebase } from "./firebase";

function transformEntity(entity: any) {
    const transformed: any = {};
    Object.keys(entity).forEach(key => {
        let value = entity[key];
        if (entity[key] && entity[key].toDate)
            value = entity[key].toDate();
        transformed[key] = value;
    });
    return transformed;
}

function transformEntities(entities: any[]) {
    const transformed: any[] = [];
    entities.forEach(entity => {
        transformed.push(transformEntity(entity));
    });
    return transformed;
}

export function useCollection(collectionName: string, queryArgs: any) {
    const {database} = useFirebase();
    const transformedQuery = ref();
    watch(queryArgs, () => {
        transformedQuery.value = query(collection(database, collectionName), ...queryArgs.value);
    });
    const outputs = useInternalFirestore(transformedQuery);
    const entities = ref(<any[]>[]);
    watch(outputs, (o: any) => entities.value = transformEntities(o));
    return entities;
}

export function useDoc(collectionName: string, id: string) {
    const {database} = useFirebase();
    const reference = doc(collection(database, collectionName), id);
    const output = useInternalFirestore(reference);
    const entity = ref(null);
    watch(output, (o) => entity.value = transformEntity(o));
    return entity;
}