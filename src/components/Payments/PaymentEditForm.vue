<template>
  <div v-loading="loading" class="payment-edit-form">
    <div v-if="loadError" class="alert alert-danger">{{ loadError }}</div>

    <div v-if="paymentSummary" class="mb-3">
      <span :class="statusBadgeClass(editForm.status)">
        {{ editForm.status }}
      </span>
      <p class="text-muted mb-0 mt-2" v-if="paymentSummary.client_name">
        {{ paymentSummary.client_name }}
      </p>
      <p class="text-muted mb-0" v-if="paymentSummary.land_code">
        {{ paymentSummary.residential_name }} — Lote {{ paymentSummary.land_code }}
      </p>
    </div>

    <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
      <form @submit.prevent="handleSubmit(submit)">
        <div v-if="formErrors.length" class="alert alert-danger">
          <div v-for="(msg, idx) in formErrors" :key="idx">{{ msg }}</div>
        </div>

        <div class="row form-field-row">
          <label class="col-sm-3 col-form-label payment-form-label">Estatus</label>
          <div class="col-sm-8">
            <div class="field-control">
              <el-select
                v-model="editForm.status"
                class="select-primary payment-form-select"
                placeholder="Estatus"
                @change="handleStatusChange"
              >
                <el-option
                  v-for="status in statusOptions"
                  :key="status"
                  :label="status"
                  :value="status"
                />
              </el-select>
            </div>
          </div>
        </div>

        <div class="row form-field-row">
          <label class="col-sm-3 col-form-label payment-form-label">Cantidad</label>
          <div class="col-sm-8">
            <ValidationProvider
              name="cantidad"
              rules="required|positiveAmount"
              v-slot="{ passed, failed, errors }"
            >
              <base-input
                v-model="editForm.amount"
                type="number"
                step="0.01"
                min="0.01"
                :error="errors[0]"
                :class="[{ 'has-success': passed }, { 'has-danger': failed }]"
              />
            </ValidationProvider>
            <small class="text-muted field-hint">
              Si cambia el monto, el siguiente pago pendiente se ajustará automáticamente.
            </small>
          </div>
        </div>

        <div class="row form-field-row">
          <label class="col-sm-3 col-form-label payment-form-label">Fecha de pago</label>
          <div class="col-sm-8">
            <div class="field-control">
              <el-date-picker
                v-model="editForm.payment_date"
                type="date"
                placeholder="Fecha"
                value-format="yyyy-MM-dd"
                class="payment-form-date"
              />
            </div>
          </div>
        </div>

        <div v-if="showPaidFields" class="row form-field-row">
          <label class="col-sm-3 col-form-label payment-form-label">Tipo de pago</label>
          <div class="col-sm-8">
            <ValidationProvider
              name="tipo"
              :rules="showPaidFields ? 'required' : ''"
              v-slot="{ passed, failed, errors }"
            >
              <base-input
                v-model="editForm.payment_type"
                :error="errors[0]"
                :class="[{ 'has-success': passed }, { 'has-danger': failed }]"
              />
            </ValidationProvider>
          </div>
        </div>

        <div v-if="showPaidFields" class="row form-field-row">
          <label class="col-sm-3 col-form-label payment-form-label">Comentarios</label>
          <div class="col-sm-8">
            <base-input v-model="editForm.comments" type="textarea" />
          </div>
        </div>

        <div v-if="showPaidFields" class="row form-field-row">
          <label class="col-sm-3 col-form-label payment-form-label">Comprobante (URL)</label>
          <div class="col-sm-8">
            <ValidationProvider
              name="imagen"
              :rules="editForm.status === 'Pagado' ? 'required' : ''"
              v-slot="{ passed, failed, errors }"
            >
              <base-input
                v-model="editForm.image_url"
                placeholder="URL del comprobante"
                :error="errors[0]"
                :class="[{ 'has-success': passed }, { 'has-danger': failed }]"
              />
            </ValidationProvider>
            <small v-if="editForm.status === 'Pagado'" class="text-muted field-hint">
              Se recomienda adjuntar comprobante cuando el pago está marcado como Pagado.
            </small>
          </div>
        </div>

        <div class="text-center mt-4">
          <base-button
            v-if="showCancel"
            type="default"
            class="mr-2"
            :disabled="saving"
            @click.prevent="$emit('cancel')"
          >
            Cancelar
          </base-button>
          <base-button native-type="submit" type="primary" :disabled="saving">
            <span v-if="saving">Guardando...</span>
            <span v-else>{{ submitLabel }}</span>
          </base-button>
        </div>
      </form>
    </ValidationObserver>
  </div>
