<template>
  <div class="content">
    <div v-if="canManagePayments" class="col-md-10 ml-auto mr-auto">
      <card>
        <h4 slot="header" class="card-title">
          <i class="tim-icons icon-money-coins" />
          Administrar pago
        </h4>
        <payment-edit-form
          v-if="validPaymentId"
          :payment-id="validPaymentId"
          @success="handleManageSuccess"
          @cancel="goBack"
        />
      </card>
    </div>

    <template v-else>
      <div class="col-md-12" v-if="payment_status_name == 'Pagado'">
        <card>
          <h4 slot="header" class="card-title">
            <b>Informacion del Pago</b>
          </h4>
          <div class="card-body">
            <div class="typography-line">
              <h3>
                <span><b>Cantidad:</b></span>
                {{ formatCurrency(amount) }} MXN
              </h3>
            </div>
            <div class="typography-line">
              <h3>
                <span><b>Tipo de Pago:</b></span>
                {{ payment_type }}
              </h3>
            </div>
            <div class="typography-line">
              <h3>
                <span><b>Comentarios:</b></span>
                {{ comments }}
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
                <span><b>Fecha del Pago:</b></span>
                {{ payment_date }}
              </h3>
            </div>
            <div class="typography-line">
              <h3>
                <span><b>Estatus:</b></span>
                <p class="text-success">{{ payment_status_name }}</p>
              </h3>
            </div>
          </div>
        </card>
      </div>

      <ValidationObserver v-slot="{ handleSubmit }" v-else>
        <form
          class="form-horizontal"
          @submit.prevent="handleSubmit(submitCapture)"
        >
          <card>
            <h4 slot="header" class="card-title">
              <i class="tim-icons icon-vector"></i>
              Capturar pago
            </h4>
            <h4 class="text-center">
              Si la cantidad de pago es mayor o menor a lo acordado, la
              diferencia sera reflejada en el siguiente pago
            </h4>
            <div class="payment-capture-form">
              <div class="row form-field-row">
                <label class="col-sm-2 col-form-label payment-form-label"
                  >Cantidad:</label
                >
                <div class="col-sm-7">
                  <ValidationProvider
                    name="amount"
                    rules="required|positiveAmount"
                    v-slot="{ passed, failed, errors }"
                  >
                    <base-input
                      v-model="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      :error="errors[0]"
                      :class="[
                        { 'has-success': passed },
                        { 'has-danger': failed },
                      ]"
                    />
                  </ValidationProvider>
                </div>
              </div>
              <div class="row form-field-row">
                <label class="col-sm-2 col-form-label payment-form-label"
                  >Tipo de Pago:</label
                >
                <div class="col-sm-7">
                  <ValidationProvider
                    name="tipo de pago"
                    rules="required"
                    v-slot="{ passed, failed, errors }"
                  >
                    <base-input
                      v-model="payment_type"
                      :error="errors[0]"
                      :class="[
                        { 'has-success': passed },
                        { 'has-danger': failed },
                      ]"
                    />
                  </ValidationProvider>
                </div>
              </div>
              <div class="row form-field-row">
                <label class="col-sm-2 col-form-label payment-form-label"
                  >Comentarios:</label
                >
                <div class="col-sm-7">
                  <ValidationProvider
                    name="comentarios"
                    rules="required"
                    v-slot="{ passed, failed, errors }"
                  >
                    <base-input
                      v-model="comments"
                      :error="errors[0]"
                      :class="[
                        { 'has-success': passed },
                        { 'has-danger': failed },
                      ]"
                    />
                  </ValidationProvider>
                </div>
              </div>
              <div class="row form-field-row">
                <label class="col-sm-2 col-form-label payment-form-label"
                  >Ruta Imagen:</label
                >
                <div class="col-sm-7">
                  <ValidationProvider
                    name="imagen"
                    rules="required"
                    v-slot="{ passed, failed, errors }"
                  >
                    <base-input
                      v-model="image_url"
                      :error="errors[0]"
                      :class="[
                        { 'has-success': passed },
                        { 'has-danger': failed },
                      ]"
                    />
                  </ValidationProvider>
                </div>
              </div>
              <div class="row form-field-row">
                <label class="col-sm-2 col-form-label payment-form-label"
                  >Fecha del Pago:</label
                >
                <div class="col-sm-7">
                  <div class="field-control">
                    <el-date-picker
                      type="date"
                      placeholder="Fecha del Pago"
                      v-model="payment_date"
                      value-format="yyyy-MM-dd"
                      class="payment-form-date"
                    />
                  </div>
                </div>
              </div>
              <div class="row form-field-row">
                <label class="col-sm-2 col-form-label payment-form-label"
                  >Estatus:</label
                >
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
              >
                Guardar
              </base-button>
            </div>
          </card>
        </form>
      </ValidationObserver>

      <div class="col-md-12" v-if="land_code">
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
                <span><b>Cliente:</b></span
                >{{ client_name }}
              </h3>
            </div>
          </div>
        </card>
      </div>
    </template>
  </div>
</template>

<script>
import { extend } from "vee-validate";
import { required } from "vee-validate/dist/rules";
import { DatePicker } from "element-ui";
import { ValidationObserver, ValidationProvider } from "vee-validate";
import { mapActions } from "vuex";
import swal from "sweetalert2";
import PaymentEditForm from "@/components/Payments/PaymentEditForm.vue";
import { normalizePaymentAmount } from "@/util/paymentApi";

