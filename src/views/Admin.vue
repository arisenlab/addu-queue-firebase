<template>
  <div class="grid">
    <div class="p-col-12">
      <div class="p-d-flex p-jc-center">
        <Button
          label="Reset Queue"
          class="p-button-raised p-button-danger"
          :loading="processing"
          @click="localResetQueue"
        />
        <Button
          label="Seed Users"
          class="p-button-raised p-button-success p-ml-2"
          :loading="processing"
          @click="localSeedUsers"
        />
        <Button
          label="Run Test Queries"
          class="p-button-raised p-button-warning p-ml-2"
          :loading="processing"
          @click="testQueries"
        />
        <Button
          label="Fast Track a Number"
          class="p-button-raised p-ml-2"
          :loading="processing"
          @click="fastTrack"
        />
        <Button
          label="Mark Number as Done"
          class="p-button-raised p-button-success p-ml-2"
          :loading="processing"
          @click="markDone"
        />
      </div>
    </div>

    <queue-list-table :queueNumList="queueNumList"></queue-list-table>
  </div>
</template>

<script>
import { createToast } from "mosha-vue-toastify";
import { useAdmin } from "../firebase";
import { ref, watch } from "@vue/runtime-core";
import Button from "primevue/button";
import QueueListTable from "../components/QueueListTable.vue";

export default {
  components: { QueueListTable, Button },
  setup() {
    const {
      seedUsers,
      resetQueue,
      runTestQueries,
      getQueueNums,
      fastTrackNum,
      markNumAsDone,
    } = useAdmin();
    const { testQuery, queryStatus } = runTestQueries();
    const { seedUserFn, seedStatus } = seedUsers();
    const queueNumList = getQueueNums();
    const processing = ref(false);

    const localSeedUsers = () => {
      let sure = prompt("Are you sure? Please type 'resbakuna' to verify.");
      if (sure !== "resbakuna") return;
      processing.value = true;

      seedUserFn()
        .then((message) => {
          createToast(
            {
              title: "Success!",
              description: message,
            },
            {
              type: "sucess",
              position: "top-center",
            }
          );

          processing.value = false;
        })
        .catch((err) => {
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

    const localResetQueue = () => {
      console.log("Resetting...");

      let sure = prompt("Are you sure? Please type 'resbakuna' to verify.");
      if (sure !== "resbakuna") return;

      processing.value = true;
      resetQueue()
        .then((message) => {
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
          processing.value = false;
        })
        .catch((err) => {
          createToast(
            {
              title: "Error",
              description: err.message,
            },
            {
              type: "danger",
              position: "top-center",
            }
          );
        });
    };

    const testQueries = () => {
      processing.value = true;
      testQuery()
        .then((message) => {
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

          processing.value = false;
        })
        .catch((err) => {
          createToast(
            {
              title: "Error",
              description: err.message,
            },
            {
              type: "danger",
              position: "top-center",
            }
          );

          processing.value = false;
        });
    };

    const fastTrack = () => {
      const queueNum = parseInt(prompt("Enter a number to fast-track"));
      let error = null;

      if (isNaN(queueNum)) error = "The number you entered was not valid";
      if (queueNum > queueNumList.value.length)
        error =
          "The number you entered exceeded the number of people in the queue.";

      if (error !== null) {
        createToast(
          {
            title: "Error",
            description: error,
          },
          {
            type: "danger",
            position: "top-center",
          }
        );
        return;
      }

      processing.value = true;

      const queueNumItem = queueNumList.value.find(
        (num) => num.num === queueNum
      );

      if (queueNumItem === undefined) {
        createToast(
          {
            title: "Error",
            description:
              "Can't find a corresponding queue item with that number.",
          },
          {
            type: "danger",
            position: "top-center",
          }
        );
        return;
      }

      fastTrackNum(queueNumItem.id)
        .then((message) => {
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
          processing.value = false;
        })
        .catch((err) => {
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

      console.log(queueNumItem);
    };

    const markDone = () => {
      const queueNum = parseInt(prompt("Enter a number to mark as done"));
      let error = null;

      if (isNaN(queueNum)) error = "The number you entered was not valid";
      if (queueNum > queueNumList.value.length)
        error =
          "The number you entered exceeded the number of people in the queue.";

      if (error !== null) {
        createToast(
          {
            title: "Error",
            description: error,
          },
          {
            type: "danger",
            position: "top-center",
          }
        );
        return;
      }

      processing.value = true;

      const queueNumItem = queueNumList.value.find(
        (num) => num.num === queueNum
      );

      if (queueNumItem === undefined) {
        createToast(
          {
            title: "Error",
            description:
              "Can't find a corresponding queue item with that number.",
          },
          {
            type: "danger",
            position: "top-center",
          }
        );
        return;
      }

      markNumAsDone(queueNumItem.id)
        .then((message) => {
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
          processing.value = false;
        })
        .catch((err) => {
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

      console.log(queueNumItem);
    };

    watch(
      () => queryStatus.value,
      (newVal) => {
        createToast(
          {
            title: "Success",
            description: newVal.message,
          },
          {
            type: "warning",
            position: "bottom-right",
          }
        );
      }
    );

    watch(
      () => seedStatus.value,
      (newVal) => {
        createToast(
          {
            title: "Success",
            description: newVal.message,
          },
          {
            type: newVal.status,
            position: "bottom-right",
            timeout: 3000,
          }
        );
      }
    );

    const getStage = (stage) => {
      const actualStage = stage + 1;
      const stages = [
        "Rejected",
        "Issued Num",
        // "Registration",
        "Registration",
        "Screening",
        "Screening",
        "Vitals",
        "Vitals",
        "Vaccination",
        "Vaccination",
        "Post-Vaccination",
        "Post-Vaccination",
        "Done",
      ];
      return stages[actualStage];
    };

    return {
      queueNumList,
      localSeedUsers,
      localResetQueue,
      testQueries,
      queryStatus,
      processing,
      getStage,
      fastTrack,
      markDone,
    };
  },
};
</script>

<style></style>
