<template>
  <div class="p-grid p-m-auto" style="width: 85%">
    <div class="p-col p-sm-12 p-md-6">
      <div class="custom-card-1">
        <div class="card-title">Number of People Vaccinated</div>
        <div class="card-content">
          {{ numVaccinated.length }}
        </div>
      </div>
    </div>
    <div class="p-col p-sm-12 p-md-6">
      <div class="custom-card-2">
        <div class="card-title">Average Time Per Person</div>
        <div class="card-content">
          {{ averageTimePerPerson ? averageTimePerPerson : `Waiting...` }}
        </div>
      </div>
    </div>
    <div class="p-col p-sm-12 p-md-6">
      <div class="custom-card-1">
        <div class="card-title">Number of People in Queue</div>
        <div class="card-content">
          {{ peopleInQueue.length }}
        </div>
      </div>
    </div>
    <div class="p-col p-sm-12 p-md-6">
      <div class="custom-card-2">
        <div class="card-title">Vaccination Start Time</div>
        <div class="card-content">
          {{ startTime }}
        </div>
      </div>
    </div>
    <div class="p-col p-sm-12 p-md-6">
      <div class="custom-card-1">
        <div class="card-title">Latest Number Issued</div>
        <div class="card-content">
          {{ queueNumList.length }}
        </div>
      </div>
    </div>
    <div class="p-col p-sm-12 p-md-6">
      <div class="custom-card-2">
        <div class="card-title">Number of People Rejected</div>
        <div class="card-content">
          {{ numRejected.length }}
        </div>
      </div>
    </div>

    <div class="p-p-2 p-col-12 section-name">Number of People in Stations</div>

    <div class="p-col-12">
      <div class="p-grid">
        <div
          class="p-col p-sm-6 p-md-4 p-lg-2"
          v-for="(queue, ind) in queueInStations"
          :key="queue.station"
        >
          <div :class="`custom-card-${ind % 2 ? '1' : '2'}`">
            <div class="mini-card-title p-mb-2">{{ queue.station }}</div>
            <div class="mini-card-content">
              <span>{{ queue.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="p-p-2 p-col-12 section-name">Waiting Time in Stations</div>

    <div class="p-col-12">
      <div class="p-grid">
        <div
          v-for="(queue, ind) in averageTimePerStation"
          :key="queue.station"
          class="p-col p-sm-6 p-md-4 p-lg-2"
        >
          <div :class="`custom-card-${ind % 2 ? '1' : '2'}`">
            <div class="mini-card-title">{{ queue.station }}</div>
            <div class="mini-card-content">
              {{ queue.time }}<br />
              <small>h:m:s</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAdmin } from "../firebase";
import { computed } from "@vue/runtime-core";

export default {
  setup() {
    const { getQueueNums } = useAdmin();
    const queueNumList = getQueueNums();

    const peopleInQueue = computed(() => {
      return queueNumList.value.filter(
        queueNum => queueNum.stage <= 10 && queueNum.stage >= 0
      );
    });

    const averageTimePerPerson = computed(() => {
      const finished = queueNumList.value.filter(
        queueNum => queueNum.timestamps.vaccination !== null
      );

      if (finished.length === 0) return "Waiting...";

      const seconds =
        finished
          .map(queueNum => {
            const enterTime = queueNum.timestamps.issue;
            const exitTime = queueNum.timestamps.vaccination;
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
        queueNum => queueNum.timestamps
      );

      const avgTimes = [];

      for (let x = 1; x < conditions.length; x++) {
        const curr = conditions[x];
        const prev = conditions[x - 1];

        const validTimestamps = timestamps.filter(timestampArr => {
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
      return queueNumList.value.filter(num => num.stage === -1);
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
          count: queueNumList.value.filter(queueNum => {
            if (queueNum.stage === ind * 2 || queueNum.stage == ind * 2 + 1)
              return queueNum;
          }).length,
        };
      });
    });

    const numVaccinated = computed(() => {
      return queueNumList.value.filter(queueNum => queueNum.stage > 8);
    });

    const averageTimeInRegistration = computed(() => {
      const finished = queueNumList.value.filter(
        queueNum => queueNum.timestamps.registration !== null
      );

      if (finished.length === 0) return "Waiting...";

      const seconds =
        finished
          .map(queueNum => {
            const enterTime = queueNum.timestamps.issue;
            const exitTime = queueNum.timestamps.registration;
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

<style scoped>
.color-1 {
  background-color: var(--primary-color);
  color: #fff;
  text-align: center;
}

.color-2 {
  background-color: #ffa322;
  text-align: center;
}

.card-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 15px;
}

.card-content {
  font-size: 4rem;
  font-weight: lighter;
}

.mini-card-title {
  font-size: 1.2rem;
  text-align: center;
}

.mini-card-content {
  font-size: 2.5rem;
  font-weight: lighter;
}

.mini-card-title > small,
.mini-card-content > small {
  font-size: 1.4rem;
}

.mini-card-content > span {
  font-size: 4rem;
}

.custom-card-1 {
  background-color: var(--primary-color);
  color: #fff;
  text-align: center;
  padding: 50px;
  border-radius: 10px;
}

.custom-card-2 {
  background-color: #ffa322;
  text-align: center;
  padding: 50px;
  border-radius: 10px;
}

.section-name {
  background-color: var(--blue-700);
  color: white;
  border-radius: 10px;
  text-align: center;
  font-size: 1.5rem;
}
</style>
