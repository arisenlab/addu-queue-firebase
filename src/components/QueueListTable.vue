<template>
  <!-- TODO: Sort by queue no. Filter by stage -->
  <div class="row">
    <div class="row mt-4">
      <div class="col">
        <label for="filterQueue">Filter Queue Number</label>
        <input
          type="text"
          id="filterQueue"
          class="form-control"
          v-model="filterQueueNum"
          placeholder="Filter Queue Number"
        />
      </div>
      <div class="col">
        <label for="itemsPerPage">Filter Queue Number</label>
        <input
          type="number"
          id="itemsPerPage"
          class="form-control"
          v-model="itemsPerPage"
          placeholder="Filter Queue Number"
        />
      </div>
    </div>
    <div class="row my-4">
      <div class="col">
        <label for="queueBy">Order By: </label>
        <div id="queueBy" class="row">
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              v-model="queueBy"
              type="radio"
              name="queueBy"
              id="queueByNum"
              value="num"
            />
            <label class="form-check-label" for="queueByNum"
              >Queue Number</label
            >
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              v-model="queueBy"
              type="radio"
              name="queueBy"
              id="queueByOrder"
              value="queueTime"
            />
            <label class="form-check-label" for="queueByOrder"
              >Queue Order</label
            >
          </div>
        </div>
      </div>
      <div class="col">
        <label for="ascendingNums">Order Numbers: </label>
        <div id="ascendingNums" class="row">
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              v-model="ascendingNums"
              type="radio"
              name="orderNums"
              id="numAsc"
              :value="true"
            />
            <label class="form-check-label" for="numAsc">Ascending</label>
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              v-model="ascendingNums"
              type="radio"
              name="orderNums"
              id="numDesc"
              :value="false"
            />
            <label class="form-check-label" for="numDesc">Descending</label>
          </div>
        </div>
      </div>
      <div class="col">
        <label for="stageFilter">Filter by Stage</label>
        <select
          name="stageFilter"
          v-model="stageFilter"
          class="form-select shadow"
        >
          <option :value="0">No Filter</option>
          <option :value="1">Registration</option>
          <option :value="2">Vitals</option>
          <option :value="3">Counseling</option>
          <option :value="4">Screening</option>
          <option :value="5">Vaccination</option>
          <option :value="6">Post Vaccination</option>
          <option :value="7">Done</option>
          <option :value="8">Rejected</option>
        </select>
      </div>
    </div>

    <nav class="overflow-auto">
      <MDBPagination>
        <MDBPageItem
          href="#"
          v-for="num in pageNum"
          :key="num"
          :active="num == currPage"
          @click="currPage = num"
          >{{ num + 1 }}</MDBPageItem
        >
      </MDBPagination>
    </nav>

    <table class="table">
      <thead>
        <tr>
          <th>Queue Number</th>
          <th>Current Stage</th>
          <th>Special Case?</th>
          <th>Queue Time</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="queueNum in paginatedList[currPage]" :key="queueNum.num">
          <td>{{ queueNum.num }}</td>
          <td>{{ getStage(queueNum.stage, queueNum.timestamps) }}</td>
          <td>{{ queueNum.specialCase ? "Yes" : "" }}</td>
          <td>{{ queueNum.queueTime.toDate() }}</td>
        </tr>
      </tbody>
    </table>
    <nav class="overflow-auto">
      <MDBPagination class="mx-auto">
        <MDBPageItem
          href="#"
          v-for="num in pageNum"
          :key="num"
          :active="num == currPage"
          @click="currPage = num"
          >{{ num + 1 }}</MDBPageItem
        >
      </MDBPagination>
    </nav>
  </div>
</template>

<script>
import _ from "lodash";
import { MDBPagination, MDBPageItem } from "mdb-vue-ui-kit";

export default {
  props: ["queueNumList"],
  components: {
    MDBPagination,
    MDBPageItem,
  },
  data: () => ({
    stageFilter: 0,
    ascendingNums: true,
    queueBy: "num",
    filterQueueNum: "",
    currPage: 0,
    itemsPerPage: 100,
  }),
  computed: {
    filteredList() {
      // console.log(this.queueNumList.value);
      // if (!this.queueNumList.value) return;
      const filters = [
        [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // No filter
        [0, 1], // Registration
        [2, 3], //  Vitals
        [4, 5], // Counseling
        [6, 7], // Screening
        [8, 9], // Vaccination
        [10, 11], // Post-Vaccination
        [12], // Exit
        [-1], // Exit
      ];

      const filteredStage = this.queueNumList.filter(
        (num) =>
          filters[this.stageFilter].includes(num.stage) &&
          num.num.toString().indexOf(this.filterQueueNum) >= 0
      );
      let sortedStage;
      if (this.queueBy === "queueTime") {
        // console.log("Filtering by queue Time");
        sortedStage = filteredStage.sort((first, second) => {
          // console.log(first, second);
          return first.queueTime.seconds - second.queueTime.seconds;
        });
      } else sortedStage = filteredStage;

      if (this.ascendingNums) return sortedStage;
      else return sortedStage.reverse();
      // return this.queueNumList.value;
    },
    paginatedList() {
      return _.chunk(this.filteredList, this.itemsPerPage);
    },
    pageNum() {
      return _.range(0, this.paginatedList.length);
    },
  },
  methods: {
    getStage(stage, timestamps) {
      if (stage === -1) {
        // console.log(timestamps);
        const stationNames = [
          "post",
          "vaccination",
          "screening",
          "counseling",
          "vitals",
          "registration",
        ];

        for (var x = 0; x < stationNames.length; x++) {
          // console.log(stationNames[x], timestamps[stationNames[x]]);
          if (timestamps[stationNames[x]] != null) {
            // console.log("REJECTED THIS THING");
            return `Rejected at ${stationNames[x - 1]}`;
          }
        }
      }

      const actualStage = stage + 1;
      const stages = [
        "Rejected",
        "Issued Num",
        // "Registration",
        "Registration",
        "Vitals",
        "Vitals",
        "Counseling",
        "Counseling",
        "Screening",
        "Screening",
        "Vaccination",
        "Vaccination",
        "Post-Vaccination",
        "Post-Vaccination",
        "Done",
      ];

      return stages[actualStage];
    },
  },
};
</script>
