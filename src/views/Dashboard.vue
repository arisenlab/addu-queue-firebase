<template>
  <div class="dashboard-layout container">
    <!-- {{ averageTimePerStation }} -->
    <MDBCard
      style="grid-area: numVax"
      bg="primary"
      text="white"
      class="text-center"
    >
      <MDBCardBody>
        <MDBCardTitle>Number of People Vaccinated</MDBCardTitle>
        <MDBCardText class="display-2">{{ numVaccinated.length }}</MDBCardText>
      </MDBCardBody>
    </MDBCard>
    <MDBCard style="grid-area: inQueue" bg="warning" class="text-center">
      <MDBCardBody>
        <MDBCardTitle>Number of People in Queue</MDBCardTitle>
        <MDBCardText class="display-2">{{ peopleInQueue.length }}</MDBCardText>
      </MDBCardBody>
    </MDBCard>
    <MDBCard
      style="grid-area: AvgTime"
      bg="warning"
      text="black"
      class="text-center"
    >
      <MDBCardBody>
        <MDBCardTitle>Average Time Per Person</MDBCardTitle>
        <MDBCardText class="display-2"
          >{{ averageTimePerPerson ? averageTimePerPerson : `Waiting...` }}
        </MDBCardText>
      </MDBCardBody>
    </MDBCard>
    <MDBCard
      style="grid-area: timeRegistration"
      bg="primary"
      text="white"
      class="text-center"
    >
      <MDBCardBody>
        <MDBCardTitle>Vaccination Start Time</MDBCardTitle>
        <MDBCardText class="display-2">{{ startTime }} </MDBCardText>
      </MDBCardBody>
    </MDBCard>
    <MDBCard
      style="grid-area: latestIssued"
      bg="info"
      class="text-center text-white"
    >
      <MDBCardBody>
        <MDBCardTitle>Latest Number Issued</MDBCardTitle>
        <MDBCardText class="display-2 ">{{ queueNumList.length }}</MDBCardText>
      </MDBCardBody>
    </MDBCard>

    <MDBCard style="grid-area: rejected" bg="warning" class="text-center">
      <MDBCardBody>
        <MDBCardTitle>Number of People Rejected</MDBCardTitle>
        <MDBCardText class="display-2">{{ numRejected.length }}</MDBCardText>
      </MDBCardBody>
    </MDBCard>

    <div
      class="bg-primary lead text-white rounded text-center p-2"
      style="grid-area: numLabel"
    >
      Number of People in Stations
    </div>

    <div class="num-person-display">
      <MDBCard
        v-for="(queue, ind) in queueInStations"
        :key="queue.station"
        :bg="ind % 2 ? 'primary' : 'warning'"
        :text="ind % 2 ? 'white' : 'black'"
        class="text-center"
      >
        <MDBCardBody>
          <MDBCardTitle class="lead">{{ queue.station }}</MDBCardTitle>
          <MDBCardText class="display-3">{{ queue.count }}</MDBCardText>
        </MDBCardBody>
      </MDBCard>
    </div>

    <div
      class="bg-primary lead text-white rounded text-center p-2"
      style="grid-area: waitLabel"
    >
      Waiting Time in Stations
    </div>

    <div class="num-person-display" style="grid-area: waitTime">
      <MDBCard
        v-for="(queue, ind) in averageTimePerStation"
        :key="queue.station"
        :bg="ind % 2 ? 'primary' : 'warning'"
        :text="ind % 2 ? 'white' : 'black'"
        class="text-center"
      >
        <MDBCardBody>
          <MDBCardTitle class="lead">{{ queue.station }}</MDBCardTitle>
          <MDBCardText class="display-6">
            {{ queue.time }}<br />
            <small class="lead">h:m:s</small>
          </MDBCardText>
        </MDBCardBody>
      </MDBCard>
    </div>
  </div>
</template>

<script>
import {
  MDBCard,
  MDBCardBody,
  MDBCardText,
  MDBCardTitle,
} from "mdb-vue-ui-kit";
import { useAdmin } from "../firebase";
import { computed } from "@vue/runtime-core";

