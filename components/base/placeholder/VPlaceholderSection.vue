<script setup lang="ts">

</script>

<template>
    <div class="section-placeholder">
        <div class="placeholder-content">
            <slot name="image"></slot>
            <h3 class="dark-inverted">
                <slot name="title"></slot>
            </h3>
            <p>
                <slot name="subtitle"></slot>
            </p>
            <slot name="action"></slot>
        </div>
    </div>
</template>

<style lang="scss">
.section-placeholder {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;

    .placeholder-content {
        text-align: center;

        > img {
            display: block;
            max-width: 280px;
            margin: 0 auto 10px;
        }

        .v-avatar {
            margin: 0 auto 10px;
        }

        h3 {
            font-family: var(--font-alt);
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--dark-text);
        }

        p {
            font-family: var(--font);
            font-size: 1rem;
            color: var(--light-text);
            max-width: 280px;
            margin: 0 auto 12px;
        }

        .button {
            min-width: 140px;
        }
    }
}
</style>
