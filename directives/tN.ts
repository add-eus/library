import { Directive, DirectiveHook, ref } from "vue";

const setNamespace: DirectiveHook = function (el: any, bindings) {
    if (!el.__vueParentComponent.translationNamespace)
        el.__vueParentComponent.translationNamespace = ref(bindings.value);
    else el.__vueParentComponent.translationNamespace.value = bindings.value;
};

const tN: Directive = {
    updated: setNamespace,
    beforeMount: setNamespace,
};

export default tN;
