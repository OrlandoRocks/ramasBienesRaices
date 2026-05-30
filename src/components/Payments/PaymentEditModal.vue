<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="600px"
    custom-class="payment-edit-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <payment-edit-form
      v-if="dialogVisible && paymentId"
      :payment-id="paymentId"
      :capture-mode="captureMode"
      :initial-payment="initialPayment"
      @success="handleSuccess"
      @cancel="handleClose"
      @close="handleClose"
    />
  </el-dialog>
</template>

<script>
import { Dialog } from "element-ui";
import PaymentEditForm from "./PaymentEditForm.vue";

export default {
  name: "PaymentEditModal",
  components: {
    [Dialog.name]: Dialog,
    PaymentEditForm,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    paymentId: {
      type: [String, Number],
      default: null,
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
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(value) {
        this.$emit("update:visible", value);
      },
    },
    dialogTitle() {
      if (this.captureMode) {
        return this.paymentId
          ? `Capturar pago #${this.paymentId}`
          : "Capturar pago";
      }
      return this.paymentId ? `Editar pago #${this.paymentId}` : "Editar pago";
    },
  },
  methods: {
    handleSuccess(payment) {
      this.closeModal();
      this.$emit("success", payment);
    },
    handleClose() {
      this.closeModal();
    },
    closeModal() {
      this.dialogVisible = false;
      this.$emit("close");
    },
  },
};
</script>

<style>
.payment-edit-dialog .el-dialog__body {
  padding-top: 12px;
  color: #1a1a1a;
}

.payment-edit-dialog .el-dialog__title {
  color: #1a1a1a;
}

.payment-edit-dialog .form-control,
.payment-edit-dialog input.form-control,
.payment-edit-dialog textarea.form-control,
.payment-edit-dialog .el-input__inner {
  color: #1a1a1a !important;
  -webkit-text-fill-color: #1a1a1a;
}

.swal2-container.swal-above-dialog {
  z-index: 10001 !important;
}
</style>
