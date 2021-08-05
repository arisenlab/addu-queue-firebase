<template>
    <div class="login">
        <div class="form-demo">
            <div class="p-d-flex p-jc-center">
                <div class="card">
                    <div class="logo">
                        <div>
                            <img src="../../public/addu-seal.png" height="60" />
                            <img src="../../public/nav_logo.png" height="60" />
                        </div>
                        <h2>AdDU Vaccination Queue System</h2>
                    </div>

                    <form class="p-fluid">
                        <div class="p-field">
                            <label for="email">Email</label>
                            <div class="p-float-label p-input-icon-right">
                                <i class="pi pi-envelope" />
                                <InputText
                                    id="email"
                                    type="text"
                                    placeholder="Enter your email address"
                                    v-model="form.email"
                                />
                            </div>
                        </div>
                        <div class="p-field">
                            <label for="email">Password</label>
                            <div class="p-float-label p-input-icon-right">
                                <i class="pi pi-lock" />
                                <InputText
                                    type="password"
                                    placeholder="Enter your Password"
                                    v-model="form.password"
                                />
                            </div>
                        </div>
                        <Button
                            type="button"
                            label="Login"
                            class="p-mt-2"
                            @click="signIn"
                        />
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
//import { MDBContainer, MDBInput, MDBRow, MDBBtn } from "mdb-vue-ui-kit";
import { ref } from "@vue/reactivity";
import { useAuth } from "../firebase";
import { useRouter } from "vue-router";
import { createToast } from "mosha-vue-toastify";
//import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Button from "primevue/button";

export default {
    //components: { MDBContainer, MDBInput, MDBRow, MDBBtn },
    components: { InputText, Button },
    setup() {
        const { signInWithForm } = useAuth();
        const router = useRouter();

        const form = ref({
            email: "",
            password: "",
        });

        const signIn = () => {
            signInWithForm(form.value.email, form.value.password)
                .then(() => {
                    router.push("/");
                })
                .catch(err => {
                    createToast(
                        {
                            title: "Error Signing In",
                            description: err.message,
                        },
                        {
                            type: "danger",
                            position: "top-center",
                        }
                    );
                });
        };

        return {
            form,
            signIn,
        };
    },
};
</script>

<style lang="scss" scoped>
.form-demo {
    margin-top: -20px;
    margin: auto;
    border-radius: 20px;
    .logo {
        text-align: center;
    }
    .card {
        padding: 20px;
        min-width: 450px;

        form {
            margin-top: 2rem;
        }

        .p-field {
            margin-bottom: 1.5rem;
        }
    }
}
.login {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
</style>
