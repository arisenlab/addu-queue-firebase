<template>
    <div class="root p-grid">
        <!-- Number of People In Vitals -->
        <Card class="p-col-12">
            <template #title>
                <span class="p-text-light"
                    >Number of People Waiting in {{ currentStationName }}</span
                >
            </template>
            <template #content>
                <span
                    v-if="waitingQueueList"
                    class="p-text-normal"
                    style="font-size: 3.5rem;"
                >
                    {{ waitingQueueList.length }}
                </span>
                <span v-else class="p-text-normal" style="font-size: 3.5rem;">
                    0
                </span>
            </template>
        </Card>

        <!-- Average Waiting Time -->
        <!-- <MDBCard style="grid-area: avgTime">
      <MDBCardBody class="text-center">
        <MDBCardTitle>Average Waiting Time</MDBCardTitle>
        <MDBCardText class="card-text">
          <h2 class="display-2">{{ averageTimePerPerson }}</h2>
          <p class="subtitle-1" v-if="averageTimePerPerson != 'Waiting...'">
            h:m:s
          </p>
        </MDBCardText>
      </MDBCardBody> -->
        <!-- </MDBCard> -->

        <div
            class="p-p-2 p-col-12 p-mt-2"
            :style="{
                gridArea: 'hero',
                backgroundColor: 'var(--blue-700)',
                color: 'white',
                fontSize: '2.5rem',
                borderRadius: '5px',
            }"
        >
            {{ monitoringTitle }}
        </div>

        <!-- Average Waiting Time -->
        <div class="p-col-12 p-mt-2">
            <div class="p-grid">
                <Panel class="p-col-6">
                    <h4 class="p-text-light">Number Selected</h4>
                    <h2
                        v-if="currentQueueNumber"
                        class="p-text-normal"
                        style="fontSize: 4rem;"
                    >
                        {{ currentQueueNumber.num }}
                    </h2>
                    <h2 v-else class="p-text-normal" style="fontSize: 4rem;"
                        >None</h2
                    >
                </Panel>

                <div class="p-col-6">
                    <div class="p-d-flex p-flex-column">
                        <Button
                            class="p-button-success p-mb-2"
                            style="height:100%;text-align:center"
                            @click="advanceNum"
                            :disabled="processing"
                        >
                            Move to Next Step
                        </Button>
                        <Button
                            v-if="stationStage < 8"
                            class="p-button-danger"
                            style="height:100%;text-align:center"
                            @click="rejectNum"
                            :disabled="processing"
                        >
                            Reject Patient
                        </Button>
                    </div>
                </div>
            </div>
        </div>
        <!-- </div> -->
        <div class="mt-4" />
        <div
            class="p-col-2 mt-2"
            v-for="(queueItem, ind) in waitingQueueList"
            :key="ind"
        >
            <MDBBtn
                :color="ind % 2 ? 'primary' : 'warning'"
                class="w-100"
                @click.prevent="selectQueueNumber(ind)"
            >
                <h1>{{ queueItem.num }}</h1>
                <p>Queue No.</p>
            </MDBBtn>

            <!-- <MDBCard
          :bg="ind % 2 ? 'primary' : 'warning'"
          :text="ind % 2 ? 'white' : 'black'"
          class="text-center my-1"
        >
          <a
            href="#"
            :class="{
              'text-white': ind % 2,
              'text-black': !(ind % 2),
            }"
            @click.prevent="selectQueueNumber(ind)"
          >
            <MDBCardBody>
              <MDBCardTitle>{{ queueItem.num }}</MDBCardTitle>
              <MDBCardText>Queue Num</MDBCardText>
            </MDBCardBody>
          </a>
        </MDBCard> -->
        </div>
    </div>
</template>

<script>
import { computed, ref } from "@vue/runtime-core";
import { useMonitoring } from "../firebase";
import { createToast } from "mosha-vue-toastify";
import { MDBBtn } from "mdb-vue-ui-kit";
import Card from "primevue/card";
import Panel from "primevue/panel";
import Button from "primevue/button";

export default {
    props: ["stationName", "stationStage"],
    emits: ["error", "success"],
    components: {
        Button,
        Card,
        Panel,
        MDBBtn,
    },
    setup(props) {
        const {
            getStationQueueList,
            advanceQueueNumber,
            rejectQueueNumber,
        } = useMonitoring(props.stationStage);

        const { queueList, waitTime } = getStationQueueList();
        const currentQueueNumber = ref(null);
        const processing = ref(false);

        const monitoringTitle = computed(() => {
            const names = {
                registration: "Registration to Screening",
                vitals: "Vitals to Counseling",
                counseling: "Counseling to Screening",
                screening: "Screening to Vaccination",
                vaccination: "Vaccination to Post-Vaccination",
                post: "Post-Vaccination to Exit",
            };
            return names[props.stationName];
        });

        const currentStationName = computed(() => {
            const names = {
                screening: "Screening",
                vitals: "Vitals",
                counseling: "Counseling",
                vaccination: "Vaccination",
                post: "Post-Vaccination",
            };
            return names[props.stationName];
        });

        const waitingQueueList = computed(() => {
            if (queueList.value)
                return queueList.value.filter(
                    queue => queue.stage == props.stationStage
                );
            return [];
        });

        const selectQueueNumber = ind => {
            window.scrollTo(0, 0);
            currentQueueNumber.value = queueList.value[ind];
        };

        const advanceNum = () => {
            processing.value = true;
            if (!currentQueueNumber.value) {
                processing.value = false;
                createToast(
                    {
                        title: "Error",
                        description: "No number selected.",
                    },
                    {
                        type: "warning",
                        position: "top-center",
                    }
                );
                return;
            }

            advanceQueueNumber(currentQueueNumber.value.id)
                .then(message => {
                    processing.value = false;
                    createToast(
                        {
                            title: "Success",
                            description: message,
                        },
                        {
                            type: "success",
                            position: "top-center",
                        }
                    );
                    currentQueueNumber.value = null;
                })
                .catch(err => {
                    processing.value = false;
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
                });
        };

        const rejectNum = () => {
            processing.value = true;
            if (!currentQueueNumber.value) {
                createToast(
                    {
                        title: "Error",
                        description: "No number selected.",
                    },
                    {
                        type: "warning",
                        position: "top-center",
                    }
                );
                processing.value = false;
                return;
            }

            rejectQueueNumber(currentQueueNumber.value.id)
                .then(message => {
                    createToast(
                        {
                            title: "Success",
                            description: message,
                        },
                        {
                            type: "success",
                            position: "top-center",
                        }
                    );
                    currentQueueNumber.value = null;

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

        // const averageTimePerPerson = computed(() => {
        //   if (waitTime.value)
        //     return new Date(waitTime.value * 1000).toISOString().substr(11, 8);
        //   else return "Waiting...";
        // });

        return {
            // stationName,
            // stationStage
            currentStationName,
            monitoringTitle,
            waitingQueueList,
            currentQueueNumber,
            selectQueueNumber,
            advanceNum,
            waitTime,
            rejectNum,
            // averageTimePerPerson,
            queueList,
            processing,
        };
    },
};
</script>

<style scoped>
.root {
    text-align: center;
    width: 90%;
    margin: auto;
}
</style>
