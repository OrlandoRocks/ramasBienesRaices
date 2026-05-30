<template>
  <div class="col-md-12">
    <ValidationObserver v-slot="{ handleSubmit }">
      <form class="form-horizontal" @submit.prevent="handleSubmit(submit)">
        <card>
          <h4 slot="header" class="card-title clickable" @click="goToClients">
            <i class="tim-icons icon-minimal-left"></i>
            Clientes
          </h4>
          <div>
            <div class="row">
              <label class="col-sm-2 col-form-label">Nombre Completo:</label>
              <div class="col-sm-4">
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
                  ></base-input>
                </ValidationProvider>
              </div>
              <label class="col-sm-2 col-form-label">RFC:</label>
              <div class="col-sm-4">
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
                  ></base-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-2 col-form-label">Email:</label>
              <div class="col-sm-4">
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
                  ></base-input>
                </ValidationProvider>
              </div>

              <label class="col-sm-2 col-form-label">Telefono:</label>
              <div class="col-sm-4">
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
                  ></base-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-2 col-form-label"
                >Fecha de Nacimiento:</label
              >
              <div class="col-sm-4">
                <ValidationProvider name="bithday">
                  <base-input>
                    <el-date-picker
                      type="date"
                      placeholder="Fecha de Nacimiento"
                      v-model="birthday"
                      value-format="yyyy-MM-dd"
                    >
                    </el-date-picker>
                  </base-input>
                </ValidationProvider>
              </div>
              <label class="col-sm-2 col-form-label">Codigo:</label>
              <div class="col-sm-4">
                <ValidationProvider
                  name="codigo"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    v-model="code"
                    :error="errors[0]"
                    :class="[
                      { 'has-success': passed },
                      { 'has-danger': failed },
                    ]"
                  ></base-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-2 col-form-label">Dirección:</label>
              <div class="col-sm-4">
                <ValidationProvider
                  name="direccion"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    v-model="address"
                    :error="errors[0]"
                    :class="[
                      { 'has-success': passed },
                      { 'has-danger': failed },
                    ]"
                  ></base-input>
                </ValidationProvider>
              </div>
              <label class="col-sm-2 col-form-label">Codigo Postal:</label>
              <div class="col-sm-4">
                <ValidationProvider
                  name="codigo"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    v-model="zip_code"
                    :error="errors[0]"
                    :class="[
                      { 'has-success': passed },
                      { 'has-danger': failed },
                    ]"
                  ></base-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-2 col-form-label">Estado:</label>
              <div class="col-sm-4">
                <el-select
                  class="select-primary"
                  style="width: 100%; margin-bottom: 10px"
                  size="large"
                  placeholder="Seleccionar Estado..."
                  v-model="state"
                  @change="updateCities"
                >
                  <el-option
                    v-for="option in states"
                    class="select-primary"
                    :value="option"
                    :label="option"
                    :key="option"
                  >
                  </el-option>
                </el-select>
              </div>
              <label class="col-sm-2 col-form-label">Ciudad:</label>
              <div class="col-sm-4">
                <el-select
                  class="select-primary"
                  style="width: 100%; margin-bottom: 10px"
                  size="large"
                  placeholder="Seleccionar Ciudad..."
                  v-model="city"
                >
                  <el-option
                    v-for="option in cities"
                    class="select-primary"
                    :value="option"
                    :label="option"
                    :key="option"
                  >
                  </el-option>
                </el-select>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-2 col-form-label">Estado Civil:</label>
              <div class="col-sm-4">
                <ValidationProvider
                  name="estado civil"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    v-model="civil_status"
                    :error="errors[0]"
                    :class="[
                      { 'has-success': passed },
                      { 'has-danger': failed },
                    ]"
                  ></base-input>
                </ValidationProvider>
              </div>
            </div>

            <div v-if="canManageResidentialLinks" class="row">
              <label class="col-sm-2 col-form-label"
                >Fraccionamientos vinculados</label
              >
              <div class="col-sm-7">
                <el-select
                  class="select-primary"
                  style="width: 100%; margin-bottom: 10px"
                  size="large"
                  v-model="residential_ids"
                  multiple
                  filterable
                  collapse-tags
                  placeholder="Seleccionar desarrollos"
                >
                  <el-option
                    v-for="res in residentialOptions"
                    :key="String(res.id)"
                    :label="res.name"
                    :value="res.id"
                  />
                </el-select>
                <small class="text-muted d-block">
                  El cliente solo será visible para el personal asignado a estos
                  desarrollos.
                </small>
              </div>
            </div>

            <client-documents-section
              v-if="canManageDocuments"
              :client="clientForDocuments"
              :client-id="id || null"
              :editable="true"
              :pending-files="documentFiles"
              :verification-statuses="verificationStatuses"
              :field-errors="documentFieldErrors"
              @file-selected="onDocumentFileSelected"
              @field-error="onDocumentFieldError"
              @verification-change="onVerificationChange"
            />

            <p
              v-if="formErrors.length"
              class="text-danger text-center small mb-3"
            >
              <span
                v-for="(msg, index) in formErrors"
                :key="index"
                class="d-block"
                >{{ msg }}</span
              >
            </p>

            <div class="text-center">
              <base-button
                :disabled="isSubmitting"
                native-type="submit"
                type="primary"
                >{{ isEdit ? "Editar" : "Crear" }} Cliente</base-button
              >
            </div>
          </div>
        </card>
      </form>
    </ValidationObserver>
  </div>
