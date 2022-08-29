<script lang="ts">
import { ref, h, InjectionKey, defineComponent, provide, computed, watch } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import VFlex from "../flex/VFlex.vue";
import VueScrollTo from "vue-scrollto";

console.log(breakpointsTailwind);

export interface TabletLayoutWrapperInjection {
    pages?: [];
}

export const tabletLayoutWrapperSymbol: InjectionKey<TabletLayoutWrapperInjection> =
    Symbol();

export default defineComponent({
    props: {
        open: () => {
            return {};
        },
    },
    setup(props, context) {
        const breakpoints = useBreakpoints(breakpointsTailwind);
        const isSmallerLG = breakpoints.smaller("xl");
        const pages: { [key: string]: any } = {};
        const minFlexGrow = ref(100);

        function fillGrow() {
            const valuePages = Object.values(pages);
            const openPages = valuePages.filter((page) => {
                return page.isOpen.value;
            });
            const grow = 100 / openPages.length;

            openPages.forEach((page, index) => {
                page.flexGrow.value = grow;
                if (page.$el.value && openPages.length - 1 == index) {
                    VueScrollTo.scrollTo(page.$el.value.$el, 300);
                }
            });
            valuePages.forEach((page) => {
                if (openPages.indexOf(page) < 0) page.flexGrow.value = 0;
            });
        }
        provide(tabletLayoutWrapperSymbol, {
            open: (name: string) => {
                if (!pages[name]) return;
                pages[name].isOpen.value = true;
                fillGrow();
            },
            close: (name: string) => {
                let page = name;
                if (typeof name == "string") {
                    page = pages[name];
                }
                page.isOpen.value = false;
                fillGrow();
            },
            closeOtherThan: (page: any) => {
                const valuePages = Object.values(pages);
                valuePages.forEach((valuePage) => {
                    if (valuePage != page) valuePage.isOpen.value = false;
                });
                fillGrow();
            },
            addPage: (name = "default", page: any) => {
                if (pages[name]) throw new Error(`Page with name ${name} already exists`);
                pages[name] = page;
                if (Object.keys(pages).length == 1) {
                    page.isOpen.value = true;
                    fillGrow();
                }
            },
            fillGrow,
            minFlexGrow,
        });
        const flexDirection = computed(() => {
            return isSmallerLG.value ? "column" : "row";
        });

        watch(flexDirection, fillGrow);

        return () => {
            const slotContent = context.slots.default?.();

            return h(
                VFlex,
                {
                    flexDirection: flexDirection.value,
                },
                slotContent
            );
        };
    },
});
</script>