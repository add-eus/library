import {} from "./entity";

export function Input(type: string, options: any = {}) {
    return function (target: any, name: string) {
        /*setPropertyMetadata(target, name, "input", {
            type,
            options,
        });*/
    };
}
