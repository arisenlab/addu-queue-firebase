<template>
  <Card class="p-shadow-5">
    <template #content>
      <div class="p-grid p-d-flex p-jc-center">
        <div class="p-col-12">
          <div class="p-m-2 p-d-flex p-jc-center">
            <queue-number-card>
              <span v-if="this.currentlyServing === null">None</span>
              <span v-else>{{ currentlyServing.num }}</span>
            </queue-number-card>
          </div>
        </div>

        <div>
          <div
            v-if="this.currentlyServing"
            class="p-col-12"
            style="text-align: center"
          >
            <Button
              class="p-button"
              :disabled="processing"
              @click="finishAndCallNext"
            >
              Call Next Number
            </Button>
            <div class="p-text-normal">
              Finish with current patient and call another number
            </div>
          </div>
          <div v-else class="p-col-12" style="text-align: center">
            <Button class="p-button" :disabled="processing" @click="callNext">
              Call Next Number
            </Button>
            <div class="p-text-normal">Call a number from the queue</div>
          </div>
        </div>
        <div class="p-col-12 p-d-flex p-jc-center">
          <div v-if="this.currentlyServing" class="p-grid">
            <div class="p-col-12" style="text-align: center">
              <Button
                class="p-button p-button-info"
                :disabled="processing"
                @click="finishCurrent"
              >
                FINISH
              </Button>
              <div class="p-text-normal">Finish with current patient</div>
            </div>
            <div class="p-col-12" style="text-align: center">
              <Button
                class="p-button p-button-warning"
                :disabled="processing"
                @click="unqueueNumLocal"
              >
                Send Back
              </Button>
              <div class="p-text-normal">
                Send current patient back to the queue<br />
                <small class="p-error"
                  >Only do this when the patient is late or missing</small
                >
              </div>
            </div>
            <div class="p-col-12" style="text-align: center">
              <Button
                class="p-button p-button-danger"
                :disabled="processing"
                @click="rejectNumLocal"
              >
                Reject
              </Button>
              <div class="p-text-normal">
                Remove current patient from the queue<br />
                <small class="p-error">
                  Only do this when the patient is not valid for vaccination
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script>
import { watch } from "@vue/runtime-core";
import { ref } from "vue";
import { useQueue, useAuth, useStationControl } from "../firebase";
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
      //   callForNextNum,
      finishCurrentNum,
      unqueueNum,
      getQueueNumberByAuth,
      rejectNum,
    } = useQueue();
    const { user } = useAuth();
    const { callForNextNum } = useStationControl(props.stageId);

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

      callForNextNum()
        .then(queueNum => {
          console.log(queueNum);
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
              description: "Rejected #" + currentlyServing.value.num,
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
