<template>
  <div class="container">
    <div class="col-lg-4 col-md-6 ml-auto mr-auto">
      <ValidationObserver v-slot="{ handleSubmit }">
        <form @submit.prevent="handleSubmit(submit)">
          <card class="card-login card-white">
            <template slot="header">
              <img src="img/card-primary.png" alt="" />
              <h1 class="card-title">Log in</h1>
            </template>

            <div>
              <ValidationProvider
                name="email"
                rules="required|email"
                v-slot="{ passed, failed, errors }"
              >
                <base-input
                  required
                  v-model="email"
                  type="email"
                  placeholder="Correo Electrónico"
                  addon-left-icon="tim-icons icon-email-85"
                  :error="errors[0]"
                  :class="[{ 'has-success': passed }, { 'has-danger': failed }]"
                >
                </base-input>
              </ValidationProvider>

              <ValidationProvider
                name="password"
                rules="required|min:5"
                v-slot="{ passed, failed, errors }"
              >
                <base-input
                  required
                  v-model="password"
                  placeholder="Contraseña"
                  addon-left-icon="tim-icons icon-lock-circle"
                  type="password"
                  :error="errors[0]"
                  :class="[{ 'has-success': passed }, { 'has-danger': failed }]"
                >
                </base-input>
              </ValidationProvider>
            </div>

            <div slot="footer">
              <base-button
                native-type="submit"
                type="primary"
                class="mb-3"
                size="lg"
                @click="onLogin"
                block
              >
                Aceptar
              </base-button>
              <div class="pull-left">
                <h6>
                  <router-link class="link footer-link" to="/register">
                    Crear Cuenta
                  </router-link>
                </h6>
              </div>

              <div class="pull-right">
                <h6>
                  <a href="#pablo" class="link footer-link">Necesitas ayuda?</a>
                </h6>
              </div>
            </div>
          </card>
        </form>
      </ValidationObserver>
    </div>
  </div>
</template>
<script>
import { extend } from "vee-validate";
import { required, email, min } from "vee-validate/dist/rules";
import "@/store/index.js";
import { mapActions, mapGetters } from "vuex";

extend("email", email);
extend("min", min);

extend("required", required);

export default {
  computed: {
    ...mapGetters([
      "getAuthToken",
      "getUserEmail",
      "getUserID",
      "isLoggedIn",
      "getError",
    ]),
  },
  data() {
    return {
      email: "",
      password: "",
      subscribe: true,
    };
  },
  methods: {
    ...mapActions(["loginUser"]),
    onLogin(event) {
      event.preventDefault();
      let data = {
        auth: {
          email: this.email,
          password: this.password,
        },
      };
      this.loginUser(data)
        .then(() => {
          this.$notify({
            type: "success",
            message: `Bienvenido ${this.getUserEmail}...`,
            icon: "tim-icons icon-bell-55",
          });
          this.$router.push("/dashboard");
        })
        .catch((error) => {
          console.log("error");
          this.$notify({
            type: "danger",
            message: `La informacion es incorrecta!`,
            icon: "tim-icons icon-bell-55",
          });
          this.resetData();
          console.log(error);
        });
    },
    resetData() {
      this.email = "";
      this.password = "";
    },
  },
};
</script>
<style>
.navbar-nav .nav-item p {
  line-height: inherit;
  margin-left: 5px;
}
</style>
