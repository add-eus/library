import { watch } from "vue";
import type { Directive, DirectiveHook } from "vue";
import { translate } from "../stores/translate";

function updateTranslation(
    translated: string,
    el: HTMLElement,
    component: any,
    modifiers: any
) {
    const modifierKeys = Object.keys(modifiers);
    if (modifierKeys.length > 0) {
        const attributes = modifierKeys.filter((attribute) => {
            return modifiers[attribute];
        });
        attributes.forEach((attribute) => {
            if (component.propsOptions[0].hasOwnProperty(attribute)) {
                component.props[attribute] = translated;
                component.propsOptions[0][attribute][0] = true;
                if (component.propsOptions[1].indexOf(attribute) < 0)
                    component.propsOptions[1].push(attribute);
            } else el.setAttribute(attribute, translated);
        });
    } else {
        el.textContent = translated;
    }
}

const onMounted: DirectiveHook = (el: any, bindings) => {
    const component = el.__vueParentComponent;
    const translated = translate(bindings.value, component);
    component.translationUnwatch = watch(translated, () => {
        updateTranslation(translated.value, el, component, bindings.modifiers);
    });
    updateTranslation(translated.value, el, component, bindings.modifiers);
};

const onUpdated: DirectiveHook = (el: any, bindings) => {
    const component = el.__vueParentComponent;
    const translated = translate(bindings.value, el);
    if (el.translationUnwatch) el.translationUnwatch();
    component.translationUnwatch = watch(translated, () => {
        updateTranslation(translated.value, el, component, bindings.modifiers);
    });
    updateTranslation(translated.value, el, component, bindings.modifiers);
};

const onUnmounted: DirectiveHook = (el: any) => {
    const component = el.__vueParentComponent;
    if (component.translationUnwatch) component.translationUnwatch();
};

const t: Directive = {
    updated: onUpdated,
    mounted: onMounted,
    unmounted: onUnmounted,
};

export default t;
