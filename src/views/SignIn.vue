<template>
  <MDBContainer>
    <MDBRow tag="form" class="g-3">
      <MDBInput
        inputGroup
        :formOutline="false"
        v-model="form.email"
        aria-describedby="basic-addon1"
        aria-label="Username"
        placeholder="Username"
      >
      </MDBInput>
      <MDBInput
        inputGroup
        :formOutline="false"
        v-model="form.password"
        type="password"
        aria-describedby="basic-addon2"
        aria-label="Password"
        placeholder="Password"
      >
      </MDBInput>
      <MDBBtn color="primary" class="mt-3" @click="signIn">
        Login
      </MDBBtn>
    </MDBRow>
  </MDBContainer>
</template>

<script>
import { MDBContainer, MDBInput, MDBRow, MDBBtn } from "mdb-vue-ui-kit";
import { ref } from "@vue/reactivity";
import { useAuth } from "../firebase";
import { useRouter } from "vue-router";
import { createToast } from "mosha-vue-toastify";

export default {
  components: { MDBContainer, MDBInput, MDBRow, MDBBtn },
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
        .catch((err) => {
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

<style></style>
