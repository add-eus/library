import EventEmitter from "events";
import {
    CollectionReference,
    DocumentSnapshot,
    limit,
    onSnapshot,
    query,
    QueryConstraint,
    startAfter,
} from "firebase/firestore";

class Queue {
    queue: Promise<any>[] = [];

    async add(callback: Function): Promise<any> {
        const waitPrevious = Promise.all(this.queue);
        let subCallback: Function | undefined;
        const waitCurrent = new Promise((resolve, reject) => {
            subCallback = () => {
                callback().then(resolve, reject);
            };
        });
        this.queue.push(waitCurrent);
        await waitPrevious;
        if (subCallback) subCallback();
        const result = await waitCurrent;
        const indexToRemove = this.queue.indexOf(waitCurrent);
        this.queue.splice(indexToRemove, 1);
        return result;
    }
}

export class Query extends EventEmitter {
    private constraints: QueryConstraint[] = [];
    private list: any[] = [];
    private transform: Function;
    private snapshots: DocumentSnapshot[] = [];
    private reference: CollectionReference;
    private indexes: number[] = [];
    public queue = new Queue();

    constructor(
        constraints: QueryConstraint[],
        list: any[],
        transform: Function,
        reference: CollectionReference
    ) {
        super();
        this.constraints = constraints;
        this.list = list;
        this.transform = transform;
        this.reference = reference;
    }

    async next(
        sizeLimit: number | undefined,
        additionalConstraints: QueryConstraint[] = []
    ): Promise<DocumentSnapshot[]> {
        return this.queue.add(async () => {
            const currentIndex = this.indexes.length;

            const constraints = [...additionalConstraints, ...this.constraints];

            const position = this.indexes.reduce((acc, index) => {
                return acc + index;
            }, 0);

            if (position > 0) {
                if (!this.snapshots[position - 1]) return [];

                constraints.push(startAfter(this.snapshots[position - 1]));
            }

            if (sizeLimit) {
                constraints.push(limit(sizeLimit));
            }

            const q = query(this.reference, ...constraints);

            return new Promise((resolve, reject) => {
                this.on(
                    "destroy",
                    onSnapshot(
                        q,
                        async (snapshot) => {
                            snapshot.docs.map((doc, index) => {
                                this.snapshots[position + index] = doc;
                                const model = this.transform(doc);
                                this.list[position + index] = model;
                            });
                            this.indexes[currentIndex] = snapshot.docs.length;
                            resolve(snapshot.docs);
                        },
                        reject
                    )
                );
            });
        });
    }

    destroy() {
        this.emit("destroy");
    }
}
