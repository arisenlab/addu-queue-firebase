<template>
    <div class="p-grid">
        <div class="p-col-12" v-if="stageId">
            <div class="p-grid">
                <div class="p-col-12">
                    <h3>
                        <span style="text-transform: capitalize">{{
                            $route.params.station
                        }}</span>
                        - Currently Serving #s
                    </h3>
                    <station-display
                        :stationName="$route.params.station"
                        :stageId="stageId"
                    />
                </div>
            </div>
        </div>
        <div v-else class="p-col-12">
            <h3 class="display-3">This is not a valid station.</h3>
        </div>
    </div>
</template>

<script>
import StationDisplay from "../components/StationDisplay";

export default {
    components: { StationDisplay },
    computed: {
        stageId() {
            return this.mapStage[this.$route.params.station];
        },
    },
    data: () => ({
        mapStage: {
            registration: 1,
            vitals: 3,
            counseling: 5,
            screening: 7,
            vaccination: 9,
            post: 11,
        },
    }),
};
</script>

<style></style>