</template>

<script>
import { extend } from "vee-validate";
import {
  required,
  double,
  regex,
  confirmed,
  email,
} from "vee-validate/dist/rules";
import { DatePicker, Select, Option } from "element-ui";
import { mapActions, mapGetters } from "vuex";
import locationData from "@/assets/locations_mexico.json";
import ClientDocumentsSection from "@/components/Clients/ClientDocumentsSection.vue";
import { validateClientDocuments } from "@/util/clientDocumentValidation";
import { extractApiErrors } from "@/util/userApi";
import { emptyDocumentsPayload } from "@/constants/clientDocuments";

extend("required", required);
extend("email", email);
extend("double", double);
extend("regex", regex);
extend("confirmed", confirmed);

export default {
  name: "ClientForm",
  components: {
    [DatePicker.name]: DatePicker,
    [Option.name]: Option,
    [Select.name]: Select,
    ClientDocumentsSection,
  },
  computed: {
    ...mapGetters(["getClientById", "getResidentials", "currentUser"]),
    canManageDocuments() {
      return this.$can("clients.create") || this.$can("clients.update");
    },
    canManageResidentialLinks() {
      return this.$canManageClientResidentialLinks();
    },
    residentialOptions() {
      return this.getResidentials || [];
    },
    clientForDocuments() {
      return {
        id: this.id,
        documents: this.documents,
      };
    },
  },
  data() {
    return {
      full_name: "",
      states: Object.keys(locationData),
      cities: locationData["Chihuahua"],
      images: {
        regular: null,
        avatar: null,
      },
      id: "",
      code: "",
      email: "",
      rfc: "",
      phone_number: "",
      birthday: "",
      address: "",
      zip_code: "",
      civil_status: "",
      credential: "",
      state: "Chihuahua",
      city: "Cuauhtemoc",
      image: "",
      lands: [],
      isEdit: false,
      isSubmitting: false,
      documents: emptyDocumentsPayload(),
      documentFiles: {},
      documentFieldErrors: {},
      verificationStatuses: {},
      residential_ids: [],
      formErrors: [],
    };
  },
  methods: {
    ...mapActions([
      "createClient",
      "fetchLands",
      "fetchClientById",
      "updateClient",
      "fetchResidentials",
      "getPresignedUrl",
      "uploadFileToS3",
    ]),

    updateCities() {
      this.cities = locationData[this.state];
      this.city = "";
    },

    loadClientData(id) {
      this.fetchClientById(id)
        .then((res) => {
          this.id = res.id;
          this.full_name = res.full_name;
          this.code = res.code;
          this.email = res.email;
          this.rfc = res.rfc;
          this.phone_number = res.phone_number;
          this.birthday = res.birthday;
          this.address = res.address;
          this.zip_code = res.zip_code;
          this.civil_status = res.civil_status;
          this.state = res.state;
          this.city = res.city;
          this.image = res.image;
          this.documents = res.documents || emptyDocumentsPayload();
          this.residential_ids = [...(res.residential_ids || [])];
          this.verificationStatuses = {
            ine_verification_status: res.ine_verification_status,
            tax_document_verification_status:
              res.tax_document_verification_status,
            proof_of_address_verification_status:
              res.proof_of_address_verification_status,
          };
          this.isEdit = true;
        })
        .catch((error) => {
          this.formErrors = extractApiErrors(error);
        });
    },

    buildClientPayload() {
      const payload = {
        full_name: this.full_name,
        code: this.code,
        email: this.email,
        rfc: this.rfc,
        phone_number: this.phone_number,
        birthday: this.birthday,
        address: this.address,
        zip_code: this.zip_code,
        civil_status: this.civil_status,
        state: this.state,
        city: this.city,
        image: this.image,
      };
      if (this.canManageDocuments) {
        Object.assign(payload, this.verificationStatuses);
      }
      if (this.canManageResidentialLinks) {
        payload.residential_ids = this.residential_ids;
      }
      return payload;
    },

    filesToUpload() {
      const files = {};
      Object.entries(this.documentFiles).forEach(([param, file]) => {
        if (file) {
          files[param] = file;
        }
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

    onVerificationChange({ field, value }) {
      this.$set(this.verificationStatuses, field, value);
    },

    validateDocumentsBeforeSubmit() {
      this.formErrors = [];
      this.documentFieldErrors = {};

      if (!this.canManageDocuments) {
        return true;
      }

      const files = this.filesToUpload();
      const requireAll = !this.isEdit;
      const errors = validateClientDocuments(files, { requireAll });

      if (requireAll) {
        this.formErrors = errors;
        return errors.length === 0;
      }

      if (errors.length) {
        this.formErrors = errors;
        return false;
      }
      return true;
    },

    handleSubmitError(error) {
      this.isSubmitting = false;
      if (error.response?.status === 403) {
        this.formErrors = ["No estás autorizado para realizar esta acción."];
        return;
      }
      this.formErrors = extractApiErrors(error);
      this.$notify({
        title: "Error",
        type: "danger",
        message: this.formErrors[0] || "No se pudo guardar el cliente",
        icon: "tim-icons icon-bell-55",
      });
    },

    async submit() {
      if (!this.validateDocumentsBeforeSubmit()) {
        return;
      }

      this.isSubmitting = true;
      this.formErrors = [];

      const payload = {
        client: this.buildClientPayload(),
        files: this.filesToUpload(),
        requireDocuments: !this.isEdit && this.canManageDocuments,
      };

      try {
        if (this.isEdit) {
          await this.updateClient({ id: this.id, ...payload });
          this.$notify({
            title: "Éxito",
            type: "success",
            message: "Cliente actualizado con éxito",
            icon: "tim-icons icon-bell-55",
          });
        } else {
          await this.createClient(payload);
          this.$notify({
            title: "Éxito",
            type: "success",
            message: "El cliente fue creado con éxito",
            icon: "tim-icons icon-bell-55",
          });
        }
      } catch (error) {
        this.handleSubmitError(error);
      }
    },
    onImageChange(file) {
      this.images.regular = file;
      this.image = file;
    },
    goToClients() {
      this.$router.push({ name: "Clients" });
    },
    resetData() {
      this.full_name = "";
      this.code = "";
      this.email = "";
      this.rfc = "";
      this.phone_number = "";
      this.birthday = "";
      this.address = "";
      this.zip_code = "";
      this.civil_status = "";
      this.state = "Chihuahua";
      this.city = "Cuauhtemoc";
      this.image = "";
      this.documents = emptyDocumentsPayload();
      this.documentFiles = {};
      this.documentFieldErrors = {};
      this.verificationStatuses = {};
      this.formErrors = [];
      this.residential_ids = [];
    },
  },
  created() {
    if (this.canManageResidentialLinks) {
      this.fetchResidentials();
    }
    if (this.$route.params.id) {
      this.id = this.$route.params.id;
      this.loadClientData(this.id);
    }
  },
};
</script>

<style scoped>
.clickable {
  cursor: pointer;
}
.clickable:hover {
  color: #e14eca !important;
}
</style>
