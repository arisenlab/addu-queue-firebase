<!-- THIS COMPONENT IS USED TO DISPLAY ALL NUMBERS
THAT ARE CURRENTLY BEING SERVED IN THE STATION -->

<template>
  <div class="row row-cols-10 g-1">
    <div class="col" v-for="station in reversedNums" :key="station.station">
      <div
        class="card c-main"
        :class="{
          'bg-warning': newNums[station.station],
          'text-white': newNums[station.station],
        }"
      >
        <div class="card-body text-center">
          <div class="card-title">
            {{ station.station.split(" ")[0] }}<br />
            <h1>{{ station.station.split(" ")[1] }}</h1>
          </div>
          <div class="card-text">
            <h1 class="display-4">{{ station.currentNum || "Free" }}</h1>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from "@vue/runtime-core";
import { useQueue } from "../firebase";
// import { MDBRow, MDBTable } from "mdb-vue-ui-kit";

export default {
  name: "StationDisplay",
  // components: { MDBRow, MDBTable },
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
    watch(serveNums, (newValue) => {
      console.log("newval", newValue);
      const changeNums = Object.keys(newNums.value).filter((key) => {
        const stationVal = newValue.data.filter(
          (station) => station.station === key
        )[0];
        return newValue.changes.includes(key) && stationVal.currentNum != null;
      });

      console.log(changeNums);

      if (changeNums.length != 0) playAlert();

      changeNums.forEach((station) => {
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
</style>
