import type { Directive, DirectiveHook } from "vue";
import { waitForElementHidden, waitForElementVisible } from "../utils/observer";
import { isVisible } from "../utils/element";

function onVisible(el, vNode, removedNodes = []) {
    el.childNodes.forEach((child) => {
        const removedNode = removedNodes.find(
            (rNode) => rNode[1] == child || rNode[0] == child
        );

        if (removedNode && removedNode[0] == child)
            el.replaceChild(removedNode[1], child);
    });

    if (!vNode.unmounted)
        waitForElementHidden(el).then(() => onHidden(el, vNode, removedNodes));
}

function onHidden(el, vNode, removedNodes = []) {
    el.childNodes.forEach((child) => {
        let removedNode = removedNodes.find(
            (rNode) => rNode[1] == child || rNode[0] == child
        );
        if (!removedNode) {
            removedNode = [document.createComment(" "), child];
            removedNodes.push(removedNode);
        }
        if (removedNode[1] == child) el.replaceChild(removedNode[0], child);
    });
    if (!vNode.unmounted)
        waitForElementVisible(el).then(() => onVisible(el, vNode, removedNodes));
}
const onUpdate: DirectiveHook = (el: HTMLElement, bindings, vNode) => {
    if (bindings.value) {
        if (isVisible(el)) onVisible(el, vNode);
        else onHidden(el, vNode);
    }
};

const hideOnHidden: Directive = {
    getSSRProps() {
        return {};
    },
    //updated: onUpdate,
    mounted: onUpdate,
    unmounted(el, vNode) {
        vNode.unmounted = true;
    },
};

export default hideOnHidden;
