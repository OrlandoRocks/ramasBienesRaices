<template>
  <div class="col-md-12">
    <ValidationObserver v-slot="{ handleSubmit }">
      <form class="form-horizontal" @submit.prevent="handleSubmit(submit)">
        <card>
          <h4 slot="header" class="card-title clickable" @click="goToList">
            <i class="tim-icons icon-minimal-left" />
            {{ isEdit ? "Editar usuario" : "Nuevo usuario" }}
          </h4>

          <div v-if="formErrors.length" class="alert alert-danger">
            <div v-for="(msg, index) in formErrors" :key="index">{{ msg }}</div>
          </div>

          <div class="row">
            <label class="col-sm-2 col-form-label">Nombre</label>
            <div class="col-sm-7">
              <ValidationProvider
                name="nombre"
                rules="required"
                v-slot="{ passed, failed, errors }"
              >
                <base-input
                  v-model="name"
                  :error="errors[0]"
                  :class="[{ 'has-success': passed }, { 'has-danger': failed }]"
                />
              </ValidationProvider>
            </div>
          </div>

          <div class="row">
            <label class="col-sm-2 col-form-label">Apellido</label>
            <div class="col-sm-7">
              <ValidationProvider
                name="apellido"
                rules="required"
                v-slot="{ passed, failed, errors }"
              >
                <base-input
                  v-model="last_name"
                  :error="errors[0]"
                  :class="[{ 'has-success': passed }, { 'has-danger': failed }]"
                />
              </ValidationProvider>
            </div>
          </div>

          <div class="row">
            <label class="col-sm-2 col-form-label">Correo</label>
            <div class="col-sm-7">
              <ValidationProvider
                name="email"
                rules="required|email"
                v-slot="{ passed, failed, errors }"
              >
                <base-input
                  v-model="email"
                  :error="errors[0]"
                  :class="[{ 'has-success': passed }, { 'has-danger': failed }]"
                />
              </ValidationProvider>
            </div>
          </div>

          <div class="row">
            <label class="col-sm-2 col-form-label">Contraseña</label>
            <div class="col-sm-7">
              <ValidationProvider
                name="password"
                :rules="isEdit ? '' : 'required|min:6'"
                v-slot="{ passed, failed, errors }"
              >
                <base-input
                  type="password"
                  v-model="password"
                  :placeholder="
                    isEdit
                      ? 'Dejar en blanco para no cambiar'
                      : 'Contraseña requerida'
                  "
                  :error="errors[0]"
                  :class="[{ 'has-success': passed }, { 'has-danger': failed }]"
                />
              </ValidationProvider>
              <small v-if="isEdit" class="text-muted">
                Dejar en blanco para mantener la contraseña actual.
              </small>
            </div>
          </div>

          <div class="row">
            <label class="col-sm-2 col-form-label">Rol</label>
            <div class="col-sm-7">
              <ValidationProvider
                name="rol"
                rules="required"
                v-slot="{ errors }"
              >
                <el-select
                  class="select-primary"
                  style="width: 100%; margin-bottom: 10px"
                  v-model="role_id"
                  placeholder="Seleccionar rol"
                  size="large"
                >
                  <el-option
                    v-for="role in roles"
                    :key="role.id"
                    :label="roleLabel(role.name)"
                    :value="role.id"
                  />
                </el-select>
                <span class="error-message" v-if="errors.length">{{
                  errors[0]
                }}</span>
              </ValidationProvider>
            </div>
          </div>

          <div v-if="isClientRole" class="row">
            <label class="col-sm-2 col-form-label">Cliente (CRM)</label>
            <div class="col-sm-7">
              <ValidationProvider
                name="cliente"
                rules="required"
                v-slot="{ errors }"
              >
                <el-select
                  class="select-primary"
                  style="width: 100%; margin-bottom: 10px"
                  v-model="client_id"
                  placeholder="Seleccionar cliente"
                  size="large"
                  filterable
                >
                  <el-option
                    v-for="client in clients"
                    :key="client.id"
                    :label="client.full_name"
                    :value="client.id"
                  />
                </el-select>
                <span class="error-message" v-if="errors.length">{{
                  errors[0]
                }}</span>
              </ValidationProvider>
            </div>
          </div>

          <div class="text-center">
            <base-button
              :disabled="isSubmitting"
              native-type="submit"
              type="primary"
            >
              {{ isEdit ? "Guardar cambios" : "Crear usuario" }}
            </base-button>
          </div>
        </card>
      </form>
    </ValidationObserver>
  </div>
