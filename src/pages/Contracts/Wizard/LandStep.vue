<template>
  <ValidationObserver ref="form">
    <form @submit.prevent="validate">
      <div>
        <h5 class="info-text">
          Por favor para empezar seleccione el cliente y el terreno
        </h5>
        <div class="row justify-content-center mt-5">
          <div class="col-sm-10">
            <label class="col-sm-5 col-form-label">Cliente:</label>
            <ValidationProvider
              name="cliente"
              rules="required"
              v-slot="{ errors }"
            >
              <el-select
                class="select-primary"
                style="width: 100%; margin-bottom: 10px"
                :error="errors[0]"
                size="large"
                placeholder="Seleccionar el Cliente"
                v-model="client_id"
              >
                <el-option
                  v-for="option in clientList"
                  class="select-primary"
                  :value="option.id"
                  :label="`${option.full_name}`"
                  :key="option.id"
                >
                </el-option>
              </el-select>
              <span class="error-message" v-if="errors.length">{{
                errors[0]
              }}</span>
            </ValidationProvider>
          </div>
          <div class="col-sm-5">
            <label class="col-sm-5 col-form-label">Fraccionamiento:</label>
            <ValidationProvider
              name="fraccionamiento"
              rules="required"
              v-slot="{ errors }"
            >
              <el-select
                class="select-primary"
                style="width: 100%; margin-bottom: 10px"
                :error="errors[0]"
                size="large"
                placeholder="Seleccionar el Fraccionamiento"
                v-model="residential_id"
              >
                <el-option
                  v-for="option in residentialList"
                  class="select-primary"
                  :value="option.id"
                  :label="`${option.name}`"
                  :key="option.id"
                >
                </el-option>
              </el-select>
              <span class="error-message" v-if="errors.length">{{
                errors[0]
              }}</span>
            </ValidationProvider>
          </div>
          <div class="col-sm-5">
            <label class="col-sm-5 col-form-label">Terreno:</label>
            <ValidationProvider
              name="terreno"
              rules="required"
              v-slot="{ errors }"
            >
              <el-select
                class="select-primary"
                style="width: 100%; margin-bottom: 10px"
                :error="errors[0]"
                size="large"
                placeholder="Seleccionar el Terreno"
                v-model="land_id"
              >
                <el-option
                  v-for="option in filteredLands"
                  class="select-primary"
                  :value="option.id"
                  :label="`${option.land_code} - ${option.address}`"
                  :key="option.id"
                >
                </el-option>
              </el-select>
              <span class="error-message" v-if="errors.length">{{
                errors[0]
              }}</span>
            </ValidationProvider>
          </div>
          <div class="col-sm-10" v-if="land_id">
            <h5 class="info-text">Informacion del Terreno:</h5>
            <label class="col-sm-2 col-form-label"
              ><b>Direccion:</b> {{ findLand.address }}</label
            >
            <label class="col-sm-2 col-form-label"
              ><b>Numero Casa:</b> {{ findLand.house_number }}</label
            >
            <label class="col-sm-2 col-form-label">
              <b>Cuadra:</b> {{ findLand.block }}</label
            >
            <label class="col-sm-2 col-form-label">
              <b>Tamaño:</b> {{ findLand.size }}</label
            >
            <label class="col-sm-2 col-form-label">
              <b>Precio:</b> {{ formatCurrency(findLand.price) }}</label
            >
            <label class="col-sm-2 col-form-label">
              <b>Cliente:</b> {{ findClient.full_name }}</label
            >
          </div>
        </div>
      </div>
    </form>
  </ValidationObserver>
</template>
<script>
import { extend } from "vee-validate";
import { required, numeric, email } from "vee-validate/dist/rules";
import { Option, Select } from "element-ui";
import { mapGetters } from "vuex";

extend("email", email);
extend("required", required);
extend("numeric", numeric);

export default {
  components: {
    [Select.name]: Select,
    [Option.name]: Option,
  },
  data() {
    return {
      residential_id: "",
      land_id: "",
      client_id: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
    };
  },
  computed: {
    ...mapGetters(["getResidentials", "getLands", "getClients", "getLandById"]),
    residentialList() {
      return this.getResidentials;
    },
    findLand() {
      let selected_land = this.getLands.find(
        (land) => land.id === this.land_id
      );
      this.$store.commit("setLand", selected_land);
      return selected_land;
    },
    filteredLands() {
      return this.getLands.filter(
        (land) => land.residential_id === this.residential_id
      ).filter(
          (land) => land.contract_id == "no"
      );
    },
    clientList() {
      return this.getClients;
    },
    findClient() {
      let selected_client = this.getClients.find(
        (client) => client.id === this.client_id
      );
      this.$store.commit("setClient", selected_client);
      return selected_client;
    },
  },
  methods: {
    validate() {
      return this.$refs.form.validate().then((res) => {
        this.$emit("on-validated", res);
        return res;
      });
    },
  },
  mounted() {
    this.$store.dispatch("fetchResidentials");
    this.$store.dispatch("fetchLands");
    this.$store.dispatch("fetchClients");
  },
};
</script>
<style>
.error-message {
  color: red;
}
</style>
