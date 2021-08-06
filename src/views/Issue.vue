<template>
    <div class="p-d-flex p-jc-center">
        <div class="p-d-flex p-flex-column p-ai-center">
            <h1 style="font-size:3rem">Issue a Number</h1>
            <Button
                label="Issue No."
                @click="issueQueueNumLocal"
                :disabled="processing"
            />
            <div
                class="p-d-flex p-flex-column p-ai-center mt-2"
                v-if="previousQueueNum"
            >
                <h3 class="p-my-3 lead">You just issued</h3>

                <queue-number-card>{{ previousQueueNum }}</queue-number-card>
            </div>
        </div>
    </div>
</template>

<script>
// import { ref, watch, nextTick } from "vue";
import { ref } from "vue";
import { useQueue } from "../firebase";
import Button from "primevue/button";
import QueueNumberCard from "../components/QueueNumberCard.vue";

export default {
    name: "Registration",
    components: {
        Button,
        QueueNumberCard,
    },
    setup() {
        const { queueItems, issueQueueNum } = useQueue();
        const processing = ref(false);
        const previousQueueNum = ref(null);

        const issueQueueNumLocal = () => {
            processing.value = true;
            issueQueueNum().then(val => {
                // console.log(val);
                processing.value = false;
                previousQueueNum.value = val;
                // setTimeout(() => {
                //   previousQueueNum.value = null;
                // }, 2000);
            });
        };

        return {
            queueItems,
            issueQueueNumLocal,
            previousQueueNum,
            processing,
        };
    },
};
</script>
<style></style>
