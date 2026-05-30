<template>
  <div class="content">
    <ValidationObserver v-slot="{ handleSubmit }">
      <form class="form-horizontal" @submit.prevent="handleSubmit(submit)">
        <card>
          <h4
            slot="header"
            class="card-title client-profile-back"
            @click="goToPortal"
          >
            <i class="tim-icons icon-minimal-left"></i>
            Mi perfil
          </h4>

          <div v-if="loading" class="card-body text-center py-4 text-muted">
            Cargando perfil...
          </div>
          <div v-else-if="loadError" class="card-body text-danger py-4">
            {{ loadError }}
          </div>
          <div v-else class="card-body">
            <p class="text-muted mb-4">
              Actualiza tus datos de contacto y sube tu documentación. El equipo
              revisará tus archivos y actualizará el estado de verificación.
            </p>

            <h5 class="info-text mb-3">Datos personales</h5>

            <div class="row">
              <label class="col-sm-3 col-form-label">Nombre completo</label>
              <div class="col-sm-9">
                <ValidationProvider
                  name="nombre completo"
                  rules="required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    v-model="full_name"
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
              <label class="col-sm-3 col-form-label">CURP</label>
              <div class="col-sm-9">
                <base-input v-model="identification_card" />
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">RFC</label>
              <div class="col-sm-9">
                <ValidationProvider
                  name="rfc"
                  rules="required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    v-model="rfc"
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
              <label class="col-sm-3 col-form-label">Email</label>
              <div class="col-sm-9">
                <ValidationProvider
                  name="email"
                  rules="email|required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    v-model="email"
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
              <label class="col-sm-3 col-form-label">Teléfono</label>
              <div class="col-sm-9">
                <ValidationProvider
                  name="telefono"
                  rules="required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    v-model="phone_number"
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
              <label class="col-sm-3 col-form-label">Fecha de nacimiento</label>
              <div class="col-sm-9">
                <el-date-picker
                  type="date"
                  placeholder="Fecha de nacimiento"
                  v-model="birthday"
                  value-format="yyyy-MM-dd"
                  class="w-100"
                />
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">Dirección</label>
              <div class="col-sm-9">
                <base-input v-model="address" />
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">Código postal</label>
              <div class="col-sm-3">
                <base-input v-model="zip_code" />
              </div>
              <label class="col-sm-2 col-form-label">Estado</label>
              <div class="col-sm-4">
                <el-select
                  class="select-primary w-100"
                  size="large"
                  placeholder="Estado"
                  v-model="state"
                  @change="updateCities"
                >
                  <el-option
                    v-for="option in states"
                    :key="option"
                    :label="option"
                    :value="option"
                  />
                </el-select>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">Ciudad</label>
              <div class="col-sm-9">
                <el-select
                  class="select-primary w-100"
                  size="large"
                  placeholder="Ciudad"
                  v-model="city"
                >
                  <el-option
                    v-for="option in cities"
                    :key="option"
                    :label="option"
                    :value="option"
                  />
                </el-select>
              </div>
            </div>

            <div class="row mb-4">
              <label class="col-sm-3 col-form-label">Estado civil</label>
              <div class="col-sm-9">
                <base-input v-model="civil_status" />
              </div>
            </div>

            <client-documents-section
              :client="clientForDocuments"
              :client-id="clientId"
              :editable="true"
              :read-only-verification="true"
              :pending-files="documentFiles"
              :field-errors="documentFieldErrors"
              @file-selected="onDocumentFileSelected"
              @field-error="onDocumentFieldError"
            />

            <p
              v-if="formErrors.length"
              class="text-danger text-center small mb-3 mt-3"
            >
              <span
                v-for="(msg, index) in formErrors"
                :key="index"
                class="d-block"
                >{{ msg }}</span
              >
            </p>

            <div class="text-center mt-4">
              <base-button
                native-type="submit"
                type="primary"
                :disabled="isSubmitting"
              >
                Guardar cambios
              </base-button>
            </div>
          </div>
        </card>
      </form>
    </ValidationObserver>
  </div>
</template>

<script>
import { extend } from "vee-validate";
import { required, email } from "vee-validate/dist/rules";
import { DatePicker, Select, Option } from "element-ui";
import { mapActions, mapGetters } from "vuex";
import locationData from "@/assets/locations_mexico.json";
import ClientDocumentsSection from "@/components/Clients/ClientDocumentsSection.vue";
import {
  CLIENT_DOCUMENTS,
  emptyDocumentsPayload,
} from "@/constants/clientDocuments";
import { extractApiErrors } from "@/util/userApi";

extend("required", required);
extend("email", email);

