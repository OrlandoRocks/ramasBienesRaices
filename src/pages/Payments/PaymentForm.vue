<template>
  <div>
    <div class="col-md-12" v-if="payment_status_name == 'Pagado'">
      <card>
        <h4 slot="header" class="card-title">
          <b>Informacion del Pago</b>
        </h4>

        <div class="card-body">
          <div class="typography-line">
            <h3>
              <span><b>Cantidad:</b></span
              >{{ this.formatCurrency(amount) }} MXN
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Tipo de Pago:</b></span
              >{{ payment_type }}
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Comentarios:</b></span
              >{{ comments }}
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Ruta Imagen:</b></span>
              {{ image_url }}
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Fecha del Pago:</b></span
              >{{ payment_date }}
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Estatus:</b></span
              >
              <p class="text-success">
                {{ payment_status_name }}
              </p>
            </h3>
          </div>
        </div>
      </card>
    </div>
    <ValidationObserver v-slot="{ handleSubmit }" v-else>
      <form class="form-horizontal" @submit.prevent="handleSubmit(submit)">
        <card>
          <h4 slot="header" class="card-title">
            <i class="tim-icons icon-vector"></i>
            Pagos
          </h4>
          <h4 class="text-center">
            Si la cantidad de pago es mayor o menor a lo que se acordo, la
            diferencia sera reflejada en el siguiente pago
          </h4>
          <div>
            <div class="row">
              <label class="col-sm-2 col-form-label">Cantidad:</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="amount"
                  rules="required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    v-model="amount"
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
              <label class="col-sm-2 col-form-label">Tipo de Pago:</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="tipo de pago"
                  rules="required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    v-model="payment_type"
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
              <label class="col-sm-2 col-form-label">Comentarios:</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="comentarios"
                  rules="required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    v-model="comments"
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
              <label class="col-sm-2 col-form-label">Ruta Imagen:</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="imagen"
                  rules="required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    v-model="image_url"
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
              <label class="col-sm-2 col-form-label">Fecha del Pago: </label>
              <div class="col-sm-7">
                <ValidationProvider name="fecha del pago">
                  <base-input>
                    <el-date-picker
                      type="date"
                      placeholder="Fecha del Pagos"
                      v-model="payment_date"
                      value-format="yyyy-MM-dd"
                    >
                    </el-date-picker>
                  </base-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-2 col-form-label">Estatus:</label>
              <div class="col-sm-7">
                <p class="text-warning" style="padding-top: 7px">
                  {{ payment_status_name }}
                </p>
              </div>
            </div>
          </div>
          <div class="text-center">
            <base-button
              :disabled="isSubmitting"
              native-type="submit"
              type="primary"
              >Guardar</base-button
            >
          </div>
        </card>
      </form>
    </ValidationObserver>
    <div class="col-md-12">
      <card>
        <h4 slot="header" class="card-title">
          <b>Informacion del Contrato</b>
        </h4>

        <div class="card-body">
          <div class="typography-line">
            <h3>
              <span><b>Terreno:</b></span
              >{{ land_code }}
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Direccion:</b></span
              >{{ land_address }}
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Nombre del Cliente > Telefono:</b></span
              >{{ client_name }}
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Pago por mes:</b></span>
              {{ this.formatCurrency(amount) }} MXN
            </h3>
          </div>
        </div>
      </card>
    </div>
  </div>
</template>

<script>
import { Table, TableColumn, DatePicker, Option, Select } from "element-ui";
import { extend } from "vee-validate";
import { required, numeric } from "vee-validate/dist/rules";
import { mapActions, mapGetters } from "vuex";
import router from "@/router/router";
import swal from "sweetalert2";

extend("required", required);
extend("numeric", numeric);

export default {
  name: "PaymentForm",
  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [DatePicker.name]: DatePicker,
    [Select.name]: Select,
    [Option.name]: Option,
  },
  data() {
    return {
      id: "",
      amount: "",
      payment_type: "",
      comments: "",
      image_url: "",
      payment_date: "",
      status: "",
      payment_status_name: "",
      contract_id: "",
      contract: {},
      land_code: "",
      land_address: "",
      client_name: "",
      residential_name: "",
      isSubmitting: false,
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
    ...mapActions(["updatePayment", "fetchPaymentById", "createLand"]),
    loadPaymentData(id) {
      this.fetchPaymentById(id)
        .then((payment) => {
          console.log(payment);
          this.id = payment.id;
          this.amount = payment.amount;
          this.payment_date = payment.payment_date;
          this.payment_type = payment.payment_type;
          this.comments = payment.comments;
          this.image_url = payment.image_url;
          this.status = payment.status;
          this.payment_status_name = payment.payment_status_name;
          this.contract = payment.contract;
          this.land_code = payment.land_code;
          this.land_address = payment.land_address;
          this.client_name = payment.client_name;
          this.residential_name = payment.residential_name;
          this.contract_id = payment.contract.id;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    submit() {
      swal
        .fire({
          title: "Estas seguro de guardar este pago?",
          text: `No podras revertir estos cambios! \n  Monto: ${this.formatCurrency(
            this.amount
          )}, Fecha del Pago: ${this.payment_date}`,
          icon: "warning",
          showCancelButton: true,
          customClass: {
            confirmButton: "btn btn-success btn-fill",
            cancelButton: "btn btn-danger btn-fill",
          },
          confirmButtonText: "Si, Guadralo!",
          buttonsStyling: false,
        })
        .then((result) => {
          if (result.value) {
            this.handleSubmit();
            swal.fire({
              title: "Guardado!",
              text: `Monto: ${this.formatCurrency(
                this.amount
              )}, Fecha del Pago: ${this.payment_date}`,
              icon: "success",
              confirmButtonClass: "btn btn-success btn-fill",
              buttonsStyling: false,
            });
          }
        });
    },
    handleSubmit() {
      let data = {
        payment: {
          id: this.id,
          amount: this.amount,
          payment_date: this.payment_date,
          payment_type: this.payment_type,
          comments: this.comments,
          image_url: this.image_url,
          status: 1,
        },
      };
      this.isSubmitting = true;
      this.updatePayment(data)
        .then(() => {
          router.push(`/contracts/${this.contract_id}/show`);
          this.$notify({
            title: "Success",
            type: "success",
            message: "Pago Capturado con éxito",
            icon: "tim-icons icon-bell-55",
          });
        })
        .catch((error) => {
          console.log(error);
          this.isSubmitting = false;
          this.$notify({
            title: "Error",
            type: "danger",
            message: "Error al actualizar el Pago",
            icon: "tim-icons icon-bell-55",
          });
        });
    },
  },
  mounted() {
    this.$store.dispatch("fetchResidentials");
  },
  created() {
    const paymentId = this.$route.params.id;
    if (paymentId) {
      this.loadPaymentData(paymentId);
    }
  },
};
</script>

<style>
.error-message {
  color: red;
}
</style>
