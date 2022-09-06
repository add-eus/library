import { watch } from "vue";
import type { Directive, DirectiveHook } from "vue";
import { useI18n } from "vue-i18n";

function updateTranslation(options: any | string, namespaces: string[], el): void {
    let path;
    if (typeof options == "string") {
        path = options;
        options = {};
    } else path = options.path;

    if (path.startsWith(".")) {
        let finalNamespace = "";
        for (let i = 0; i < namespaces.length; i++) {
            const namespace = namespaces[i];
            finalNamespace = namespace + finalNamespace;
            if (!namespace.startsWith(".")) break;
        }
        path = finalNamespace + path;
    }

    const { t } = useI18n();
    const translated = t(path);
    el.textContent = translated;
    console.log(options, namespaces, path);
}

const onMounted: DirectiveHook = (el: any, bindings) => {
    const component = el.__vueParentComponent;
    component.translationNamespaces = [];

    let parentComponent = component;
    let index: number = 0;
    while ((parentComponent = parentComponent.parent)) {
        if (parentComponent.translationNamespace) {
            const currentIndex: number = index;
            component.translationNamespaces[currentIndex] =
                parentComponent.translationNamespace.value;
            watch(parentComponent.translationNamespace, () => {
                component.translationNamespaces[currentIndex] =
                    parentComponent.translationNamespace.value;
                updateTranslation(bindings.value, component.translationNamespaces, el);
            });
            index++;
        }
    }
    console.log(component);
    updateTranslation(bindings.value, component.translationNamespaces, el);
};

const onUpdated: DirectiveHook = (el: any, bindings) => {
    const component = el.__vueParentComponent;
    updateTranslation(bindings.value, component.translationNamespaces, el);
};

const t: Directive = {
    updated: onUpdated,
    mounted: onMounted,
};

export default t;
