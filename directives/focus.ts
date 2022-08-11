import type { Directive, DirectiveHook } from "vue";

const onUpdate: DirectiveHook = (el: HTMLElement, bindings) => {
    bindings.prev;
    el.focus();
};

const background: Directive = {
    getSSRProps() {
        return {};
    },
    mounted: onUpdate,
};

export default background;
