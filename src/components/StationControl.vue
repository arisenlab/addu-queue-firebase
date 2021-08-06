<template>
    <Card id="control-layout" class="p-shadow-5">
        <template #content>
            <h1 class="p-text-normal">Current Queue Number</h1>
            <div class="p-d-flex p-jc-center p-m-2">
                <queue-number-card>
                    <span v-if="this.currentlyServing === null">None</span>
                    <span v-else>{{ currentlyServing.num }}</span>
                </queue-number-card>
            </div>
            <div v-if="this.currentlyServing">
                <Button
                    class="btns p-button"
                    :disabled="processing"
                    @click="finishAndCallNext"
                >
                    Call Next Number
                </Button>
                <h5 class="p-text-normal">
                    Finish with current patient and call another number
                </h5>
            </div>
            <div v-else>
                <Button
                    class="btns p-button"
                    :disabled="processing"
                    @click="callNext"
                >
                    Call Next Number
                </Button>
                <h5 class="p-text-normal">Call a number from the queue</h5>
            </div>
            <div v-if="this.currentlyServing">
                <Button
                    class="btns p-button p-button-info"
                    :disabled="processing"
                    @click="finishCurrent"
                >
                    FINISH
                </Button>
                <h5 class="p-text-normal">Finish with current patient</h5>
                <Button
                    class="btns p-button-sm p-button-danger"
                    :disabled="processing"
                    @click="unqueueNumLocal"
                >
                    Send Back
                </Button>
                <h5 class="p-text-normal">
                    Send current patient back to the queue<br />
                    <small class="text-danger"
                        >Only do this when the patient is late or missing</small
                    >
                </h5>
                <Button
                    class="btns p-button-sm p-button-danger"
                    :disabled="processing"
                    @click="rejectNumLocal"
                >
                    Reject
                </Button>
                <h5 class="p-text-normal">
                    Remove current patient from the queue<br />
                    <small class="p-error">
                        Only do this when the patient is not valid for
                        vaccination
                    </small>
                </h5>
            </div>
        </template>
    </Card>
</template>

<script>
import { watch } from "@vue/runtime-core";
import { ref } from "vue";
import { useQueue, useAuth } from "../firebase";
import QueueNumberCard from "./QueueNumberCard";
import Card from "primevue/card";
import Button from "primevue/button";
import { createToast } from "mosha-vue-toastify";

export default {
    name: "StationControl",
    components: { Button, Card, QueueNumberCard },
    props: {
        stationName: {
            type: String,
            required: true,
        },
        stageId: {
            type: Number,
            required: true,
        },
    },
    setup(props) {
        // Hooks
        const {
            callForNextNum,
            finishCurrentNum,
            unqueueNum,
            getQueueNumberByAuth,
            rejectNum,
        } = useQueue();
        const { user } = useAuth();

        // Data
        const currentlyServing = ref(null);
        const processing = ref(false);
        // const mapStage = {
        //   registration: 0,
        //   screening: 2,
        //   vitals: 4,
        //   vaccination: 6,
        // };

        // Methods

        // Finish current queue number
        const finishCurrent = async () => {
            processing.value = true;

            try {
                await finishCurrentNum(currentlyServing.value.id);
                currentlyServing.value = null;
            } catch (err) {
                createToast(
                    {
                        title: "Error",
                        description: err,
                    },
                    {
                        type: "danger",
                        position: "top-center",
                    }
                );
            }
            processing.value = false;
        };

        // Call for the next queue number
        const callNext = async () => {
            //   console.log("CALLING FOR NEXT", props.stageId);
            processing.value = true;

            await callForNextNum(props.stageId)
                .then(queueNum => {
                    currentlyServing.value = queueNum;
                    processing.value = false;
                })
                .catch(err => {
                    createToast(
                        {
                            title: "Error",
                            description: err,
                        },
                        {
                            type: "danger",
                            position: "top-center",
                        }
                    );
                    processing.value = false;
                });
        };

        // Combine finish and calling
        const finishAndCallNext = async () => {
            await finishCurrent();
            await callNext();
        };

        // Unqueue current number
        function unqueueNumLocal() {
            // console.log(currentlyServing.value);
            unqueueNum(currentlyServing.value.id)
                .then(() => {
                    createToast(
                        {
                            title: "Success",
                            description:
                                "Sent #" +
                                currentlyServing.value.num +
                                " to the back of the queue",
                        },
                        {
                            type: "success",
                            position: "top-center",
                        }
                    );
                    currentlyServing.value = null;
                })
                .catch(err =>
                    createToast(
                        {
                            title: "Error",
                            description: err,
                        },
                        {
                            type: "danger",
                            position: "top-center",
                        }
                    )
                );
        }

        function rejectNumLocal() {
            // console.log(currentlyServing.value);
            rejectNum(currentlyServing.value.id)
                .then(() => {
                    createToast(
                        {
                            title: "Success",
                            description:
                                "Rejected #" + currentlyServing.value.num,
                        },
                        {
                            type: "success",
                            position: "top-center",
                        }
                    );
                    currentlyServing.value = null;
                })
                .catch(err =>
                    createToast(
                        {
                            title: "Error",
                            description: err,
                        },
                        {
                            type: "danger",
                            position: "top-center",
                        }
                    )
                );
        }

        processing.value = true;

        watch(
            () => user.value,
            () => {
                getQueueNumberByAuth(user.value.uid)
                    .then(data => {
                        if (data) currentlyServing.value = data;
                        processing.value = false;
                    })
                    .catch(() => {
                        createToast(
                            {
                                title: "Error",
                                description:
                                    "Something went wrong with the loading of the data",
                            },
                            {
                                type: "danger",
                                position: "top-center",
                            }
                        );
                    });
            }
        );

        return {
            currentlyServing,
            finishCurrent,
            callNext,
            processing,
            finishAndCallNext,
            unqueueNumLocal,
            rejectNumLocal,
            getQueueNumberByAuth,
        };
    },
};
</script>

<style>
#control-layout {
    text-align: center;
    width: 95%;
    margin: auto;
}

.btns {
    margin-bottom: 10px !important;
}

#num-card {
    background: #ff9901;
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
    text-align: center;
    border-radius: 10px;
    width: 70%;
}
#num-card h1 {
    font-style: normal;
    font-weight: bold;
    color: #ffffff;
    text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}
</style>
