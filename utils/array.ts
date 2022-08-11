export function move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        let k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
}

export function moveUp(arr, fromIndex) {
    console.log("moveUp", arr[fromIndex], arr, fromIndex);
    return move(arr, fromIndex, fromIndex + 1);
}

export function moveDown(arr, fromIndex) {
    console.log("moveDown", arr[fromIndex], arr, fromIndex);
    return move(arr, fromIndex, fromIndex - 1);
}

/**
 * Helper to produce an array of enum values.
 * @param enumeration Enumeration object.
 */
export function enumToArray<T>(enumeration: T): T[] {
    return Object.keys(enumeration)
        .filter((key) => Number.isInteger(Number(key)))
        .map((key) => enumeration[key])
        .filter((val) => typeof val === "number" || typeof val === "string");
}

export function enumToObject<T>(enumeration: T, callback: (val: T) => void): T {
    const keys = enumToArray(enumeration);
    const output = {};
    keys.forEach((key) => (output[key] = callback(key)));
    return output;
}
