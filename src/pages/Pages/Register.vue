<template>
  <div class="container">
    <div class="row">
      <div class="col-md-5 ml-auto">
        <div class="info-area info-horizontal mt-5">
          <div class="icon icon-warning">
            <i class="tim-icons icon-wifi"></i>
          </div>
          <div class="description">
            <h3 class="info-title">Conección</h3>
            <p class="description">
              La aplicación se conecta a una base de datos en la nube. Lo que te
              permite acceder a ella desde cualquier lugar.
            </p>
          </div>
        </div>
        <div class="info-area info-horizontal">
          <div class="icon icon-primary">
            <i class="tim-icons icon-chart-bar-32"></i>
          </div>
          <div class="description">
            <h3 class="info-title">Uso de Estadisticas</h3>
            <p class="description">
              Creamos reportes de uso para que puedas ver el rendimiento de la
              aplicación.
            </p>
          </div>
        </div>
        <div class="info-area info-horizontal">
          <div class="icon icon-info">
            <i class="tim-icons icon-trophy"></i>
          </div>
          <div class="description">
            <h3 class="info-title">Facilitacion de procesos</h3>
            <p class="description">
              Hicimos la aplicación lo mas sencilla posible para que puedas
              trabajar de manera eficiente.
            </p>
          </div>
        </div>
      </div>

      <div class="col-md-7 mr-auto">
        <ValidationObserver v-slot="{ handleSubmit }">
          <form @submit.prevent="handleSubmit(submit)">
            <card class="card-register card-white">
              <template slot="header">
                <img
                  class="card-img"
                  src="img/card-primary.png"
                  alt="Card image"
                />
                <h4 class="card-title">Registro</h4>
              </template>

              <ValidationProvider
                name="fullname"
                rules="required"
                v-slot="{ passed, failed, errors }"
              >
                <base-input
                  required
                  v-model="name"
                  placeholder="Nombre"
                  addon-left-icon="tim-icons icon-single-02"
                  type="text"
                  :error="errors[0]"
                  :class="[{ 'has-success': passed }, { 'has-danger': failed }]"
                >
                </base-input>
              </ValidationProvider>

              <ValidationProvider
                name="fullname"
                rules="required"
                v-slot="{ passed, failed, errors }"
              >
                <base-input
                  required
                  v-model="last_name"
                  placeholder="Apellidos"
                  addon-left-icon="tim-icons icon-single-02"
                  type="text"
                  :error="errors[0]"
                  :class="[{ 'has-success': passed }, { 'has-danger': failed }]"
                >
                </base-input>
              </ValidationProvider>

              <ValidationProvider
                name="email"
                rules="required|email"
                v-slot="{ passed, failed, errors }"
              >
                <base-input
                  required
                  v-model="email"
                  placeholder="Correo Electronico"
                  addon-left-icon="tim-icons icon-email-85"
                  type="email"
                  :error="errors[0]"
                  :class="[{ 'has-success': passed }, { 'has-danger': failed }]"
                >
                </base-input>
              </ValidationProvider>

              <ValidationProvider
                name="password"
                rules="required"
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

              <base-checkbox class="text-left">
                Acepto los <a href="#something">terminos y condiciones</a>.
              </base-checkbox>

              <base-button
                native-type="submit"
                slot="footer"
                type="primary"
                @click="onSignUp"
                round
                block
                size="lg"
              >
                Comenzar
              </base-button>
            </card>
          </form>
        </ValidationObserver>
      </div>
    </div>
  </div>
</template>
<script>
import { BaseCheckbox } from "src/components";
import { extend } from "vee-validate";
import { required, email } from "vee-validate/dist/rules";
import "@/store/index.js";
import { mapActions, mapGetters } from "vuex";

extend("email", email);
extend("required", required);

export default {
  computed: {
    ...mapGetters(["getAuthToken", "getError"]),
  },
  components: {
    BaseCheckbox,
  },
  data() {
    return {
      email: "",
      name: "",
      last_name: "",
      password: "",
    };
  },
  methods: {
    ...mapActions(["registerUser"]),
    onSignUp(event) {
      event.preventDefault();
      let data = {
        user: {
          name: this.name,
          last_name: this.last_name,
          email: this.email,
          password: this.password,
        },
      };
      this.registerUser(data);
      this.resetData();
    },
    submit() {
      alert("Form has been submitted!");
    },
  },
};
</script>
<style></style>