</template>

<script>
import { extend } from "vee-validate";
import { required } from "vee-validate/dist/rules";
import { ValidationObserver, ValidationProvider } from "vee-validate";
import { DatePicker, Option, Select } from "element-ui";
import { swalAboveDialog } from "@/util/swalDialog";
import paymentsService from "@/services/paymentsService";
import {
  PAYMENT_STATUSES,
  statusBadgeClass,
  formatPaymentFromApi,
  editFormFromPayment,
  emptyEditForm,
  isPaidStatus,
  normalizePaymentAmount,
  extractApiErrors,
} from "@/util/paymentApi";

extend("required", required);
extend("positiveAmount", {
  validate(value) {
    const num = parseFloat(value);
    return !Number.isNaN(num) && num > 0;
  },
  message: "La cantidad debe ser un número mayor a cero",
});

export default {
  name: "PaymentEditForm",
  components: {
    ValidationObserver,
    ValidationProvider,
    [DatePicker.name]: DatePicker,
    [Select.name]: Select,
    [Option.name]: Option,
  },
  props: {
    paymentId: {
      type: [String, Number],
      required: true,
    },
    showCancel: {
      type: Boolean,
      default: true,
    },
    captureMode: {
      type: Boolean,
      default: false,
    },
    initialPayment: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      loading: false,
      saving: false,
      loadError: null,
      formErrors: [],
      paymentSummary: null,
      originalStatus: "Pendiente",
      editForm: emptyEditForm(),
      statusOptions: PAYMENT_STATUSES,
    };
  },
  computed: {
    showPaidFields() {
      return isPaidStatus(this.editForm.status);
    },
    submitLabel() {
      return this.captureMode ? "Capturar pago" : "Guardar cambios";
    },
  },
  watch: {
    paymentId: {
      immediate: true,
      handler(id) {
        if (id) {
          this.applyInitialPayment();
          this.loadPayment(id);
        }
      },
    },
    initialPayment: {
      deep: true,
      handler() {
        this.applyInitialPayment();
      },
    },
  },
  methods: {
    statusBadgeClass,
    applyInitialPayment() {
      if (!this.initialPayment) {
        return;
      }
      const amount = normalizePaymentAmount(
        this.initialPayment.amount ?? this.initialPayment.total
      );
      if (amount !== "") {
        this.editForm.amount = amount;
      }
      if (this.initialPayment.payment_date) {
        this.editForm.payment_date = this.initialPayment.payment_date;
      }
      if (this.initialPayment.payment_status_name || this.initialPayment.status) {
        this.editForm.status =
          this.initialPayment.payment_status_name || this.initialPayment.status;
      }
    },
    async loadPayment(id) {
      this.loading = true;
      this.loadError = null;
      try {
        const response = await paymentsService.get(id);
        const payment = formatPaymentFromApi(response.data);
        this.paymentSummary = payment;
        this.editForm = editFormFromPayment(payment);
        this.originalStatus = payment.payment_status_name;

        if (this.captureMode && this.editForm.status === "Pendiente") {
          this.editForm.status = "Pagado";
        }
        if (this.captureMode && !this.editForm.payment_date) {
          this.editForm.payment_date = new Date().toISOString().slice(0, 10);
        }
      } catch (error) {
        this.loadError = extractApiErrors(error).join(" ");
      } finally {
        this.loading = false;
      }
    },
    handleStatusChange(newStatus) {
      if (newStatus === "Pendiente" && isPaidStatus(this.originalStatus)) {
        this.editForm.payment_type = "";
        this.editForm.comments = "";
        this.editForm.image_url = "";
      }
    },
    buildPayload() {
      const payload = {
        amount: this.editForm.amount,
        payment_date: this.editForm.payment_date || null,
        status: this.editForm.status,
        payment_type: this.editForm.payment_type || "",
        comments: this.editForm.comments || "",
        image_url: this.editForm.image_url || "",
      };

      if (payload.status === "Pendiente") {
        payload.payment_type = "";
        payload.comments = "";
        payload.image_url = "";
      }

      return payload;
    },
    async confirmPagadoToPendiente() {
      if (
        !isPaidStatus(this.originalStatus) ||
        this.editForm.status !== "Pendiente"
      ) {
        return true;
      }
      const result = await swalAboveDialog.fire({
        title: "¿Marcar como Pendiente?",
        text:
          "Se borrarán el tipo de pago, comentarios y comprobante asociados a este pago.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, continuar",
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
      const permission = this.captureMode ? "payments.capture" : "payments.update";
      if (!this.$can(permission)) {
        this.$notify({
          title: "Sin permiso",
          type: "warning",
          message: "No tienes permiso para actualizar pagos.",
        });
        return;
      }

      const confirmed = await this.confirmPagadoToPendiente();
      if (!confirmed) {
        return;
      }

      this.formErrors = [];
      this.saving = true;
      try {
        const response = await paymentsService.patch(
          this.paymentId,
          this.buildPayload()
        );
        const updated = formatPaymentFromApi(response.data);
        this.originalStatus = updated.payment_status_name;
        this.$store.commit("updateContractPayment", updated);
        this.$store.commit("setPaymentUpdate", updated);
        this.$emit("success", updated);
        this.$emit("close");
        this.$notify({
          title: "Éxito",
          type: "success",
          message: this.captureMode
            ? "Pago capturado correctamente"
            : "Pago actualizado correctamente",
          icon: "tim-icons icon-bell-55",
        });
      } catch (error) {
        this.formErrors = extractApiErrors(error);
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.payment-edit-form .payment-form-label {
  color: #1a1a1a !important;
  font-weight: 600;
}

.payment-edit-form .form-field-row {
  margin-bottom: 1.25rem;
}

.payment-edit-form .field-control {
  width: 100%;
  display: block;
}

.payment-edit-form .payment-form-select,
.payment-edit-form .payment-form-date {
  width: 100% !important;
  display: block;
}

.payment-edit-form .field-hint {
  display: block;
  margin-top: 0.35rem;
}

.payment-edit-form ::v-deep .el-select {
  width: 100%;
  display: block;
  margin-bottom: 0;
}

.payment-edit-form ::v-deep .el-date-editor.el-input {
  width: 100%;
  display: block;
  margin-bottom: 0;
}

.payment-edit-form ::v-deep .form-group {
  margin-bottom: 0;
}

.payment-edit-form ::v-deep .form-control,
.payment-edit-form ::v-deep input.form-control,
.payment-edit-form ::v-deep textarea.form-control {
  color: #1a1a1a !important;
  -webkit-text-fill-color: #1a1a1a;
}

.payment-edit-form ::v-deep .form-control::placeholder,
.payment-edit-form ::v-deep textarea.form-control::placeholder {
  color: #6c757d !important;
  -webkit-text-fill-color: #6c757d;
  opacity: 1;
}

.payment-edit-form ::v-deep .el-input__inner {
  color: #1a1a1a !important;
  -webkit-text-fill-color: #1a1a1a;
}

.payment-edit-form ::v-deep .el-input__inner::placeholder {
  color: #6c757d !important;
}

.payment-edit-form ::v-deep .el-select .el-input__inner {
  color: #1a1a1a !important;
}
</style>
