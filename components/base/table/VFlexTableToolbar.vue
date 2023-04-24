<template>
    <div class="flex-table-toolbar">
        <div class="left"><slot name="left"></slot></div>
        <div class="right"><slot name="right"></slot></div>
    </div>
</template>

<style lang="scss">
.flex-table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40px;

    .left {
        flex-grow: 1;
    }

    .right {
        flex-grow: 1;
        text-align: right;
    }
}
@media (max-width: 767px) {
    .flex-table-toolbar {
        margin-bottom: 10px;
        flex-direction: column;
        align-items: stretch;

        .left {
            //flex-grow: 2;
        }

        .right {
            //display: none;
        }
    }
}
</style>
