import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/routes";
import "mosha-vue-toastify/dist/style.css";
import PrimeVue from "primevue/config";
//import "primevue/resources/themes/md-light-indigo/theme.css";
import "./assets/_theme.scss";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

createApp(App)
    .use(router)
    .use(PrimeVue)
    .mount("#app");
