<template>
  <div class="p-grid">
    <div class="p-col" v-for="station in reversedNums" :key="station.station">
      <Card
        :class="{
          'new-num': newNums[station.station],
        }"
        style="text-align: center"
      >
        <template #content>
          <div>
            <p class="p-text-light">
              {{ station.station.split(" ")[0] }}<br />
              <span class="p-text-normal" style="font-size: 1.5em;">
                {{ station.station.split(" ")[1] }}
              </span>
            </p>
          </div>
          <h1>{{ station.currentNum || "Free" }}</h1>
        </template>
      </Card>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from "@vue/runtime-core";
import { useQueue } from "../firebase";
import Card from "primevue/card";
// import { MDBRow, MDBTable } from "mdb-vue-ui-kit";

export default {
  name: "StationDisplay",
  components: { Card },
  props: { stationName: String, stageId: Number },
  setup(props) {
    // Hooks
    const { stationDisplayQueueNums } = useQueue();

    // Data vars
    var serveNums = stationDisplayQueueNums(props.stationName);
    const alert = new Audio("/notification.wav");
    const newNums = ref({
      "Station 1": false,
      "Station 2": false,
      "Station 3": false,
      "Station 4": false,
      "Station 5": false,
      "Station 6": false,
      "Station 7": false,
      "Station 8": false,
      "Station 9": false,
      "Station 10": false,
    });

    // Watcher to see if there's new values in the array
    watch(serveNums, newValue => {
      console.log("newval", newValue);
      const changeNums = Object.keys(newNums.value).filter(key => {
        const stationVal = newValue.data.filter(
          station => station.station === key
        )[0];
        return newValue.changes.includes(key) && stationVal.currentNum != null;
      });

      console.log(changeNums);

      if (changeNums.length != 0) playAlert();

      changeNums.forEach(station => {
        newNums.value[station] = true;
        setTimeout(() => (newNums.value[station] = false), 5000);
      });
    });

    function playAlert() {
      alert.play();
    }

    const reversedNums = computed(() => {
      if (serveNums.value.data) return serveNums.value.data.reverse();
      return [];
    });

    return { serveNums, playAlert, newNums, reversedNums };
  },
};
</script>

<style scoped>
.queue-num {
  transition: 1s all ease;
}

.c-body {
  text-align: center;
}

.new-num {
  color: #fff;
  background-color: var(--yellow-500);
}
</style>
