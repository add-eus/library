<script lang="ts">
import { ref, h, InjectionKey, defineComponent, provide, computed } from "vue";
import VFlex from "../flex/VFlex.vue";

export interface TabletLayoutWrapperInjection {
    pages?: [];
}

export const tabletLayoutWrapperSymbol: InjectionKey<TabletLayoutInjection> = Symbol();

export default defineComponent({
    props: {
        open: () => {
            return {};
        },
    },
    setup(props, context) {
        const pages: { [key: string]: any } = {};
        const minFlexGrow = ref(100);

        function fillGrow() {
            const valuePages = Object.values(pages);
            const openPages = valuePages.filter((page) => {
                console.log(page);
                return page.isOpen.value;
            });
            const grow = 100 / openPages.length;

            openPages.forEach((page) => {
                page.flexGrow.value = grow;
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

        return () => {
            const slotContent = context.slots.default?.({ open: () => {} });

            return h(VFlex, { flexDirection: "row" }, slotContent);
        };
    },
});
</script>