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
                  rules=""
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
                <ValidationProvider
                  name="bithday"
                >
                  <base-input>
                    <el-date-picker
                      type="date"
                      placeholder="Fecha de Nacimiento"
                      v-model="birthday"
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
              <label class="col-sm-2 col-form-label"
              >Dirección:</label
              >
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
              <label class="col-sm-2 col-form-label">Estado Civil:</label
              >
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

            <div class="row">
              <label class="col-sm-2 col-form-label">Credencial:</label>
              <div class="col-sm-7">
                <image-upload
                  @change="onImageChange"
                  select-text="Seleccionar Imagen"
                />
              </div>
            </div>

            <div class="text-center">
              <base-button
                :disabled="isSubmitting"
                native-type="submit"
                type="primary"
                >Crear Cliente</base-button
              >
            </div>
          </div>
        </card>
        <div>{{ image }}</div>
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
import { ImageUpload } from "src/components/index";
import locationData from "@/assets/locations_mexico.json";

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
    ImageUpload,
  },
  computed: {
    ...mapGetters(["getClientById"]),
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
      code: "",
      email: "",
      rfc: "",
      phone_number: "",
      birthday: "",
      address: "",
      zip_code: "",
      civil_status: "",
      state: "Chihuahua",
      city: "Cuauhtemoc",
      image: "",
      lands: [],
      isSubmitting: false,
    };
  },
  methods: {
    ...mapActions([
      "createClient",
      "fetchLands",
      "getPresignedUrl",
      "uploadFileToS3",
    ]),

    updateCities() {
      this.cities = locationData[this.state];
      this.city = "";
    },

    async submit() {
      this.isSubmitting = true;
      const imageFile = this.image;
      this.$store
        .dispatch("s3/getPresignedUrl", this.image.name)
        .then((presignedUrl) => {
          this.$store
            .dispatch("s3/uploadFileToS3", {
              url: presignedUrl.url,
              file: imageFile,
            })
            .then((response) => {
              console.log(response);
              this.image = response.config.url;
              this.createClient({
                full_name: this.full_name,
                code: this.code,
                email: this.email,
                phone_number: this.phone_number,
                birthday: this.birthday,
                image: this.image,
                rfc: this.rfc,
                address: this.address,
                zip_code: this.zip_code,
                civil_status: this.civil_status,
                state: this.state,
                city: this.city,
              });
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          console.log(error);
        });
      // await this.createClient({
      //   full_name: this.full_name,
      //   code: this.code,
      //   email: this.email,
      //   phone: this.phone,
      //   birthday: this.birthday,
      //   image: this.image,
      // });
      this.isSubmitting = false;
    },
    onImageChange(file) {
      this.images.regular = file;
      this.image = file;
    },
    goToClients() {
      this.$router.push({ name: "Clients" });
    },
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
