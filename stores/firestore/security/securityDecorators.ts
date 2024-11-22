interface WriteOperation {
    create?: string;
    update?: string;
    delete?: string;
}

interface ReadOperation {
    get?: string;
    list?: string;
}

interface SecurityOptions extends WriteOperation, ReadOperation {}

export interface SecurityInfo {
    properties?: {
        [key: string]: WriteOperation;
    };
    security?: SecurityOptions;
}

export const securityInfos = new Map<string, SecurityInfo>();
export const securityGroupInfos = new Map<string, SecurityInfo>();
export const rootCollections: string[] = [];
export const securityCollectionCallbacks = new Map<string, (() => void)[]>();
const securityPropertyCallbacks = new Map<string, (() => void)[]>();

export function SecurityEntity(options: SecurityOptions) {
    return function (target: any, propertyKey?: string) {
        // on class
        if (propertyKey === undefined) {
            const init = () => {
                const key = target.collectionName;
                if (securityInfos.has(key)) {
                    throw new Error(`Security already defined for ${key}`);
                }
                securityInfos.set(key, { security: options });
                const callbacks = securityCollectionCallbacks.get(target.name);
                if (callbacks !== undefined) {
                    callbacks.forEach((callback) => {
                        callback();
                    });
                }
                rootCollections.push(key);
            };
            if (target.collectionName === undefined) {
                if (!securityCollectionCallbacks.has(target.name)) {
                    securityCollectionCallbacks.set(target.name, []);
                }
                const callbacks = securityCollectionCallbacks.get(target.name);
                if (callbacks !== undefined) callbacks.push(init);
            } else {
                init();
            }
        } else {
            throw new Error(`SecurityCollection is not allowed on property`);
        }
    };
}
export function SecuritySubCollection(options: SecurityOptions) {
    return function (target: any, propertyKey?: string) {
        // on class
        if (propertyKey === undefined) {
            throw new Error(`SecuritySubCollection is not allowed on class`);
        }
        // on property
        else {
            const init = () => {
                securityInfos.set(`${target.constructor.collectionName}/${propertyKey}`, {
                    security: options,
                });
            };
            if (target.collectionName === undefined) {
                if (!securityPropertyCallbacks.has(target.constructor.name)) {
                    securityPropertyCallbacks.set(target.constructor.name, []);
                }
                const callbacks = securityPropertyCallbacks.get(target.constructor.name);
                if (callbacks !== undefined) callbacks.push(init);
            } else {
                init();
            }
        }
    };
}
export function SecurityCollectionGroup(options: SecurityOptions) {
    return function (target: any, propertyKey?: string) {
        // on class
        if (propertyKey === undefined) {
            throw new Error("SecuritySubCollection is not allowed on class");
        }
        // on property
        else {
            if (securityGroupInfos.has(propertyKey)) {
                throw new Error(
                    `SecurityCollectionGroup already defined for ${propertyKey}`,
                );
            }
            securityGroupInfos.set(propertyKey, {
                security: options,
            });
        }
    };
}
export function SecurityProperty(options: SecurityOptions) {
    return function (target: any, propertyKey?: string) {
        // on class
        if (propertyKey === undefined) {
            throw new Error(`Security is not allowed on class`);
        }
        // on property
        else {
            const init = () => {
                const notAllowed: string[] = [];
                if (options.list !== undefined) {
                    notAllowed.push("list");
                }
                if (options.get !== undefined) {
                    notAllowed.push("get");
                }
                if (notAllowed.length > 0) {
                    throw new Error(
                        `Security ${notAllowed.join(", ")} is not allowed on property`,
                    );
                }
                const securityInfo = securityInfos.get(target.constructor.collectionName);
                if (securityInfo === undefined) {
                    throw new Error(
                        `Security is not defined on ${target.constructor.collectionName}`,
                    );
                }
                securityInfo.properties = securityInfo.properties ?? {};
                securityInfo.properties[propertyKey] = options;
            };
            if (target.collectionName === undefined) {
                if (!securityPropertyCallbacks.has(target.constructor.name)) {
                    securityPropertyCallbacks.set(target.constructor.name, []);
                }
                const callbacks = securityPropertyCallbacks.get(target.constructor.name);
                if (callbacks !== undefined) callbacks.push(init);
            } else {
                init();
            }
        }
    };
}
