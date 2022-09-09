import { getCurrentInstance, isRef, Ref, ref, watch, watchEffect } from "vue";
import { acceptHMRUpdate, defineStore } from "pinia";
import { syncRef } from "@vueuse/core";

function parseOptions(options: any | string, values?: any): any {
    if (typeof options == "string")
        options = {
            path: options,
        };

    if (!options.values) options.values = values;

    return options;
}

function transformOptionsFromNamespaces(
    options: any,
    namespacesUnfiltered: string[]
): any {
    const namespaces = namespacesUnfiltered.filter((namespace) => {
        return typeof namespace == "string";
    });

    const newOptions = { ...options };
    if (options.path.startsWith(".")) {
        let finalNamespace = "";
        for (let i = 0; i < namespaces.length; i++) {
            finalNamespace = namespaces[i] + finalNamespace;
            if (!namespaces[i].startsWith(".")) break;
        }
        newOptions.path = finalNamespace + options.path;
    }
    return newOptions;
}

export function translate(options: any, component: any, values?: any) {
    if (isRef(options)) {
        const translated = ref("");
        let stop: Function;
        function update() {
            if (stop) stop();
            const translatedSubRef = translate(options.value, component);
            stop = syncRef(translatedSubRef, translated);
        }
        watch(options, update);
        update();
        return translated;
    }
    const translated = ref("");

    component.scope.run(() => {
        options = parseOptions(options, values);

        const translationNamespaces: string[] = [];

        let parentComponent: any = {
            parent: component,
        };
        let index: number = 0;
        while ((parentComponent = parentComponent.parent)) {
            const currentIndex: number = index;
            if (parentComponent.translationNamespace) {
                translationNamespaces[currentIndex] =
                    parentComponent.translationNamespace.value;
                const currentComponent = parentComponent;
                watch(currentComponent.translationNamespace, () => {
                    if (
                        !currentComponent.translationNamespace ||
                        !currentComponent.translationNamespace.value
                    ) {
                        return;
                    }
                    translationNamespaces[currentIndex] =
                        currentComponent.translationNamespace.value;
                    const transformedOptions = transformOptionsFromNamespaces(
                        options,
                        translationNamespaces
                    );

                    translated.value =
                        component.appContext.app.config.globalProperties.$t(
                            transformedOptions.path
                        );
                });
            }

            index++;
        }

        const transformedOptions = transformOptionsFromNamespaces(
            options,
            translationNamespaces
        );
        translated.value = component.appContext.app.config.globalProperties.$t(
            transformedOptions.path,
            transformedOptions.values
        );
    });

    return translated;
}

export function setTranslateNamespace(path: string | Ref<string>, instance: any) {
    if (isRef(path) && !instance.translationNamespace) {
        instance.translationNamespace = path;
    } else if (!instance.translationNamespace) {
        instance.translationNamespace = ref(path);
    } else instance.translationNamespace.value = path;
}

export const useTranslate = function () {
    const instance = getCurrentInstance();
    return {
        translate(options: any, values?: any) {
            return translate(options, instance, values);
        },
        setTranslateNamespace(path: string) {
            return setTranslateNamespace(path, instance);
        },
    };
};
