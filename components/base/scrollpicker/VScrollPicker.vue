<script lang="ts">
import type { PropType, VNode } from "vue";
import { defineComponent, h, renderSlot } from "vue";
import type { Colors } from "../../../stores/color";
import { useColor } from "../../../stores/color";

function debounce<TFunc extends Function>(handle: TFunc, delay = 83): TFunc {
    // eslint-disable-line @typescript-eslint/ban-types
    let timeout = null as any;
    return function (this: any) {
        if (timeout !== null) {
            clearTimeout(timeout);
            timeout = null;
        }
        const self = this; // eslint-disable-line no-invalid-this,@typescript-eslint/no-this-alias
        const args = arguments; // eslint-disable-line prefer-rest-params
        timeout = setTimeout(() => handle.apply(self, args), delay);
    } as any as TFunc;
}

function getBoundingClientCenterY(elem: HTMLElement) {
    const { top, bottom } = elem.getBoundingClientRect();
    return (top + bottom) / 2;
}

function normalizeOptions(options: ScrollPickerOptionable[]): ScrollPickerOption[] {
    return options.map((option) => {
        switch (typeof option) {
            case "string": {
                return { value: option, name: option };
            }
            case "number":
            case "boolean": {
                return { value: option, name: `${option}` };
            }
        }
        return option;
    });
}

function isTouchEvent(event: any): event is TouchEvent {
    return event.changedTouches !== undefined ? event.changedTouches : event.touches;
}

function getEventXY(event: TouchEvent | MouseEvent): {
    clientX: number;
    clientY: number;
} {
    if (isTouchEvent(event)) {
        return event.changedTouches[0] !== undefined
            ? event.changedTouches[0]
            : event.touches[0];
    }
    return event;
}

type MouseWheelEvent = MouseEvent & { deltaY: number };

export interface ScrollPickerOption {
    name: string;
    value: any;
}

export type ScrollPickerOptionable = string | number | boolean | ScrollPickerOption;

