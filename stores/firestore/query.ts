import type {
    CollectionReference,
    DocumentData,
    DocumentSnapshot,
    Query as FirestoreQuery,
    QueryConstraint,
} from "firebase/firestore";
import { limit, onSnapshot, query, startAfter } from "firebase/firestore";
import EventEmitter from "./event";

/**
 * Check if an element exist in array from 0 to maxIndex number
 * @param array
 * @param maxIndex
 * @param item
 * @returns
 */
function isInArrayTo(array: any[], maxIndex: number, item: any): boolean {
    let flag = false;
    for (let i = 0; i < maxIndex && i < array.length && !flag; i++) {
        if (array[i].$isSame(item) === true) flag = true;
    }
    return flag;
}

class Queue {
    queue: Promise<any>[] = [];
    list: any[] = [];
    chunk: any[] = [];
    lastSnapshots: any[] = [];
    reference: any;
    lastCallback: any;

    constructor(list: any[], reference) {
        this.list = list;
        this.reference = reference;
    }

    async add(
        callback: (
            startAfter: undefined | any,
            update: (list?: any, docs?: any) => void,
        ) => void,
        saveLastCallback: boolean = false,
    ): Promise<any> {
        const chunkIndex = this.chunk.length;
        const waitPrevious = Promise.all(this.queue);
        let subCallback: ((previousItem: any) => void) | undefined;
        let lastSnapshotIndex = -1;

        const waitCurrent = new Promise((resolve, reject) => {
            subCallback = (previousItem: any) => {
                const onUpdate = (list?: any[], snapshots?: DocumentSnapshot[]) => {
                    if (list === undefined || this.destroyed) return resolve([]);

                    this.chunk[chunkIndex] = list;

                    const newList = [...this.list];

                    let index = 0;
                    // We replace all items in the queue with the new ones or existant
                    for (let iChunk = 0; iChunk < this.chunk.length; iChunk++) {
                        for (let iRow = 0; iRow < this.chunk[iChunk].length; iRow++) {
                            if (!isInArrayTo(newList, index, this.chunk[iChunk][iRow])) {
                                newList[index] = this.chunk[iChunk][iRow];
                                index++;
                            }
                        }
                    }
                    // Set length of array
                    newList.length = index;

                    // Clear end of array
                    while (index < newList.length || index < this.list.length) {
                        if (newList[index] !== undefined) delete newList[index];
                        index++;
                    }

                    this.list.splice(0, index, ...newList);

                    const snapshot = snapshots[snapshots.length - 1];
                    if (snapshot !== undefined) {
                        this.lastSnapshots[lastSnapshotIndex] = snapshot;
                    }

                    resolve(list);
                    if (
                        this.lastCallback !== undefined &&
                        this.lastCallback !== subCallback
                    ) {
                        const previousLastSnapshot =
                            this.lastSnapshots[lastSnapshotIndex];
                        this.lastCallback(previousLastSnapshot);
                    }
                };
                try {
                    callback(previousItem, onUpdate);
                } catch (err) {
                    reject(err);
                }
            };
        });

        this.queue.push(waitCurrent);
        await waitPrevious;
        lastSnapshotIndex = this.lastSnapshots.length - 1;

        const previousLastSnapshot = this.lastSnapshots[lastSnapshotIndex];

        if (subCallback !== undefined) subCallback(previousLastSnapshot);
        const result = await waitCurrent;
        const indexToRemove = this.queue.indexOf(waitCurrent);
        this.queue.splice(indexToRemove, 1);
        if (!this.destroyed && saveLastCallback) this.lastCallback = subCallback;
        return result;
    }

    destroyed: boolean = false;
    destroy() {
        this.lastCallback = undefined;
        this.destroyed = true;
    }
}

export class Query extends EventEmitter {
    private constraints: QueryConstraint[] = [];
    private transform: (...args: any) => void;
    private reference?: CollectionReference;
    public queue: Queue;
    private firestoreQuery?: FirestoreQuery<DocumentData>;

    constructor(
        constraints: QueryConstraint[],
        list: any[],
        transform: (...args: any) => void,
        reference?: CollectionReference,
        firestoreQuery?: FirestoreQuery<DocumentData>,
    ) {
        super();
        this.constraints = constraints;
        this.transform = transform;
        this.reference = reference;
        this.queue = new Queue(list, reference);
        this.firestoreQuery = firestoreQuery;
    }

    private getQuery(
        sizeLimit: number | undefined,
        additionalConstraints: QueryConstraint[] = [],
        startAfterItem?: any,
    ) {
        const constraints = [...additionalConstraints, ...this.constraints];

        if (startAfterItem !== undefined) {
            constraints.push(startAfter(startAfterItem));
        }

        if (typeof sizeLimit === "number" && sizeLimit < 0) sizeLimit = undefined;

        if (sizeLimit) {
            constraints.push(limit(sizeLimit));
        }
        const q =
            this.firestoreQuery !== undefined ? this.firestoreQuery : this.reference;
        if (q === undefined) throw new Error("firestoreQuery or reference is required");

        return query(q, ...constraints);
    }

    async next(
        sizeLimit: number | undefined,
        additionalConstraints: QueryConstraint[] = [],
        startIndex: number = 0,
    ): Promise<DocumentSnapshot[]> {
        this.queue.lastCallback = undefined;
        if (startIndex > 0) {
            await this.queue.add((startAfterItem, update) => {
                const q = this.getQuery(
                    startIndex,
                    additionalConstraints,
                    startAfterItem,
                );

                this.on(
                    "destroy",
                    onSnapshot(
                        q,
                        (snapshot) => {
                            void update([], snapshot.docs);
                        },
                        (err) => {
                            if (
                                err instanceof Error &&
                                err.code === "permission-denied"
                            ) {
                                throw new Error(
                                    `You don't have permission to access ${this.reference?.path}`,
                                );
                            }
                            throw err;
                        },
                    ),
                );
            });
        }

        return this.queue.add((startAfterItem, update) => {
            const q = this.getQuery(sizeLimit, additionalConstraints, startAfterItem);

            this.on(
                "destroy",
                onSnapshot(
                    q,
                    (snapshot) => {
                        const onlyModified = snapshot.docChanges().every((change) => {
                            return change.type === "modified";
                        });
                        if (onlyModified) void update();
                        else {
                            const list = snapshot.docs.map((doc) => {
                                const model = this.transform(doc);

                                return model;
                            });
                            void update(list, snapshot.docs);
                        }
                    },
                    (err) => {
                        if (err instanceof Error && err.code === "permission-denied") {
                            throw new Error(
                                `You don't have permission to access ${this.reference?.path}`,
                            );
                        }
                        throw err;
                    },
                ),
            );
        }, true);
    }

    destroy() {
        this.emit("destroy");
        this.queue.destroy();
    }
}
