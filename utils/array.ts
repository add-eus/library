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
    return move(arr, fromIndex, fromIndex + 1);
}

export function moveDown(arr, fromIndex) {
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

/**
 * Helper to produce an array of enum values.
 * @param enumeration Enumeration object.
 */
export function enumToObject(enumeration: any): { [name: string]: number } {
    const object = {};
    Object.keys(enumeration)
        .filter((key) => !Number.isInteger(Number(key)))
        .forEach((key) => (object[key] = enumeration[key]));
    return object;
}

export function isEnum(enumeration: any) {
    if (typeof enumeration !== "object" || Array.isArray(enumeration)) {
        return false;
    }
    const keys = Object.keys(enumeration);
    if (keys.length === 0) {
        return false;
    }
    if (!isNaN(Number(keys[0]))) {
        return enumeration[Number(keys[0])] != undefined;
    } else if (typeof keys[0] === "string") {
        return enumeration[keys[0]] != undefined;
    }
    return false;
}

export function deduplicate<T>(array: T[]): T[] {
    return [...new Set(array)];
}
