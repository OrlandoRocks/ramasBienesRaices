<template>
  <div class="col-md-8">
    <ValidationObserver v-slot="{ handleSubmit }">
      <form @submit.prevent="handleSubmit(submit)">
        <card>
          <h4 slot="header" class="title">Editar Perfil</h4>
          <div>
            <div class="row">
    <!--          <label class="col-sm-2 col-form-label">Nombre del Fracc</label>-->
              <div class="col-md-4">
                <ValidationProvider
                  name="name"
                  rules="required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    label="Nombre"
                    v-model="name"
                    :error="errors[0]"
                    :class="[{ 'has-success': passed }, { 'has-danger': failed }]"
                  >
                  </base-input>
                </ValidationProvider>
              </div>
              <div class="col-md-4">
                <ValidationProvider
                  name="last_name"
                  rules="required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    label="Apellidos"
                    v-model="last_name"
                    :error="errors[0]"
                    :class="[{ 'has-success': passed }, { 'has-danger': failed }]"
                  >
                  </base-input>
                </ValidationProvider>
              </div>
              <div class="col-md-4">
                <ValidationProvider
                  name="email"
                  rules="required|email"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    v-model="email"
                    label="Correo Electrónico"
                    type="email"
                    :error="errors[0]"
                    :class="[{ 'has-success': passed }, { 'has-danger': failed }]"
                    :disabled="true"
                  >
                  </base-input>
                </ValidationProvider>
              </div>
            </div>
          </div>
          <div class="text-center">
            <base-button
              :disabled="isSubmitting"
              native-type="submit"
              type="primary"
              >{{ isEdit ? "Editar" : "Crear" }} Perfil</base-button
            >
          </div>
        </card>
      </form>
    </ValidationObserver>
  </div>
</template>
<script>
import swal from "sweetalert2";
import { extend } from "vee-validate";
import { required, email } from "vee-validate/dist/rules";
import { mapGetters, mapActions } from "vuex";
import {Option, Select} from "element-ui";

extend("email", email);
extend("required", required);

export default {
  components: {
    [Select.name]: Select,
    [Option.name]: Option,
  },
  computed: {
    ...mapGetters(["getUserById"]),
  },
  data() {
    return {
      id: "",
      name: "",
      last_name: "",
      email: "",
      role_id: 0,
      isEdit: false,
      isSubmitting: false,
    };
  },
  methods: {
    ...mapActions(["fetchUserById", "updateUser"]),
    loadUserData(id) {
      this.fetchUserById(id)
        .then((user) => {
          this.id = user.id;
          this.name = user.name;
          this.last_name = user.last_name;
          this.email = user.email;
          this.role_id = String(user.role_id);
          this.isEdit = true;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    submit() {
      this.isSubmitting = true;
      let data = {
        user: {
          name: this.name,
          last_name: this.last_name,
          email: this.email,
          role_id: this.role_id,
          password: this.password,
        },
      };
      if (this.isEdit) {
        data.user.id = this.id;
        this.updateUser(data)
          .then(() => {
            this.$notify({
              title: "Success",
              type: "success",
              message: "Perfil actualizado con éxito.",
              icon: "tim-icons icon-bell-55",
            });
            return true;
          })
          .catch((error) => {
            console.log(error);
            this.isSubmitting = false;
            this.$notify({
              title: "Error",
              type: "danger",
              message: "Error al actualizar el perfil.",
              icon: "tim-icons icon-bell-55",
            });
          });
      }
    },
  },
  mounted() {
  },
  created() {
    const userId = this.$route.params.id;
    if (userId) {
      this.loadUserData(userId);
    }
    this.isEdit = userId ? true : false;
  },
};
</script>
<style></style>