export default {
  components: {
    MDBCard,
    MDBCardBody,
    MDBCardText,
    MDBCardTitle,
  },
  setup() {
    const { getQueueNums } = useAdmin();
    const queueNumList = getQueueNums();

    const peopleInQueue = computed(() => {
      return queueNumList.value.filter(
        (queueNum) => queueNum.stage <= 10 && queueNum.stage >= 0
      );
    });

    const averageTimePerPerson = computed(() => {
      // Filter out the people still in queue
      // const finished = queueNumList.value.filter(
      //   (queueNum) => queueNum.stage === 10
      // );

      const finished = queueNumList.value.filter(
        (queueNum) => queueNum.timestamps.vaccination !== null
      );

      if (finished.length === 0) return "Waiting...";

      // console.log(finished.length, finished, queueNumList.value);

      const seconds =
        finished
          .map((queueNum) => {
            const enterTime = queueNum.timestamps.issue;
            const exitTime = queueNum.timestamps.vaccination;
            // console.log(queueNum, "Enter: ", enterTime, "Exit:", exitTime);
            // Calculate the time in seconds
            return exitTime.seconds - enterTime.seconds;
          })
          .reduce((a, b) => a + b, 0) / finished.length; // Add up the seconds then average
      return new Date(seconds * 1000).toISOString().substr(11, 8);
    });

    const averageTimePerStation = computed(() => {
      const conditions = [
        "issue",
        "registration",
        "vitals",
        "counseling",
        "screening",
        "vaccination",
        // "post",
      ];

      const timestamps = queueNumList.value.map(
        (queueNum) => queueNum.timestamps
      );
      // console.log("Timestamps", timestamps);

      const avgTimes = [];

      for (let x = 1; x < conditions.length; x++) {
        // console.log(conditions[x - 1], conditions[x]);
        const curr = conditions[x];
        const prev = conditions[x - 1];

        const validTimestamps = timestamps.filter((timestampArr) => {
          return timestampArr[curr] !== null && timestampArr[prev] !== null;
        });

        if (validTimestamps.length === 0)
          return {
            time: "Waiting...",
            station: curr,
          };

        const seconds =
          validTimestamps.reduce((totalSeconds, timestamp) => {
            const difference =
              timestamp[curr].seconds - timestamp[prev].seconds;
            return (totalSeconds += difference);
          }, 0) / validTimestamps.length;

        const time = new Date(seconds * 1000).toISOString().substr(11, 8);

        avgTimes.push({
          time,
          station: curr,
        });
      }

      return avgTimes;
    });

    const numRejected = computed(() => {
      return queueNumList.value.filter((num) => num.stage === -1);
    });

    const queueInStations = computed(() => {
      const conditions = [
        "registration",
        "vitals",
        "counseling",
        "screening",
        "vaccination",
        // "post",
      ];

      return conditions.map((station, ind) => {
        return {
          station: station.charAt(0).toUpperCase() + station.slice(1), // Capitalize
          count: queueNumList.value.filter((queueNum) => {
            // console.log(queueNum.stage);
            if (queueNum.stage === ind * 2 || queueNum.stage == ind * 2 + 1)
              return queueNum;
          }).length,
        };
      });
    });

    const numVaccinated = computed(() => {
      return queueNumList.value.filter((queueNum) => queueNum.stage > 8);
    });

    const averageTimeInRegistration = computed(() => {
      const finished = queueNumList.value.filter(
        (queueNum) => queueNum.timestamps.registration !== null
      );

      if (finished.length === 0) return "Waiting...";

      // console.log(finished.length, finished, queueNumList.value);

      const seconds =
        finished
          .map((queueNum) => {
            const enterTime = queueNum.timestamps.issue;
            const exitTime = queueNum.timestamps.registration;
            // console.log(queueNum, "Enter: ", enterTime, "Exit:", exitTime);
            // Calculate the time in seconds
            return exitTime.seconds - enterTime.seconds;
          })
          .reduce((a, b) => a + b, 0) / finished.length; // Add up the seconds then average
      return new Date(seconds * 1000).toISOString().substr(11, 8);
    });

    const startTime = computed(() => {
      if (queueNumList.value.length == 0) return "Waiting...";
      // else return "THere is a start";

      const sortList = queueNumList.value.sort((a, b) => {
        return a.queueTime.seconds - b.queueTime.seconds;
      });

      return sortList[0].queueTime
        .toDate()
        .toLocaleString("en-us")
        .split(", ")[1];
    });

    return {
      queueNumList,
      peopleInQueue,
      averageTimePerPerson,
      numRejected,
      queueInStations,
      numVaccinated,
      averageTimeInRegistration,
      averageTimePerStation,
      startTime,
    };
  },
};
</script>
