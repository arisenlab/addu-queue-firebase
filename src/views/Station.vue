<template>
    <div class="p-grid">
        <div v-if="stageId !== null || stageId !== undefined" class="p-col-12">
            <div class="p-grid">
                <h1
                    class="p-col-12 p-my-2"
                    style="text-align:center; text-transform: capitalize; font-size: 2rem"
                >
                    {{ $route.params.station }}
                </h1>
                <div class="p-col-12">
                    <station-control
                        :stationName="$route.params.station"
                        :stageId="stageId"
                    ></station-control>
                </div>
            </div>
        </div>
        <div v-else class="p-col-12">
            <h3 class="display-2">This is not a valid station</h3>
        </div>
    </div>
</template>

<script>
import StationControl from "../components/StationControl";

export default {
    components: { StationControl },
    computed: {
        stageId() {
            return this.mapStage[this.$route.params.station];
        },
    },
    data: () => ({
        mapStage: {
            registration: 0,
            vitals: 2,
            counseling: 4,
            screening: 6,
            vaccination: 8,
            post: 10,
        },
    }),
};
</script>
