import { createRouter, createWebHistory } from "vue-router";
import { useAuthServer } from "../firebase";
import { adminUids } from "../secrets";

import Issue from "../views/Issue.vue";
//import Station from "../views/Station.vue";
//import Display from "../views/Display.vue";
import SignIn from "../views/SignIn.vue";
import SignOut from "../views/SignOut.vue";
import Admin from "../views/Admin.vue";
//import Monitoring from "../views/Monitoring.vue";
//import Dashboard from "../views/Dashboard.vue";
//import QueueOverview from "../views/QueueOverview.vue";

const { isLogin, user, permissions } = useAuthServer();

export const routes = [
    {
        path: "/issue",
        name: "Issue",
        component: Issue,
        meta: {
            authRequired: true,
            issueRequired: true,
        },
        /* to: "/issue",
        label: "Issue",
        icon: "pi pi-check-square", */
    },
    {
        path: "/signin",
        name: "Sign In",
        component: SignIn,
        /* to: "/signin",
        label: "Sign In",
        icon: "pi pi-sign-in", */
    },
    {
        path: "/signout",
        name: "Sign Out",
        component: SignOut,
        meta: {
            authRequired: true,
        } /* 
        to: "/signout",
        label: "Sign Out",
        icon: "pi pi-sign-out", */,
    },
    {
        path: "/admin",
        name: "Admin",
        component: Admin,
        props: {
            authRequired: true,
            adminRequired: true,
        } /* 
        label: "Admin",
        icon: "pi pi-id-card",
        children: [
            {
                path: "/dashboard",
                name: "Dashboard",
                component: Dashboard,
            },
        ],
        items: [
            {
                label: "Dashboard",
                icon: "pi pi-chart-bar",
                to: "/",
            },
            {
                label: "Controls",
                icon: "pi pi-sliders-h",
                to: "/admin",
            },
        ], */,
    },
    /* {
        path: "/station",
        name: "Station Control",
        meta: {
            authRequired: true,
            stationRequired: true,
        },
        children: [
            {
                path: "/:station",
                name: "Station Control",
                component: Station,
            },
            {
                path: "/:display",
                name: "Station Display",
                component: Display,
            },
        ],
    }, */
    /* {
        path: "/station",
        name: "Station Control",
        meta: {
            authRequired: true,
            stationRequired: true,
        },
        children: [
            {
                path: "/:station",
                name: "Station Control",
                component: Station,
            },
            {
                path: "/:display",
                name: "Station Display",
                component: Display,
            },
        ],
    },
    {
        path: "/monitoring/overview",
        name: "Queue List Overview",
        component: QueueOverview,
        meta: {
            authRequired: true,
            stationRequired: true,
        },
    },
    {
        path: "/monitoring/:station",
        name: "Monitoring",
        component: Monitoring,
        meta: {
            authRequired: true,
            stationRequired: true,
        },
    },
    {
        path: "/signin",
        name: "Sign In",
        component: SignIn,
    },
    {
        path: "/admin",
        name: "Admin",
        component: Admin,
        meta: {
            authRequired: true,
            adminRequired: true,
        },
    }, */
    // {
    //   path: "/dashboard",
    //   name: "Dashboard",
    //   component: Dashboard,
    //   meta: {
    //     authRequired: true,
    //     adminRequired: true,
    //   },
    // },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

// router.beforeEach((to, from, next) => {
//   console.log("Hello world", userPermissions);
//   next();
// });

router.beforeEach((to, from, next) => {
    permissions().then(userPermissions => {
        if (to.meta.authRequired) {
            if (isLogin.value)
                if (to.meta.adminRequired) {
                    if (adminUids.includes(user.value.uid)) next();
                    else {
                        alert(
                            "You do not have the authorization to use this page!"
                        );
                        next({
                            name: "Home",
                        });
                    }
                } else if (to.meta.stationRequired) {
                    if (
                        adminUids.includes(user.value.uid) ||
                        ((to.name === "Monitoring" ||
                            to.name === "Queue List Overview") &&
                            userPermissions.monitoring.includes(
                                user.value.uid
                            )) ||
                        userPermissions[to.params.station].includes(
                            user.value.uid
                        )
                    )
                        next();
                    else {
                        alert(
                            "You do not have the authorization to use this page!"
                        );
                        next({
                            name: "Home",
                        });
                    }
                } else if (to.meta.issueRequired) {
                    if (
                        adminUids.includes(user.value.uid) ||
                        userPermissions.issue.includes(user.value.uid)
                    )
                        next();
                    else {
                        alert(
                            "You do not have the authorization to use this page!"
                        );
                        next({
                            name: "Home",
                        });
                    }
                } else next();
            else {
                alert("You must be signed in to see this page!");
                next({
                    name: "Sign In",
                });
            }
        } else next();
    });
});

export default router;
