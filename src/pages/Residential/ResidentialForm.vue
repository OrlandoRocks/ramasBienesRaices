<template>
  <div class="col-md-12">
    <ValidationObserver v-slot="{ handleSubmit }">
      <form class="form-horizontal" @submit.prevent="handleSubmit(submit)">
        <card>
          <h4 slot="header" class="card-title">Fraccionamiento</h4>
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
            <base-button native-type="submit" type="primary"
              >Crear Fraccionamiento</base-button
            >
          </div>
        </card>
      </form>
    </ValidationObserver>
  </div>
</template>
<script>
import { extend } from "vee-validate";
import { required, double, regex, confirmed } from "vee-validate/dist/rules";
import { Option, Select } from "element-ui";
import { mapActions, mapGetters } from "vuex";

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
    ...mapGetters(["getUsersList"]),
    usersList() {
      return this.getUsersList;
    },
  },
  data() {
    return {
      name: "",
      address: "",
      cost: "",
      user_id: "",
    };
  },
  methods: {
    ...mapActions(["createResidential"]),
    submit() {
      let data = {
        residential: {
          name: this.name,
          address: this.address,
          cost: this.cost,
          user_id: this.user_id,
        },
      };
      console.log(data);
      this.createResidential(data)
        .then(() => {
          this.$notify({
            title: "Success",
            type: "success",
            message: "Fraccionamiento creado con éxito",
            icon: "tim-icons icon-bell-55",
          });
        })
        .catch((error) => {
          console.log(error);
          this.$notify({
            title: "Error",
            type: "danger",
            message: "Error al crear el fraccionamiento",
            icon: "tim-icons icon-bell-55",
          });
        });
      this.resetData();
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
};
</script>
<style>
.error-message {
  color: red;
}
</style>