</template>

<script>
import { extend } from "vee-validate";
import { required, email, min } from "vee-validate/dist/rules";
import { Option, Select } from "element-ui";
import { ValidationObserver, ValidationProvider } from "vee-validate";
import { mapActions, mapGetters } from "vuex";
import { roleLabel, extractApiErrors } from "@/util/userApi";

extend("required", required);
extend("email", email);
extend("min", min);

export default {
  name: "UserForm",
  components: {
    ValidationObserver,
    ValidationProvider,
    [Select.name]: Select,
    [Option.name]: Option,
  },
  data() {
    return {
      name: "",
      last_name: "",
      email: "",
      password: "",
      role_id: null,
      client_id: null,
      roles: [],
      isEdit: false,
      isSubmitting: false,
      formErrors: [],
    };
  },
  computed: {
    ...mapGetters(["getClients", "getAssignableRoles"]),
    clients() {
      return this.getClients || [];
    },
    isClientRole() {
      const role = this.roles.find(
        (r) => String(r.id) === String(this.role_id)
      );
      return role?.name === "client";
    },
  },
  methods: {
    ...mapActions([
      "fetchUserById",
      "createUser",
      "updateUser",
      "fetchClients",
      "fetchUsers",
    ]),
    roleLabel,
    goToList() {
      this.$router.push({ name: "Users" });
    },
    buildPayload() {
      const payload = {
        name: this.name,
        last_name: this.last_name,
        email: this.email,
        role_id: this.role_id,
        client_id: this.isClientRole ? this.client_id : null,
      };
      if (this.password) {
        payload.password = this.password;
      }
      return payload;
    },
    submit() {
      this.formErrors = [];
      this.isSubmitting = true;
      const payload = this.buildPayload();
      const request = this.isEdit
        ? this.updateUser({ id: this.$route.params.id, payload })
        : this.createUser(payload);

      request
        .then(() => {
          this.$notify({
            title: "Éxito",
            type: "success",
            message: this.isEdit
              ? "Usuario actualizado correctamente"
              : "Usuario creado correctamente",
            icon: "tim-icons icon-bell-55",
          });
          this.goToList();
        })
        .catch((error) => {
          this.formErrors = extractApiErrors(error);
          if (error.response?.status === 403) {
            this.$router.replace({ name: "Dashboard" });
          }
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    },
    loadUser(id) {
      this.fetchUserById(id)
        .then(({ user, roles }) => {
          this.roles = roles;
          this.name = user.name;
          this.last_name = user.lastName;
          this.email = user.email;
          this.role_id = user.roleId;
          this.client_id = user.clientId;
          this.isEdit = true;
        })
        .catch((error) => {
          this.formErrors = extractApiErrors(error);
          if (error.response?.status === 403) {
            this.$router.replace({ name: "Dashboard" });
          }
        });
    },
    loadRolesForCreate() {
      if (this.getAssignableRoles?.length) {
        this.roles = this.getAssignableRoles;
        return;
      }
      this.fetchUsers()
        .then(({ roles }) => {
          this.roles = roles;
        })
        .catch((error) => {
          this.formErrors = extractApiErrors(error);
        });
    },
  },
  watch: {
    role_id() {
      if (!this.isClientRole) {
        this.client_id = null;
      }
    },
  },
  created() {
    const userId = this.$route.params.id;
    this.fetchClients();
    if (userId) {
      this.loadUser(userId);
    } else {
      this.loadRolesForCreate();
    }
  },
};
</script>

<style scoped>
.error-message {
  color: #fd5d93;
  font-size: 0.85rem;
}
.clickable {
  cursor: pointer;
}
</style>
