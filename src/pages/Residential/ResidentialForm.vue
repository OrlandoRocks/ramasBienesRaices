<template>
  <div class="col-md-12">
    <ValidationObserver v-slot="{ handleSubmit }">
      <form class="form-horizontal" @submit.prevent="handleSubmit(submit)">
        <card>
          <h4
            slot="header"
            class="card-title clickable"
            @click="goToResidentials"
          >
            <i class="tim-icons icon-minimal-left"></i>
            Fraccionamiento
          </h4>
          <div>
            <div class="row">
              <label class="col-sm-2 col-form-label">Nombre del Fracc</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="nombre"
                  rules="required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    v-model="name"
                    :error="errors[0]"
                    :class="[
                      { 'has-success': passed },
                      { 'has-danger': failed },
                    ]"
                  >
                  </base-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-2 col-form-label">Direccion</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="direccion"
                  rules="required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    v-model="address"
                    :error="errors[0]"
                    :class="[
                      { 'has-success': passed },
                      { 'has-danger': failed },
                    ]"
                  >
                  </base-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-2 col-form-label">Costo/Precio</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="costo"
                  rules="required|double"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    v-model="cost"
                    :error="errors[0]"
                    :class="[
                      { 'has-success': passed },
                      { 'has-danger': failed },
                    ]"
                  >
                  </base-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-2 col-form-label">Responsable</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="responsable"
                  rules="required"
                  v-slot="{ errors }"
                >
                  <el-select
                    class="select-primary"
                    style="width: 100%; margin-bottom: 10px"
                    :error="errors[0]"
                    size="large"
                    placeholder="Seleccionar el responsable"
                    v-model="user_id"
                  >
                    <el-option
                      v-for="option in usersList"
                      class="select-primary"
                      :value="option.id"
                      :label="`${option.full_name} (${option.email})`"
                      :key="option.email"
                    >
                    </el-option>
                  </el-select>
                  <span class="error-message" v-if="errors.length">{{
                    errors[0]
                  }}</span>
                </ValidationProvider>
              </div>
            </div>
          </div>
          <div class="text-center">
            <base-button
              :disabled="isSubmitting"
              native-type="submit"
              type="primary"
              >{{ create_edit }} Fraccionamiento</base-button
            >
          </div>
        </card>
        {{ lands }}
      </form>
    </ValidationObserver>
  </div>
</template>
<script>
import { extend } from "vee-validate";
import { required, double, regex, confirmed } from "vee-validate/dist/rules";
import { Option, Select } from "element-ui";
import { mapActions, mapGetters } from "vuex";
import { resolve } from "url";

extend("required", required);
extend("double", double);
extend("regex", regex);
extend("confirmed", confirmed);

export default {
  components: {
    [Select.name]: Select,
    [Option.name]: Option,
  },
  computed: {
    ...mapGetters(["getUsersList", "getResidentialById"]),
    usersList() {
      return this.getUsersList;
    },
  },
  data() {
    return {
      id: "",
      name: "",
      address: "",
      cost: "",
      user_id: "",
      lands: [],
      create_edit: "Crear",
      isSubmitting: false,
    };
  },
  methods: {
    ...mapActions([
      "createResidential",
      "fetchResidentialById",
      "updateResidential",
    ]),
    loadResidentialData(id) {
      this.fetchResidentialById(id)
        .then((res) => {
          this.id = res.id;
          this.name = res.name;
          this.address = res.address;
          this.cost = res.cost;
          this.lands = res.lands;
          this.user_id = String(res.user_id);
          this.create_edit = "Editar";
        })
        .catch((error) => {
          console.log(error);
        });
    },
    submit() {
      return new Promise((resolve) => {
        this.isSubmitting = true;
        let data = {
          residential: {
            name: this.name,
            address: this.address,
            cost: this.cost,
            user_id: this.user_id,
          },
        };
        if (this.create_edit === "Editar") {
          data.residential.id = this.id;
          this.updateResidential(data)
            .then((res) => {
              this.$emit("on-validated", res);
              this.$notify({
                title: "Success",
                type: "success",
                message: "Fraccionamiento actualizado con éxito",
                icon: "tim-icons icon-bell-55",
              });
              resolve(true);
            })
            .catch((error) => {
              console.log(error);
              this.isSubmitting = false;
              this.$notify({
                title: "Error",
                type: "danger",
                message: "Error al actualizar el fraccionamiento",
                icon: "tim-icons icon-bell-55",
              });
              resolve(false);
            });
        } else {
          this.createResidential(data)
            .then((res) => {
              console.log(res);
              this.fetchResidentialById(res.id);
              this.$emit("on-validated", res);
              this.$notify({
                title: "Success",
                type: "success",
                message: "Fraccionamiento creado con éxito",
                icon: "tim-icons icon-bell-55",
              });
              resolve(true);
            })
            .catch((error) => {
              console.log(error);
              this.isSubmitting = false;
              this.resetData();
              this.$notify({
                title: "Error",
                type: "danger",
                message: "Error al crear el fraccionamiento",
                icon: "tim-icons icon-bell-55",
              });
              resolve(false);
            });
        }
      });
    },
    goToResidentials() {
      this.$router.push({ name: "Residentials" });
    },
    resetData() {
      this.name = "";
      this.address = "";
      this.cost = "";
      this.user_id = "";
    },
  },
  mounted() {
    this.$store.dispatch("usersList");
  },
  created() {
    const residentialId = this.$route.params.id;
    if (residentialId) {
      this.loadResidentialData(residentialId);
    }
    this.create_edit = residentialId ? "Editar" : "Crear";
  },
};
</script>
<style>
.error-message {
  color: red;
}
.clickable {
  cursor: pointer;
}

.clickable:hover {
  color: #e14eca !important;
}
</style>
