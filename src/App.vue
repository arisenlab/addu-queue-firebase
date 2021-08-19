<template>
    <div style="min-height: 100vh">
        <Menubar
            v-show="isLogin || !inLoginPage"
            :model="routes"
            class="p-shadow-1"
        >
            <template #start>
                <img src="../public/addu-seal.png" height="60" class="p-mr-2" />
                <img src="../public/nav_logo.png" height="50" class="p-mr-2" />
            </template>
            <template #end>
                <Button
                    v-if="isLogin"
                    @click="$router.push('/signout')"
                    label="Signout"
                />
                <Button
                    v-else
                    @click="$router.push('/signin')"
                    label="Signin"
                />
            </template>
        </Menubar>

        <div class="flex-grow-1">
            <router-view v-bind="$attrs" />
        </div>

        <div v-show="isLogin && !inLoginPage" style="text-align: center">
            <h4 style="margin-bottom: -15px">Powered by</h4>
            <img src="/horizontal-logo.png" height="80" />
        </div>
    </div>
</template>

<script>
import Menubar from "primevue/menubar";
import Button from "primevue/button";
import { ref } from "vue";
import { useAuth } from "./firebase";

export default {
    data: () => ({
        stations: {
            // Registration: "registration",
            Vitals: "vitals",
            Counseling: "counseling",
            Screening: "screening",
            Vaccination: "vaccination",
            "Post Vaccination": "post",
        },
        routes: [
            {
                to: "/",
                label: "Dashboard",
                icon: "pi pi-chart-bar",
            },
            {
                to: "/issue",
                label: "Issue",
                icon: "pi pi-check-square",
            },
            {
                to: "/station/registration",
                label: "Registration Controls",
                icon: "pi pi-file-o",
            },
            {
                to: "/display/registration",
                label: "Registration Display",
                icon: "pi pi-table",
            },
            {
                label: "Monitoring",
                icon: "pi pi-fw pi-desktop",
                items: [
                    {
                        to: "/monitoring/overview",
                        label: "Queue List",
                        icon: "pi pi-ellipsis-h",
                    },
                    {
                        to: "/monitoring/vitals",
                        label: "Vitals",
                        icon: "pi pi-heart",
                    },
                    {
                        to: "/monitoring/counseling",
                        label: "Counseling",
                        icon: "pi pi-home",
                    },
                    {
                        to: "/monitoring/screening",
                        label: "Screening",
                        icon: "pi pi-user",
                    },
                    {
                        to: "/monitoring/vaccination",
                        label: "Vaccination",
                        icon: "pi pi-pencil",
                    },
                    {
                        to: "/monitoring/post",
                        label: "Post Vaccination",
                        icon: "pi pi-check-circle",
                    },
                ],
            },
            {
                to: "/admin",
                label: "Admin Controls",
                icon: "pi pi-fw pi-desktop",
            },
        ],
    }),
    components: {
        Menubar,
        Button,
    },
    computed: {
        inLoginPage() {
            return this.$route.path === "/signin";
        },
    },
    setup() {
        const { isLogin } = useAuth();

        const collapse1 = ref(false);
        const adminDropdown = ref(false);
        const displayDropdown = ref(false);

        return {
            collapse1,
            adminDropdown,
            displayDropdown,
            isLogin,
        };
    },
};
</script>

<style>
#app {
    /* font-family: Avenir, Helvetica, Arial, sans-serif; */
    font-family: Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
}

#main-nav {
    background-color: #2f84bd !important;
    margin-bottom: 10px;
}
</style>
