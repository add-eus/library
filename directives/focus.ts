import type { Directive, DirectiveHook } from "vue";

const onUpdate: DirectiveHook = (el: HTMLElement) => {
    el.focus();
};

const background: Directive = {
    getSSRProps() {
        return {};
    },
    mounted: onUpdate,
};

export default background;
