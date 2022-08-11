export function debouncePromise(callable) {
    let recall = 0;
    return async (...args) => {
        const startRecall = ++recall;
        const result = await callable(...args);

        if (recall != startRecall) {
            throw new Error("cancelled");
        }
        return result;
    };
}