export default defineComponent({
    props: {
        modelValue: {
            type: [String, Number, Boolean, Object, Array],
            default: null,
        },
        label: {
            type: String,
            default: "",
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        options: {
            type: Array as PropType<ScrollPickerOptionable[]>,
            default: () => [],
        },
        dragSensitivity: {
            type: Number,
            default: 1.7,
        },
        touchSensitivity: {
            type: Number,
            default: 1.7,
        },
        scrollSensitivity: {
            type: Number,
            default: 1,
        },
        empty: {
            type: String,
            default: "No Items",
        },
        placeholder: {
            type: String,
            default: null,
        },
        color: {
            type: String as PropType<Colors>,
            default: "primary",
        },
        horizontal: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["update:modelValue"],
    data() {
        const internalOptions = normalizeOptions(this.options);

        let internalIndex = internalOptions.findIndex(
            (option) => option.value === this.modelValue
        );
        if (
            internalIndex === -1 &&
            !this.placeholder &&
            !this.$slots.placeholder &&
            this.options.length > 0
        ) {
            internalIndex = 0;
        }
        const internalValue = internalOptions[internalIndex]?.value ?? null;

        return {
            refItems: [] as HTMLDivElement[],
            colorValue: useColor(this.color).value,
            internalOptions,
            internalIndex,
            internalValue,

            pivots: [] as number[],
            pivotsMin: 0,
            pivotsMax: 0,

            scroll: null as number | null,
            scrollOffsetTop: 0,
            scrollMin: 0,
            scrollMax: 0,

            transitioning: false,
            transitionTimer: null as any | null,

            start: null as [scroll: number, clientY: number] | null,

            isMouseDown: false,
            isDragging: false,
        };
    },
    computed: {
        hasPlaceholder(): boolean {
            return !!(this.placeholder || this.$slots.placeholder);
        },
    },
    watch: {
        modelValue(value: any) {
            if ((value === null || value === undefined) && this.hasPlaceholder) {
                this.correction(-1);
                return;
            }

            const nextInternalIndex = this.internalOptions.findIndex(
                (option) => option.value === value
            );
            if (nextInternalIndex === -1) {
                this.$emit("update:modelValue", this.internalValue);
                return;
            }

            if (this.internalIndex !== nextInternalIndex) {
                this.correction(nextInternalIndex);
            }
        },
        options: {
            handler(options: ScrollPickerOptionable[]) {
                const internalOptions = (this.internalOptions =
                    normalizeOptions(options));

                let internalIndex = internalOptions.findIndex(
                    (option) => option.value === this.modelValue
                );
                if (
                    internalIndex === -1 &&
                    !this.hasPlaceholder &&
                    this.options.length > 0
                ) {
                    internalIndex = 0;
                }
                const internalValue = internalOptions[internalIndex]?.value ?? null;

                void this.$nextTick(() => {
                    void this.calculatePivots();
                    this.scroll = this.findScrollByIndex(internalIndex);
                    this.internalIndex = internalIndex;
                    if (this.internalValue !== internalValue) {
                        this.$emit(
                            "update:modelValue",
                            (this.internalValue = internalValue)
                        );
                    }
                });
            },
            deep: true,
        },
        color(value) {
            this.colorValue = useColor(value).value;
        },
    },
    beforeUpdate() {
        this.refItems = [];
    },
    mounted() {
        this.calculatePivots();
        this.scroll = this.findScrollByIndex(this.internalIndex);
        if (this.internalValue !== this.modelValue) {
            this.$emit("update:modelValue", this.internalValue);
        }

        const $el = this.$el as HTMLDivElement;

        $el.addEventListener("touchstart", this.onStart);
        $el.addEventListener("touchmove", this.onMove);
        $el.addEventListener("touchend", this.onEnd);
        $el.addEventListener("touchcancel", this.onCancel);

        $el.addEventListener("mousewheel", this.onWheel as any);
        $el.addEventListener("DOMMouseScroll", this.onWheel as any);
        $el.addEventListener("wheel", this.onWheel);
        $el.addEventListener("mousedown", this.onStart);
        $el.addEventListener("mousemove", this.onMove);
        $el.addEventListener("mouseup", this.onEnd);
        $el.addEventListener("mouseleave", this.onCancel);
    },
    beforeUnmount() {
        const $el = this.$el as HTMLDivElement;

        $el.removeEventListener("touchstart", this.onStart);
        $el.removeEventListener("touchmove", this.onMove);
        $el.removeEventListener("touchend", this.onEnd);
        $el.removeEventListener("touchcancel", this.onCancel);

        $el.removeEventListener("mousewheel", this.onWheel as any);
        $el.removeEventListener("DOMMouseScroll", this.onWheel as any);
        $el.removeEventListener("wheel", this.onWheel);
        $el.removeEventListener("mousedown", this.onStart);
        $el.removeEventListener("mousemove", this.onMove);
        $el.removeEventListener("mouseup", this.onEnd);
        $el.removeEventListener("mouseleave", this.onCancel);
    },
    methods: {
        setRefItem(el: HTMLDivElement) {
            if (this.disabled) return;
            this.refItems.push(el);
        },
        resize() {
            void this.$nextTick(() => {
                this.calculatePivots();
                this.scroll = this.findScrollByIndex(this.internalIndex);
            });
        },
        calculatePivots() {
            const $rotator = this.$refs.rotator as HTMLDivElement;
            const $layerSelection = this.$refs.layerSelection as HTMLDivElement;

            const rotatorTop = $rotator.getBoundingClientRect().top;
            const pivots = (this.pivots = this.refItems
                .map((item) => getBoundingClientCenterY(item) - rotatorTop)
                .sort((a, b) => a - b));
            const pivotsMin = (this.pivotsMin = Math.min(...pivots));
            const pivotsMax = (this.pivotsMax = Math.max(...pivots));

            const scrollOffsetTop = (this.scrollOffsetTop =
                $layerSelection.offsetTop + $layerSelection.offsetHeight / 2);

            this.scrollMin = scrollOffsetTop - pivotsMin;
            this.scrollMax = scrollOffsetTop - pivotsMax;
        },
        sanitizeInternalIndex(index: number): number {
            return Math.min(
                Math.max(index, this.hasPlaceholder ? -1 : 0),
                this.internalOptions.length - 1
            );
        },
        findIndexFromScroll(scroll: number): number {
            let prevDiff = null as number | null;
            let pivotIndex = 0;
            this.pivots.forEach((pivot, i) => {
                const diff = pivot + scroll - this.scrollOffsetTop;
                if (prevDiff === null || Math.abs(prevDiff) > Math.abs(diff)) {
                    pivotIndex = i;
                    prevDiff = diff;
                }
            });
            if (this.hasPlaceholder || this.options.length === 0) {
                return pivotIndex - 1;
            }
            return pivotIndex;
        },
        findScrollByIndex(index: number): number {
            let pivotIndex = index;
            if (this.hasPlaceholder || this.options.length === 0) {
                pivotIndex++;
            }
            if (index > -1 && pivotIndex in this.pivots) {
                return this.scrollOffsetTop - this.pivots[pivotIndex];
            }
            if (index >= this.pivots.length) {
                return this.scrollOffsetTop - this.pivotsMax;
            }
            return this.scrollOffsetTop - this.pivotsMin;
        },
        onWheel(event: MouseWheelEvent) {
            if (this.disabled) return;
            if (this.scroll! >= this.scrollMin && event.deltaY < 0) {
                return;
            }
            if (this.scroll! <= this.scrollMax && event.deltaY > 0) {
                return;
            }
            if (this.pivots.length === 1) {
                return;
            }

            event.preventDefault();

            const nextDirInternalIndex = this.sanitizeInternalIndex(
                this.internalIndex + (event.deltaY > 0 ? 1 : -1)
            );
            const deltaMax =
                event.deltaY > 0
                    ? this.findScrollByIndex(nextDirInternalIndex - 1) -
                      this.findScrollByIndex(nextDirInternalIndex)
                    : this.findScrollByIndex(nextDirInternalIndex) -
                      this.findScrollByIndex(nextDirInternalIndex + 1);

            const deltaY = Math.max(Math.min(event.deltaY, deltaMax), deltaMax * -1);

            this.scroll = Math.min(
                Math.max(this.scroll! - deltaY * this.scrollSensitivity, this.scrollMax),
                this.scrollMin
            );

            const nextInternalIndex = this.sanitizeInternalIndex(
                this.findIndexFromScroll(this.scroll)
            );
            const nextInternalValue =
                this.internalOptions[nextInternalIndex]?.value ?? null;

            this.internalIndex = nextInternalIndex;
            if (this.internalValue !== nextInternalValue) {
                this.$emit("update:modelValue", (this.internalValue = nextInternalValue));
            }

            this.onAfterWheel(() => {
                this.correction(this.findIndexFromScroll(this.scroll!));
            });
        },
        onAfterWheel: debounce((handler: () => void) => {
            handler();
        }, 200),
        onStart(event: TouchEvent | MouseEvent) {
            if (this.disabled) return;
            if (event.cancelable) {
                event.preventDefault();
            }

            const { clientY } = getEventXY(event);
            this.start = [this.scroll!, clientY];
            if (!isTouchEvent(event)) {
                this.isMouseDown = true;
            }
            this.isDragging = false;
        },
        onMove(event: TouchEvent | MouseEvent) {
            if (event.cancelable) {
                event.preventDefault();
            }
            if (!this.start) {
                return;
            }
            const { clientY } = getEventXY(event);
            const diff = clientY - this.start[1];
            if (Math.abs(diff) > 1.5) {
                this.isDragging = true;
            }
            this.scroll =
                this.start[0] +
                diff *
                    (isTouchEvent(event) ? this.touchSensitivity : this.dragSensitivity);
        },
        onEnd(event: TouchEvent | MouseEvent) {
            if (event.cancelable) {
                event.preventDefault();
            }
            if (this.isDragging) {
                this.correction(this.findIndexFromScroll(this.scroll!));
            } else if (this.isMouseDown) {
                this.onClick(event);
            }
            this.start = null;
            this.isDragging = false;
            this.isMouseDown = false;
        },
        onCancel(event: TouchEvent | MouseEvent) {
            if (event.cancelable) {
                event.preventDefault();
            }
            this.correction(this.findIndexFromScroll(this.scroll!));
            this.start = null;
            this.isMouseDown = false;
            this.isDragging = false;
        },
        onClick(event: TouchEvent | MouseEvent) {
            if (this.disabled) return;
            const $layerTop = this.$refs.layerTop as HTMLDivElement;
            const $layerBottom = this.$refs.layerBottom as HTMLDivElement;
            const touchInfo = getEventXY(event);
            const x = touchInfo.clientX;
            const y = touchInfo.clientY;
            const topRect = $layerTop.getBoundingClientRect();
            const bottomRect = $layerBottom.getBoundingClientRect();

            if (
                topRect.left <= x &&
                x <= topRect.right &&
                topRect.top <= y &&
                y <= topRect.bottom
            ) {
                this.correction(this.internalIndex - 1);
            } else if (
                bottomRect.left <= x &&
                x <= bottomRect.right &&
                bottomRect.top <= y &&
                y <= bottomRect.bottom
            ) {
                this.correction(this.internalIndex + 1);
            }
        },
        correction(index: number) {
            const nextInternalIndex = this.sanitizeInternalIndex(index);
            const nextInternalValue =
                this.internalOptions[nextInternalIndex]?.value ?? null;
            this.scroll = this.findScrollByIndex(nextInternalIndex);

            this.transitioning = true;
            if (this.transitionTimer !== null) {
                clearTimeout(this.transitionTimer);
                this.transitionTimer = null;
            }

            this.transitionTimer = setTimeout(() => {
                this.transitioning = false;
                this.transitionTimer = null;

                this.internalIndex = nextInternalIndex;
                if (this.internalValue !== nextInternalValue) {
                    this.$emit(
                        "update:modelValue",
                        (this.internalValue = nextInternalValue)
                    );
                }
            }, 100);
        },
    },
    render() {
        let nodes = [] as VNode[];
        if (this.hasPlaceholder) {
            nodes.push(
                h(
                    "div",
                    {
                        class: [
                            "vue-scroll-picker-item",
                            "vue-scroll-picker-item-placeholder",

                            {
                                "vue-scroll-picker-item-selected":
                                    this.internalIndex === -1,
                            },
                        ],
                        ref: (el) => el && this.setRefItem(el as HTMLDivElement),
                    },
                    renderSlot(
                        this.$slots,
                        "placeholder",
                        { text: this.placeholder },
                        () => [this.placeholder]
                    )
                )
            );
        } else if (this.internalOptions.length === 0) {
            nodes.push(
                h(
                    "div",
                    {
                        class: [
                            "vue-scroll-picker-item",
                            "vue-scroll-picker-item-empty",
                            "vue-scroll-picker-item-selected",
                        ],
                        ref: (el) => el && this.setRefItem(el as HTMLDivElement),
                    },
                    renderSlot(this.$slots, "empty", { text: this.empty }, () => [
                        this.empty,
                    ])
                )
            );
        }

        nodes = nodes.concat(
            this.internalOptions.map((option, index) => {
                /* const indexCursor = this.internalOptions.length / 2 - index;
                const indexPos = indexCursor / this.internalOptions.length;
                const ratio = 1 - Math.abs(indexPos - step);*/
                return h(
                    "div",
                    {
                        class: [
                            "vue-scroll-picker-item",
                            {
                                "vue-scroll-picker-item-selected":
                                    this.internalIndex === index,
                            },
                        ],
                        key: option.value,
                        ref: (el) => el && this.setRefItem(el as HTMLDivElement),
                        style:
                            typeof this.scroll === "number"
                                ? {
                                      // transform: `scale(${ratio})`,
                                  }
                                : {},
                    },
                    renderSlot(this.$slots, "default", { option }, () => [option.name])
                );
            })
        );
        return h(
            "div",
            {
                class: [
                    "vue-scroll-picker",
                    {
                        "vue-scroll-picker-horizontal": this.horizontal,
                    },
                ],
            },
            [
                h(
                    "div",
                    {
                        ref: "rotator",
                        class: [
                            "vue-scroll-picker-rotator",
                            {
                                "vue-scroll-picker-rotator-transition":
                                    this.transitioning,
                            },
                        ],
                        style:
                            typeof this.scroll === "number"
                                ? {
                                      transform: `translateY(${this.scroll}px)`,
                                  }
                                : {},
                    },
                    nodes
                ),
                h("div", { class: ["vue-scroll-picker-layer"] }, [
                    h("div", { class: ["vue-scroll-picker-layer-top"], ref: "layerTop" }),
                    h("div", {
                        class: ["vue-scroll-picker-layer-selection"],
                        ref: "layerSelection",
                    }),
                    h("div", {
                        class: ["vue-scroll-picker-layer-bottom"],
                        ref: "layerBottom",
                    }),
                ]),
                h(
                    "label",
                    {
                        class: "label",
                    },
                    this.label
                ),
            ]
        );
    },
});
</script>

<style lang="scss">
@import "bulma/sass/utilities/_all";

.vue-scroll-picker {
    position: relative;
    width: 100%;
    height: 10em;
    overflow: hidden;

    &.vue-scroll-picker-horizontal {
        height: 100%;
        width: 10em;

        .vue-scroll-picker-rotator {
            top: 0;
            bottom: 0;
            left: 0;
        }

        .vue-scroll-picker-layer-top {
            left: 0;
            top: inherit;
            width: calc(50% - 1em);
            height: auto;
        }

        .vue-scroll-picker-layer-selection {
            top: initial;
            bottom: initial;
            left: calc(50% - 1em);
            right: calc(50% - 1em);
        }

        .vue-scroll-picker-layer-bottom {
            right: 0;
            width: calc(50% - 1em);
        }
    }
}

.vue-scroll-picker-rotator {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
}

.vue-scroll-picker-rotator-transition {
    transition: transform ease 200ms;
}

.vue-scroll-picker-item {
    text-align: center;
    line-height: 2em;
    color: #333;
}

.vue-scroll-picker-item-selected {
    color: #007bff;
}

.vue-scroll-picker-item-empty,
.vue-scroll-picker-item-placeholder {
    color: #aaa;
}

.vue-scroll-picker-item-empty.vue-scroll-picker-item-selected,
.vue-scroll-picker-item-placeholder.vue-scroll-picker-item-selected {
    color: #777;
}

.vue-scroll-picker-layer {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
}

.vue-scroll-picker-layer-top,
.vue-scroll-picker-layer-selection,
.vue-scroll-picker-layer-bottom {
    position: absolute;
    left: 0;
    right: 0;
}

.vue-scroll-picker-layer-top {
    box-sizing: border-box;
    background: linear-gradient(180deg, #fff 10%, rgb(255 255 255 / 70%));
    top: 0;
    height: calc(50% - 1em);
    cursor: pointer;
}

.vue-scroll-picker-layer-selection {
    top: calc(50% - 1em);
    bottom: calc(50% - 1em);
}

.vue-scroll-picker-layer-bottom {
    background: linear-gradient(0deg, #fff 10%, rgb(255 255 255/ 70%));
    bottom: 0;
    height: calc(50% - 1em);
    cursor: pointer;
}

.vue-scroll-picker {
    label {
        color: var(--light-text);
        font-size: 0.9rem;
        font-family: $family-sans-serif;
        font-weight: 700;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        text-align: center;
    }

    .vue-scroll-picker-rotator {
        &:not(.handling) {
            //transition: transform 3s ease-in-out;
        }

        .vue-scroll-picker-item {
            color: var(--dark);
            font-size: 1rem;
        }

        .vue-scroll-picker-item.vue-scroll-picker-item-selected {
            color: $primary;
        }
    }

    .vue-scroll-picker-layer {
        .vue-scroll-picker-layer-top {
            border: none;
            background: linear-gradient(180deg, var(--white) 40%, rgb(255 255 255 / 0%));
        }

        .vue-scroll-picker-layer-bottom {
            border: none;
            background: linear-gradient(0deg, var(--white) 40%, rgb(255 255 255 / 0%));
        }
    }
}

.is-dark {
    .vue-scroll-picker {
        color: $white;

        .vue-scroll-picker-rotator {
            .vue-scroll-picker-item {
                color: $white;
            }

            .vue-scroll-picker-item.vue-scroll-picker-item-selected {
                color: $primary;
            }
        }

        .vue-scroll-picker-layer {
            //box-shadow: inset 0 0 5px 20px var(--dark-sidebar-light-6);

            .vue-scroll-picker-layer-top {
                background: linear-gradient(
                    180deg,
                    var(--dark-sidebar-light-6) 40%,
                    rgb(255 255 255 / 0%)
                );
            }

            .vue-scroll-picker-layer-bottom {
                background: linear-gradient(
                    0deg,
                    var(--dark-sidebar-light-6) 40%,
                    rgb(255 255 255 / 0%)
                );
            }
        }
    }
}

.vue-scroll-picker-group {
    display: flex;

    > .vue-scroll-picker {
        > .vue-scroll-picker-layer {
            .vue-scroll-picker-layer-selection {
                border-top: 1px solid #b5b5b5;
                border-bottom: 1px solid #b5b5b5;
            }
        }
    }

    > .vue-scroll-picker:first-child {
        > .vue-scroll-picker-layer {
            .vue-scroll-picker-layer-selection {
                border-left: 1px solid #b5b5b5;
                border-radius: 20px 0 0 20px;
            }
        }
    }

    > .vue-scroll-picker:last-child {
        > .vue-scroll-picker-layer {
            .vue-scroll-picker-layer-selection {
                border-right: 1px solid #b5b5b5;
                border-radius: 0 20px 20px 0;
            }
        }
    }
}
</style>
