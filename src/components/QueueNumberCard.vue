<template>
  <Card class="issue-card p-m-2">
    <template #content>
      <div class="p-text-light p-mb-3" style="font-size: 3rem">
        Current Queue Number
      </div>
      <div style="font-size: 5rem"><slot /></div>
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
