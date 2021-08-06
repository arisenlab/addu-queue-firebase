<template>
    <div class="p-d-flex p-flex-column p-ai-center p-mt-5">
        <ProgressSpinner />
    </div>
</template>

<script>
import ProgressSpinner from "primevue/progressspinner";
import { useAuth } from "./../firebase";
export default {
    components: { ProgressSpinner },
    mounted() {
        const { signOut, isLogin } = useAuth();
        if (isLogin) signOut();

        this.$router.push("/signin");
    },
};
</script>

<style></style>
