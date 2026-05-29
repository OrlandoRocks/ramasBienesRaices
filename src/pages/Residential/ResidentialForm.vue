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
                      v-for="option in responsableOptions"
                      class="select-primary"
                      :value="option.id"
                      :label="optionLabel(option)"
                      :key="String(option.id)"
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
              >{{ isEdit ? "Editar" : "Crear" }} Fraccionamiento</base-button
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
    ...mapGetters([
      "getUsersForSelect",
      "getResidentialById",
      "getResidentials",
      "isStaff",
      "currentUser",
    ]),
    responsableOptions() {
      if (this.getUsersForSelect?.length) {
        return this.getUsersForSelect;
      }
      if (!this.isStaff) {
        return [];
      }
      const seen = new Set();
      const options = (this.getResidentials || []).reduce((list, residential) => {
        const id = residential.user_id;
        if (!id || seen.has(String(id))) {
          return list;
        }
        seen.add(String(id));
        list.push({
          id,
          full_name: residential.user_name || `Usuario #${id}`,
          email: "",
        });
        return list;
      }, []);
      const currentId = this.user_id || this.getResidentialById?.user_id;
      if (currentId && !seen.has(String(currentId))) {
        options.unshift({
          id: currentId,
          full_name:
            this.getResidentialById?.user_name || `Usuario #${currentId}`,
          email: "",
        });
      }
      return options;
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
      isEdit: false,
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
          this.isEdit = true;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    submit() {
      this.isSubmitting = true;
      let data = {
        residential: {
          name: this.name,
          address: this.address,
          cost: this.cost,
          user_id: this.user_id,
        },
      };
      if (this.isEdit) {
        data.residential.id = this.id;
        this.updateResidential(data)
          .then(() => {
            this.$notify({
              title: "Success",
              type: "success",
              message: "Fraccionamiento actualizado con éxito",
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
              message: "Error al actualizar el fraccionamiento",
              icon: "tim-icons icon-bell-55",
            });
          });
      } else {
        this.createResidential(data)
          .then(() => {
            this.$notify({
              title: "Success",
              type: "success",
              message: "Fraccionamiento creado con éxito",
              icon: "tim-icons icon-bell-55",
            });
            return true;
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
            return false;
          });
      }
    },
    goToResidentials() {
      this.$router.push({ name: "Residentials" });
    },
    optionLabel(option) {
      if (option.email) {
        return `${option.full_name} (${option.email})`;
      }
      return option.full_name;
    },
    resetData() {
      this.name = "";
      this.address = "";
      this.cost = "";
      this.user_id = "";
    },
  },
  mounted() {
    if (this.$can("users.index")) {
      this.$store.dispatch("fetchUsersForSelect");
    } else if (this.isStaff) {
      this.$store.dispatch("fetchResidentials");
    }
  },
  created() {
    const residentialId = this.$route.params.id;
    if (residentialId) {
      this.loadResidentialData(residentialId);
    }
    this.isEdit = residentialId ? true : false;
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
