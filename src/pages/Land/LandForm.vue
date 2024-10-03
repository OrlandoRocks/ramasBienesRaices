<template>
  <div>
    <ValidationObserver v-slot="{ handleSubmit }">
      <form class="form-horizontal" @submit.prevent="handleSubmit(submit)">
        <card>
          <h4 slot="header" class="card-title">
            <i class="tim-icons icon-vector"></i>
            Terrenos
          </h4>
          <div>
            <div class="row">
              <label class="col-sm-2 col-form-label">Fraccionamiento:</label>
              <div class="col-sm-7">
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
            </div>
            <div class="row">
              <label class="col-sm-2 col-form-label">Codigo:</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="codigo"
                  rules="required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    v-model="land_code"
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
              <label class="col-sm-2 col-form-label">Direccion:</label>
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
              <label class="col-sm-2 col-form-label">Cuadra:</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="cuadra"
                  rules="required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    v-model="block"
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
              <label class="col-sm-2 col-form-label">Numero de Casa:</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="numero de casa"
                  rules="required|numeric"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    v-model="house_number"
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
              <label class="col-sm-2 col-form-label">Tamaño:</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="tamaño"
                  rules="required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    v-model="size"
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
              <label class="col-sm-2 col-form-label">Costo/Precio:</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="costo"
                  rules="required|numeric"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    v-model="price"
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
            <div class="text-center" v-if="create_edit === 'Crear'">
              <base-button
                @click="handleSubmit(appendLand)"
                class="btn-round"
                color="primary"
              >
                Agregar
              </base-button>
            </div>

            <el-table :data="tableData" v-if="create_edit === 'Crear'">
              <el-table-column
                v-for="column in tableColumns"
                :key="column.label"
                :min-width="column.minWidth"
                :prop="column.prop"
                :label="column.label"
              >
              </el-table-column>
              <el-table-column :min-width="135" align="right" label="Actions">
                <div slot-scope="props">
                  <base-button
                    @click.native="handleEdit(props.$index, props.row)"
                    class="edit btn-link"
                    type="warning"
                    size="sm"
                    icon
                  >
                    <i class="tim-icons icon-pencil"></i>
                  </base-button>
                  <base-button
                    @click.native="handleDelete(props.$index, props.row)"
                    class="remove btn-link"
                    type="danger"
                    size="sm"
                    icon
                  >
                    <i class="tim-icons icon-simple-remove"></i>
                  </base-button>
                </div>
              </el-table-column>
            </el-table>
          </div>
          <div class="text-center">
            <base-button
              :disabled="isSubmitting"
              native-type="submit"
              type="primary"
              >{{ create_edit }} Terrenos</base-button
            >
          </div>
        </card>
      </form>
    </ValidationObserver>
  </div>
</template>

<script>
import { Table, TableColumn } from "element-ui";
import { extend } from "vee-validate";
import { required, numeric } from "vee-validate/dist/rules";
import { Option, Select } from "element-ui";
import { mapActions, mapGetters } from "vuex";

extend("required", required);
extend("numeric", numeric);

export default {
  name: "LandForm",
  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Select.name]: Select,
    [Option.name]: Option,
  },
  data() {
    return {
      id: "",
      land_code: "",
      address: "",
      block: "",
      size: "",
      house_number: "",
      price: "",
      residential_id: "",
      lands: [],
      create_edit: "Crear",
      isSubmitting: false,
      tableColumns: [
        { prop: "residential_name", label: "Fraccionamiento", minWidth: 100 },
        { prop: "land_code", label: "Codigo", minWidth: 100 },
        { prop: "address", label: "Direccion", minWidth: 100 },
        { prop: "block", label: "Cuadra", minWidth: 100 },
        { prop: "house_number", label: "Numero de Casa", minWidth: 100 },
        { prop: "price", label: "Costo/Precio", minWidth: 100 },
      ],
    };
  },
  computed: {
    ...mapGetters(["getResidentials"]),
    residentialList() {
      return this.getResidentials;
    },
    tableData() {
      return this.lands.map((land) => ({
        ...land,
        residential_name: this.getResidentialName(land.residential_id),
      }));
    },
  },
  methods: {
    ...mapActions([
      "updateResidential",
      "updateLand",
      "fetchLandById",
      "createLand",
    ]),
    loadLandData(id) {
      this.fetchLandById(id)
        .then((land) => {
          this.id = id;
          this.land_code = land.land_code;
          this.address = land.address;
          this.block = land.block;
          this.house_number = land.house_number;
          this.size = land.size;
          this.price = land.price;
          this.residential_id = land.residential_id;
          this.create_edit = "Editar";
        })
        .catch((error) => {
          console.log(error);
        });
    },
    handleEdit(index, row) {
      this.land_code = row.land_code;
      this.address = row.address;
      this.block = row.block;
      this.house_number = row.house_number;
      this.size = row.size;
      this.price = row.price;
      this.lands.splice(index, 1);
    },

    handleDelete(index) {
      this.lands.splice(index, 1);
    },
    appendLand() {
      if (this.handleDuplicate()) {
        this.$notify({
          title: "Duplicado",
          type: "danger",
          message: "No se pueden agregar dos terrenos con la misma informacion",
          icon: "tim-icons icon-bell-55",
        });
        return;
      }
      this.lands.push({
        land_code: this.land_code,
        address: this.address,
        block: this.block,
        house_number: this.house_number,
        size: this.size,
        price: this.price,
        residential_id: this.residential_id,
      });
    },
    handleDuplicate() {
      return this.lands.some(
        (land) =>
          land.land_code === this.land_code &&
          land.address === this.address &&
          land.block === this.block &&
          land.house_number === this.house_number &&
          land.price === this.price &&
          land.residential_id === this.residential_id
      );
    },
    getResidentialName() {
      const selected = this.residentialList.find(
        (option) => option.id === this.residential_id
      );
      return selected ? selected.name : "";
    },
    submit() {
      let data = {
        land: {
          land_code: this.land_code,
          address: this.address,
          block: this.block,
          house_number: this.house_number,
          size: this.size,
          price: this.price,
          residential_id: this.residential_id,
        },
      };
      this.isSubmitting = true;
      if (this.create_edit === "Editar") {
        data.land.id = this.id;
        this.updateLand(data)
          .then(() => {
            this.$notify({
              title: "Success",
              type: "success",
              message: "Terreno actualizado con éxito",
              icon: "tim-icons icon-bell-55",
            });
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
          });
      } else {
        this.createLand({ lands: this.lands })
          .then(() => {
            this.$notify({
              title: "Success",
              type: "success",
              message: "Terrenos creados con éxito",
              icon: "tim-icons icon-bell-55",
            });
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
          });
      }
    },
    resetData() {
      this.land_code = "";
      this.address = "";
      this.block = "";
      this.house_number = "";
      this.size = "";
      this.price = "";
      this.residential_id = "";
      this.lands = [];
      this.isSubmitting = false;
    },
  },
  mounted() {
    this.$store.dispatch("fetchResidentials");
  },
  created() {
    const landId = this.$route.params.id;
    if (landId) {
      this.loadLandData(landId);
    }
    this.create_edit = landId ? "Editar" : "Crear";
  },
};
</script>

<style>
.error-message {
  color: red;
}
</style>