extend("required", required);
extend("positiveAmount", {
  validate(value) {
    const num = parseFloat(value);
    return !Number.isNaN(num) && num > 0;
  },
  message: "La cantidad debe ser un número mayor a cero",
});

function isValidPaymentId(id) {
  if (id === null || id === undefined || id === "") {
    return false;
  }
  const normalized = String(id).trim();
  return (
    normalized !== "" && normalized !== "undefined" && normalized !== "null"
  );
}

export default {
  name: "PaymentForm",
  components: {
    ValidationObserver,
    ValidationProvider,
    PaymentEditForm,
    [DatePicker.name]: DatePicker,
  },
  data() {
    return {
      id: "",
      amount: "",
      payment_type: "",
      comments: "",
      image_url: "",
      payment_date: "",
      payment_status_name: "",
      contract_id: "",
      land_code: "",
      land_address: "",
      client_name: "",
      residential_name: "",
      isSubmitting: false,
    };
  },
  computed: {
    canManagePayments() {
      return this.$can("payments.update");
    },
    validPaymentId() {
      return this.id || this.$route.params.id;
    },
  },
  methods: {
    ...mapActions(["updatePayment", "fetchPaymentById"]),
    loadPaymentData(id) {
      this.fetchPaymentById(id)
        .then((payment) => {
          this.id = payment.id;
          this.amount = normalizePaymentAmount(payment.amount);
          this.payment_date =
            payment.payment_date || new Date().toISOString().slice(0, 10);
          this.payment_type = payment.payment_type;
          this.comments = payment.comments;
          this.image_url = payment.image_url;
          this.payment_status_name = payment.payment_status_name;
          this.land_code = payment.land_code;
          this.land_address = payment.land_address;
          this.client_name = payment.client_name;
          this.residential_name = payment.residential_name;
          this.contract_id = payment.contract_id || payment.contract?.id || "";
        })
        .catch(() => {
          this.$notify({
            title: "Error",
            type: "danger",
            message: "No se pudo cargar el pago",
          });
        });
    },
    goBack() {
      const returnTo = this.$route.query.returnTo;
      const landId = this.$route.query.landId;
      if (returnTo === "land" && landId) {
        this.$router.push({ name: "EditLand", params: { id: landId } });
      } else if (returnTo === "contract" && this.$route.query.contractId) {
        this.$router.push({
          name: "ShowContract",
          params: { id: this.$route.query.contractId },
        });
      } else {
        this.$router.push({ name: "Payments" });
      }
    },
    handleManageSuccess() {
      this.goBack();
    },
    submitCapture() {
      if (!this.$can("payments.capture")) {
        this.$notify({
          title: "Sin permiso",
          type: "warning",
          message: "No tienes permiso para capturar pagos.",
        });
        return;
      }

      swal
        .fire({
          title: "¿Guardar este pago?",
          text: `Monto: ${this.formatCurrency(this.amount)}, Fecha: ${
            this.payment_date
          }`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, guardar",
          cancelButtonText: "Cancelar",
        })
        .then((result) => {
          if (result.value) {
            this.saveCapture();
          }
        });
    },
    saveCapture() {
      const paymentId = this.validPaymentId;
      if (!isValidPaymentId(paymentId)) {
        this.$notify({
          title: "Error",
          type: "danger",
          message: "No se encontró el pago a actualizar",
        });
        return;
      }

      this.isSubmitting = true;
      this.updatePayment({
        id: paymentId,
        payment: {
          id: paymentId,
          amount: this.amount,
          payment_date: this.payment_date,
          payment_type: this.payment_type,
          comments: this.comments,
          image_url: this.image_url,
          status: "Pagado",
        },
      })
        .then(() => {
          this.$notify({
            title: "Éxito",
            type: "success",
            message: "Pago capturado con éxito",
          });
          this.goBack();
        })
        .catch(() => {
          this.$notify({
            title: "Error",
            type: "danger",
            message: "Error al capturar el pago",
          });
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    },
  },
  created() {
    const paymentId = this.$route.params.id;
    if (isValidPaymentId(paymentId)) {
      this.id = paymentId;
      if (!this.canManagePayments) {
        this.loadPaymentData(paymentId);
      }
    } else {
      this.$notify({
        title: "Error",
        type: "danger",
        message: "Pago no válido.",
      });
    }
  },
};
</script>

<style scoped>
.error-message {
  color: red;
}

.payment-capture-form .payment-form-label {
  color: #1a1a1a !important;
  font-weight: 600;
}

.payment-capture-form .form-field-row {
  margin-bottom: 1.25rem;
}

.payment-capture-form .field-control {
  width: 100%;
  display: block;
}

.payment-capture-form .payment-form-date {
  width: 100% !important;
}

.payment-capture-form ::v-deep .el-date-editor.el-input {
  width: 100%;
  display: block;
}

.payment-capture-form ::v-deep .form-control,
.payment-capture-form ::v-deep input.form-control,
.payment-capture-form ::v-deep textarea.form-control {
  color: #1a1a1a !important;
  -webkit-text-fill-color: #1a1a1a;
}

.payment-capture-form ::v-deep .form-control::placeholder,
.payment-capture-form ::v-deep textarea.form-control::placeholder {
  color: #6c757d !important;
  -webkit-text-fill-color: #6c757d;
  opacity: 1;
}

.payment-capture-form ::v-deep .el-input__inner {
  color: #1a1a1a !important;
  -webkit-text-fill-color: #1a1a1a;
}
</style>
