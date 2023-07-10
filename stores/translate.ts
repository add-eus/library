import type { Ref } from "vue";
import { getCurrentInstance, isRef, ref, watch } from "vue";
import { resolveUnref, syncRef } from "@vueuse/core";

function parseOptions(options: any | string, values?: any): any {
    if (typeof options === "string")
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
        return typeof namespace === "string";
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
            const translatedSubRef = translate(options.value, component, values);
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
        let transformedOptions;

        function translateInScope() {
            try {
                const unrefValues = resolveUnref(options.values);

                translated.value = component.appContext.app.config.globalProperties.$t(
                    transformedOptions.path,
                    unrefValues
                );
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
            }
        }
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
                    transformedOptions = transformOptionsFromNamespaces(
                        options,
                        translationNamespaces
                    );

                    translateInScope();
                });
            }

            index++;
        }

        transformedOptions = transformOptionsFromNamespaces(
            options,
            translationNamespaces
        );

        translateInScope();

        watch(
            () => options.values,
            () => {
                translateInScope();
            },
            { deep: true }
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
