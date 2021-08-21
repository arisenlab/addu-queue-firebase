<template>
  <div class="root p-grid">
    <!-- Number of People In Vitals -->
    <Card class="p-col-12 p-mt-2">
      <template #title>
        <span class="p-text-light"
          >Number of People Waiting in {{ currentStationName }}</span
        >
      </template>
      <template #content>
        <span
          v-if="waitingQueueList"
          class="p-text-normal"
          style="font-size: 3.5rem"
        >
          {{ waitingQueueList.length }}
        </span>
        <span v-else class="p-text-normal" style="font-size: 3.5rem">
          0
        </span>
      </template>
    </Card>

    <div
      class="p-p-2 p-col-12 p-mt-2"
      :style="{
        backgroundColor: 'var(--blue-500)',
        color: 'white',
        fontSize: '2.5rem',
        fontWeight: 'lighter',
        borderRadius: '5px',
      }"
    >
      {{ monitoringTitle }}
    </div>

    <!-- Average Waiting Time -->
    <div class="p-col-12 p-mt-2">
      <div class="p-grid">
        <Panel class="p-col-6">
          <div class="p-d-flex p-flex-column p-ai-center p-jc-center">
            <div class="p-text-light" style="font-size: 1.5rem">
              Queue Num Selected
            </div>
            <h2
              v-if="currentQueueNumber"
              class="p-text-normal"
              style="font-size: 2.5rem"
            >
              {{ currentQueueNumber.num }}
            </h2>
            <h2 v-else class="p-text-normal" style="font-size: 2.5rem">None</h2>
          </div>
        </Panel>

        <div class="p-col-6 p-d-flex p-ai-center p-jc-center">
          <div class="p-grid" style="height: 100%; width: 100%">
            <div v-if="stationStage < 8" class="p-col-12">
              <Button
                class="p-button-danger p-button-lg p-d-flex p-jc-center"
                style="width: 100%; height: 100%"
                @click="rejectNum"
              >
                Reject the Patient
              </Button>
            </div>
            <div class="p-col-12">
              <Button
                class="p-button-success p-button-lg p-d-flex p-jc-center"
                style="width: 100%; height: 100%"
                @click="advanceNum"
                :disabled="processing"
              >
                Move to Next Step
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- </div> -->
    <div class="mt-4" />
    <div
      class="p-col-3 p-md-2 mt-2"
      v-for="(queueItem, ind) in waitingQueueList"
      :key="ind"
    >
      <div
        :class="{
          'even-num': ind % 2 == 0,
          'odd-num': ind % 2 == 1,
        }"
        class="p-d-flex p-flex-column p-jc-center p-ai-center"
        @click.prevent="selectQueueNumber(ind)"
      >
        <div style="font-size: 2rem">{{ queueItem.num }}</div>
        <div style="font-size: 1rem; font-weight: lighter">Queue No.</div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from "@vue/runtime-core";
import { useMonitoring } from "../firebase";
import { createToast } from "mosha-vue-toastify";
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
      window.scrollTo({ top: 0, behavior: "smooth" });
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
.even-num {
  color: #fff;
  background-color: hsla(35, 100%, 50%, 1);
  border-radius: 10px;
  min-height: 100px;
}
.even-num:hover {
  color: #fff;
  background-color: hsla(35, 100%, 45%, 1);
  cursor: pointer;
}
.odd-num {
  color: #fff;
  background-color: hsla(197, 80%, 50%, 1);
  border-radius: 10px;
  min-height: 100px;
}
.odd-num:hover {
  color: #fff;
  background-color: hsla(197, 80%, 45%, 1);
  cursor: pointer;
}
.next-step {
  color: white;
  background-color: hsla(134, 61%, 50%, 1);
}
.next-step:hover {
  background-color: hsla(134, 61%, 45%, 1);
}
.reject {
  color: white;
  background-color: hsla(354, 70%, 50%, 1);
}
.reject:hover {
  background-color: hsla(354, 70%, 45%, 1);
}
</style>
