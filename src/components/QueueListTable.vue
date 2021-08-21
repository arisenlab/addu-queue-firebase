<template>
  <!-- TODO: Sort by queue no. Filter by stage -->
  <div class="p-col-12 p-m-auto" style="width: 90%">
    <DataTable
      class="p-datatable-customers"
      ref="dt"
      :value="getCleanList()"
      dataKey="id"
      v-model:filters="filters"
      filterDisplay="row"
      :globalFilterFields="['num', 'stage', 'case', 'timein']"
      :paginator="true"
      :loading="loading"
      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
      :rows="10"
      responsiveLayout="scroll"
    >
      <template #header>
        <div class="p-d-flex p-jc-between p-ai-center">
          <div class="p-d-flex p-ai-center">
            <h5 class="p-m-0">Queue List Numbers</h5>
            <Button
              class="p-ml-2"
              icon="pi pi-external-link"
              label="Export to CSV"
              @click="exportCSV($event)"
            />
          </div>
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText
              v-model="filters['global'].value"
              placeholder="Number Search"
            />
          </span>
        </div>
      </template>
      <template #empty> No queue yet. </template>
      <Column field="num" header="Queue Number" :sortable="true">
        <template #body="{ data }">
          {{ data.num }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            type="text"
            v-model="filterModel.value"
            @change="filterCallback"
            class="p-column-filter"
            placeholder="Search by number"
          />
        </template>
      </Column>
      <Column field="stage" header="Current Stage" :sortable="true">
        <template #body="{ data }">
          <span>
            {{ data.stage }}
          </span>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Dropdown
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="stages"
            placeholder="Stages"
            class="p-column-filter"
            :showClear="true"
          >
            <template #value="slotProps">
              <span v-if="slotProps.value">
                {{ slotProps.value }}
              </span>
              <span v-else>{{ slotProps.placeholder }}</span>
            </template>
            <template #optiongroup="slotProps">
              <span>
                {{ slotProps.option.stage }}
              </span>
            </template>
          </Dropdown>
        </template>
      </Column>
      <Column field="case" header="Special Case" dataType="boolean">
        <template #body="{ data }" class="p-d-flex p-jc-center">
          {{ data.case ? "Yes" : "" }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Checkbox
            v-model="filterModel.value"
            @change="filterCallback()"
            :binary="true"
          />
        </template>
      </Column>
      <Column field="timein" header="Queue Time" :sortable="true"> </Column>
    </DataTable>
  </div>
</template>

<script>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";
import Button from "primevue/button";
import { FilterMatchMode } from "primevue/api";

export default {
  props: ["queueNumList"],
  components: {
    Button,
    DataTable,
    Column,
    Dropdown,
    InputText,
    Checkbox,
  },
  data: () => ({
    filters: null,
    loading: true,
    stages: [
      "Issued Num",
      "Registration",
      "Vitals",
      "Counseling",
      "Screening",
      "Vaccination",
      "Post Vaccination",
      "Done",
    ],
  }),
  created() {
    this.initFilters();
  },
  mounted() {
    this.loading = false;
  },
  methods: {
    getStage(stage) {
      if (stage < 0) {
        const rejectedStageInd = stage * -1;
        const stages = [
          "Something went wrong",
          // "Rejected at Registration",
          // "Rejected at Registration",
          "Rejected at Registration",
          "Rejected at Vitals",
          "Rejected at Vitals",
          "Rejected at Counseling",
          "Rejected at Counseling",
          "Rejected at Screening",
          "Rejected at Screening",
          "Rejected at Vaccination",
          "Rejected at Vaccination",
          "Rejected at Post-Vaccination",
          "Rejected at Post-Vaccination",
          "Rejected at Done",
        ];
        return stages[rejectedStageInd];
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
    getCleanList() {
      return this.queueNumList.map(queueNum => ({
        id: queueNum.id,
        num: queueNum.num.toString(),
        stage: this.getStage(queueNum.stage),
        case: queueNum.specialCase,
        timein: queueNum.queueTime.toDate().toLocaleString(),
      }));
    },
    initFilters() {
      this.filters = {
        global: { value: null, matchMode: FilterMatchMode.EQUALS },
        num: { value: null, matchMode: FilterMatchMode.CONTAINS },
        stage: { value: null, matchMode: FilterMatchMode.CONTAINS },
        case: { value: null, matchMode: FilterMatchMode.EQUALS },
        date: { value: null, matchMode: FilterMatchMode.DATE_IS },
      };
    },
    exportCSV() {
      this.$refs.dt.exportCSV();
    },
  },
};
</script>

<style scoped>
.customer-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;
}

.customer-badge.status-qualified {
  background-color: #c8e6c9;
  color: #256029;
}

.customer-badge.status-rejected {
  background-color: #c8e6c9;
  color: #c63737;
}
</style>
