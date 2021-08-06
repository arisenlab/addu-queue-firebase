<template>
    <Card class="issue-card p-m-2">
        <template #content>
            <h4 class="p-text-normal">Queue Number</h4>
            <div style="font-size: 4rem"><slot /></div>
        </template>
    </Card>
</template>

<script>
import Card from "primevue/card";
export default {
    components: {
        Card,
    },
};
</script>

<style scoped>
.issue-card {
    text-align: center;
    min-width: 50vw;
    background-color: var(--primary-color);
    color: white;
}
</style>
