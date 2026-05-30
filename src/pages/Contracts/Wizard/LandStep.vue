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
                  v-for="option in landSelectOptions"
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
import { landHasNoContract, sameResidentialId } from "@/util/landHelpers";

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
      const selectedId = Number(this.land_id);
      const selected_land =
        this.getLands.find((land) => Number(land.id) === selectedId) ||
        (Number(this.getLandById?.id) === selectedId ? this.getLandById : null);
      if (selected_land) {
        this.$store.commit("setLand", selected_land);
      }
      return selected_land || {};
    },
    filteredLands() {
      if (this.residential_id === "" || this.residential_id == null) {
        return [];
      }
      return this.getLands.filter(
        (land) =>
          sameResidentialId(land.residential_id, this.residential_id) &&
          landHasNoContract(land)
      );
    },
    landSelectOptions() {
      const options = this.filteredLands;
      const selectedId = Number(this.land_id);
      if (!selectedId) {
        return options;
      }
      if (options.some((land) => Number(land.id) === selectedId)) {
        return options;
      }
      const selected = this.getLandById;
      if (
        selected &&
        Number(selected.id) === selectedId &&
        sameResidentialId(selected.residential_id, this.residential_id) &&
        landHasNoContract(selected)
      ) {
        return [...options, selected];
      }
      return options;
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
    async applyRoutePrefill() {
      const { land_id, residential_id } = this.$route.query;
      if (residential_id) {
        const rid = parseInt(residential_id, 10);
        this.residential_id = Number.isNaN(rid) ? residential_id : rid;
      }
      if (!land_id) {
        return;
      }
      const lid = parseInt(land_id, 10);
      this.land_id = Number.isNaN(lid) ? land_id : lid;

      const inList = this.getLands.some(
        (land) => Number(land.id) === Number(this.land_id)
      );
      if (inList) {
        return;
      }
      try {
        const land = await this.$store.dispatch("fetchLandById", this.land_id);
        if (!this.residential_id && land.residential_id != null) {
          this.residential_id = land.residential_id;
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
  async mounted() {
    await Promise.allSettled([
      this.$store.dispatch("fetchResidentials"),
      this.$store.dispatch("fetchLands"),
      this.$store.dispatch("fetchClients"),
    ]);
    await this.applyRoutePrefill();
  },
};
</script>
<style>
.error-message {
  color: red;
}
</style>
