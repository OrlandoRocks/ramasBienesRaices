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
                  />
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
                  />
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
                  />
                </ValidationProvider>
              </div>
            </div>

            <div class="row" v-if="canManageAssignments">
              <label class="col-sm-2 col-form-label">Personal asignado</label>
              <div class="col-sm-7">
                <el-select
                  class="select-primary"
                  style="width: 100%; margin-bottom: 10px"
                  size="large"
                  v-model="user_ids"
                  multiple
                  filterable
                  collapse-tags
                  placeholder="Selecciona personal"
                  :disabled="!canEditAssignments"
                >
                  <el-option
                    v-for="option in staffOptions"
                    :key="String(option.id)"
                    :value="option.id"
                    :label="option.label"
                  />
                </el-select>
                <small class="text-muted d-block">
                  Selecciona quién puede ver y gestionar este desarrollo.
                </small>
                <small
                  v-if="!$can('users.index')"
                  class="text-muted d-block mt-1"
                >
                  Lista limitada al personal ya visto en tus desarrollos. El
                  super usuario puede asignar cualquier cuenta.
                </small>
              </div>
            </div>

            <div v-else-if="assigned_users.length" class="row">
              <label class="col-sm-2 col-form-label">Personal asignado</label>
              <div class="col-sm-7">
                <span
                  v-for="user in assigned_users"
                  :key="user.id"
                  class="badge badge-primary mr-1 mb-1"
                >
                  {{ formatAssignedUserName(user) }}
                </span>
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
import swal from "sweetalert2";
import {
  buildStaffSelectOptions,
  formatAssignedUserName,
  canManageResidentialAssignments,
} from "@/util/assignmentHelpers";
import { extractApiErrors } from "@/util/userApi";

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
      "currentUser",
    ]),
    canManageAssignments() {
      return canManageResidentialAssignments(this.currentUser);
    },
    canEditAssignments() {
      return this.canManageAssignments;
    },
  },
  data() {
    return {
      id: "",
      name: "",
      address: "",
      cost: "",
      user_ids: [],
      assigned_users: [],
      staffOptions: [],
      lands: [],
      isEdit: false,
      isSubmitting: false,
      hadAssigneesOnLoad: false,
    };
  },
  methods: {
    formatAssignedUserName,
    ...mapActions([
      "createResidential",
      "fetchResidentialById",
      "updateResidential",
      "fetchResidentials",
    ]),
    async loadStaffOptions() {
      const assignedFromList = (this.getResidentials || []).flatMap(
        (r) => r.assigned_users || []
      );
      const apiUsers = this.$can("users.index")
        ? await this.$store.dispatch("fetchUsersForSelect").then(() =>
            (this.getUsersForSelect || []).map((u) => ({
              id: u.id,
              name: u.name || u.full_name?.split(" ")[0],
              last_name: u.last_name || "",
              email: u.email,
              role_name: u.role_name,
            }))
          )
        : [];

      this.staffOptions = buildStaffSelectOptions({
        apiUsers,
        assignedUsers: [...assignedFromList, ...this.assigned_users],
      });
    },
    loadResidentialData(id) {
      this.fetchResidentialById(id)
        .then((res) => {
          this.id = res.id;
          this.name = res.name;
          this.address = res.address;
          this.cost = res.cost;
          this.lands = res.lands;
          this.user_ids = [...(res.user_ids || [])];
          this.assigned_users = res.assigned_users || [];
          this.hadAssigneesOnLoad = this.user_ids.length > 0;
          this.isEdit = true;
          return this.loadStaffOptions();
        })
        .catch((error) => {
          console.error(error);
        });
    },
    async confirmClearAssignments() {
      if (!this.hadAssigneesOnLoad || this.user_ids.length > 0) {
        return true;
      }
      const result = await swal.fire({
        title: "¿Quitar todo el personal asignado?",
        text: "Ningún vendedor o administrador podrá ver este desarrollo hasta que vuelvas a asignar personal.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, quitar asignaciones",
        cancelButtonText: "Cancelar",
        customClass: {
          confirmButton: "btn btn-warning btn-fill",
          cancelButton: "btn btn-default btn-fill",
        },
        buttonsStyling: false,
      });
      return Boolean(result.value);
    },
    async submit() {
      if (this.canManageAssignments) {
        const confirmed = await this.confirmClearAssignments();
        if (!confirmed) {
          return;
        }
      }

      this.isSubmitting = true;
      const payload = {
        residential: {
          name: this.name,
          address: this.address,
          cost: this.cost,
        },
      };

      if (this.canManageAssignments) {
        payload.residential.user_ids = this.user_ids;
      }

      if (this.isEdit) {
        payload.residential.id = this.id;
        this.updateResidential(payload)
          .then(() => {
            this.$notify({
              title: "Éxito",
              type: "success",
              message: "Fraccionamiento actualizado con éxito",
              icon: "tim-icons icon-bell-55",
            });
          })
          .catch((error) => {
            this.handleError(error, "Error al actualizar el fraccionamiento");
          });
      } else {
        this.createResidential(payload)
          .then(() => {
            this.$notify({
              title: "Éxito",
              type: "success",
              message: "Fraccionamiento creado con éxito",
              icon: "tim-icons icon-bell-55",
            });
          })
          .catch((error) => {
            this.handleError(error, "Error al crear el fraccionamiento");
            this.resetData();
          });
      }
    },
    handleError(error, fallback) {
      this.isSubmitting = false;
      const messages = extractApiErrors(error);
      this.$notify({
        title: "Error",
        type: "danger",
        message: messages[0] || fallback,
        icon: "tim-icons icon-bell-55",
      });
    },
    goToResidentials() {
      this.$router.push({ name: "Residentials" });
    },
    resetData() {
      this.name = "";
      this.address = "";
      this.cost = "";
      this.user_ids = [];
      this.assigned_users = [];
    },
  },
  async mounted() {
    await this.fetchResidentials();
    await this.loadStaffOptions();
  },
  created() {
    const residentialId = this.$route.params.id;
    if (residentialId) {
      this.loadResidentialData(residentialId);
    }
    this.isEdit = Boolean(residentialId);
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