export default {
  name: "ClientProfile",
  components: {
    [DatePicker.name]: DatePicker,
    [Option.name]: Option,
    [Select.name]: Select,
    ClientDocumentsSection,
  },
  data() {
    return {
      loading: false,
      loadError: null,
      isSubmitting: false,
      full_name: "",
      identification_card: "",
      rfc: "",
      email: "",
      phone_number: "",
      birthday: "",
      address: "",
      zip_code: "",
      civil_status: "",
      state: "Chihuahua",
      city: "Cuauhtemoc",
      states: Object.keys(locationData),
      cities: locationData.Chihuahua || [],
      documents: emptyDocumentsPayload(),
      documentFiles: {},
      documentFieldErrors: {},
      formErrors: [],
    };
  },
  computed: {
    ...mapGetters(["currentUser", "getClientById"]),
    clientId() {
      return this.currentUser?.clientId;
    },
    clientForDocuments() {
      return {
        id: this.clientId,
        documents: this.documents,
      };
    },
  },
  created() {
    this.loadProfile();
  },
  methods: {
    ...mapActions(["fetchClientById", "updateClientProfile"]),

    goToPortal() {
      this.$router.push({ name: "ClientPortal" });
    },

    updateCities() {
      this.cities = locationData[this.state] || [];
      this.city = "";
    },

    loadProfile() {
      if (!this.clientId) {
        this.loadError =
          "Tu cuenta no está vinculada a un cliente. Contacta a soporte.";
        return;
      }
      this.loading = true;
      this.loadError = null;
      this.fetchClientById(this.clientId)
        .then((client) => {
          this.applyClient(client);
        })
        .catch((error) => {
          this.loadError =
            extractApiErrors(error).join(" ") || "No se pudo cargar tu perfil.";
        })
        .finally(() => {
          this.loading = false;
        });
    },

    applyClient(client) {
      this.full_name = client.full_name || "";
      this.identification_card = client.identification_card || "";
      this.rfc = client.rfc || "";
      this.email = client.email || "";
      this.phone_number = client.phone_number || "";
      this.birthday = client.birthday || "";
      this.address = client.address || "";
      this.zip_code = client.zip_code || "";
      this.civil_status = client.civil_status || "";
      this.state = client.state || "Chihuahua";
      this.cities = locationData[this.state] || locationData.Chihuahua || [];
      this.city = client.city || "";
      this.documents = client.documents || emptyDocumentsPayload();
    },

    buildClientPayload() {
      return {
        full_name: this.full_name,
        identification_card: this.identification_card,
        rfc: this.rfc,
        email: this.email,
        phone_number: this.phone_number,
        birthday: this.birthday,
        address: this.address,
        zip_code: this.zip_code,
        civil_status: this.civil_status,
        state: this.state,
        city: this.city,
      };
    },

    filesToUpload() {
      const files = {};
      CLIENT_DOCUMENTS.forEach((doc) => {
        const file = this.documentFiles[doc.param];
        if (!file) {
          return;
        }
        const status =
          this.documents[doc.key]?.verification_status || "pending";
        if (status === "approved") {
          return;
        }
        files[doc.param] = file;
      });
      return files;
    },

    onDocumentFileSelected({ param, file }) {
      this.$set(this.documentFiles, param, file);
    },

    onDocumentFieldError({ param, message }) {
      if (message) {
        this.$set(this.documentFieldErrors, param, message);
      } else {
        this.$delete(this.documentFieldErrors, param);
      }
    },

    async submit() {
      if (!this.clientId) {
        return;
      }
      this.isSubmitting = true;
      this.formErrors = [];

      try {
        const client = await this.updateClientProfile({
          id: this.clientId,
          client: this.buildClientPayload(),
          files: this.filesToUpload(),
          requireDocuments: false,
        });
        this.applyClient(client);
        this.documentFiles = {};
        this.$notify({
          title: "Perfil actualizado",
          type: "success",
          message: "Tus datos y documentos se guardaron correctamente.",
          icon: "tim-icons icon-bell-55",
        });
      } catch (error) {
        this.formErrors = extractApiErrors(error);
        if (error.response?.status === 403) {
          this.formErrors = [
            "No estás autorizado para actualizar este perfil.",
          ];
        }
        this.$notify({
          title: "Error",
          type: "danger",
          message: this.formErrors[0] || "No se pudo guardar el perfil.",
          icon: "tim-icons icon-bell-55",
        });
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
.client-profile-back {
  cursor: pointer;
  margin-bottom: 0;
}

.client-profile-back:hover {
  color: #e14eca !important;
}
</style>
