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
              <label class="col-sm-2 col-form-label">Tipo</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="type"
                  rules="required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    v-model="type"
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
              <label class="col-sm-2 col-form-label">Cuadra</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="block"
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
              <label class="col-sm-2 col-form-label">Numero de Casa</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="house_number"
                  rules="required"
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
              <label class="col-sm-2 col-form-label">Costo/Precio</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="costo"
                  rules="required"
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
            <div class="text-center">
              <base-button
                @click="handleSubmit(appendLand)"
                class="btn-round"
                color="primary"
              >
                Agregar
              </base-button>
            </div>

            <el-table :data="lands">
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
        </card>
      </form>
    </ValidationObserver>
  </div>
</template>

<script>
import { Table, TableColumn } from "element-ui";
import { extend } from "vee-validate";
import { required, numeric } from "vee-validate/dist/rules";
import { mapActions, mapGetters } from "vuex";

extend("required", required);
extend("numeric", numeric);

export default {
  name: "LandForm",
  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
  },
  data() {
    return {
      type: "",
      address: "",
      block: "",
      house_number: "",
      cost: "",
      lands: [],
      tableColumns: [
        { prop: "type", label: "Tipo", minWidth: 100 },
        { prop: "address", label: "Direccion", minWidth: 100 },
        { prop: "block", label: "Cuadra", minWidth: 100 },
        { prop: "house_number", label: "Numero de Casa", minWidth: 100 },
        { prop: "cost", label: "Costo/Precio", minWidth: 100 },
      ],
    };
  },
  methods: {
    ...mapActions(["updateResidential"]),
    handleEdit(index, row) {
      this.type = row.type;
      this.address = row.address;
      this.block = row.block;
      this.house_number = row.house_number;
      this.cost = row.cost;
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
        type: this.type,
        address: this.address,
        block: this.block,
        house_number: this.house_number,
        cost: this.cost,
      });
    },
    handleDuplicate() {
      return this.lands.some(
        (land) =>
          land.type === this.type &&
          land.address === this.address &&
          land.block === this.block &&
          land.house_number === this.house_number &&
          land.cost === this.cost
      );
    },
    submit() {
      this.updateResidential({ lands: this.lands });
    },
  },
};
</script>

<style></style>
