import {
    CollectionReference,
    documentId,
    DocumentSnapshot,
    QueryConstraint,
    where,
} from "firebase/firestore";
import { Query } from "./query";

export class QuerySearch extends Query {
    private searchText = "";
    private algoliaIndex;
    private hits: any[] | null = null;
    private currentHitIndex = 0;
    constructor(
        constraints: QueryConstraint[],
        list: any[],
        transform: Function,
        reference: CollectionReference,
        searchText: string,
        algoliaIndex: any
    ) {
        super(constraints, list, transform, reference);
        this.searchText = searchText;
        this.algoliaIndex = algoliaIndex;
    }

    async next(
        limit: number,
        additionalConstraints: QueryConstraint[] = []
    ): Promise<DocumentSnapshot[]> {
        if (!this.hits) {
            const { hits } = await this.algoliaIndex.search(this.searchText);

            this.hits = hits;
        }
        if (!this.hits || this.hits.length === 0) return [];

        let i;
        let docs: DocumentSnapshot[] = [];
        const scale = limit > 10 ? 10 : limit;
        for (i = this.currentHitIndex; i < this.hits.length; i += scale) {
            const hitObjectIDS = this.hits
                .slice(this.currentHitIndex, scale + this.currentHitIndex)
                .map((hit) => hit.objectID);
            console.log(hitObjectIDS, this.currentHitIndex, i);

            const parentDocs = await super.next(i - this.currentHitIndex, [
                where(documentId(), "in", hitObjectIDS),
                ...additionalConstraints,
            ]);

            docs = docs.concat(parentDocs);

            this.currentHitIndex = i;
            if (docs.length > limit) break;
        }

        return docs;
    }
}
