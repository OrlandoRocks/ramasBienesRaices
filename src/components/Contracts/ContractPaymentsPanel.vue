<template>
  <card class="text-center">
    <div class="places-buttons">
      <div class="row">
        <div class="col-md-6 ml-auto mr-auto text-center">
          <h4 class="card-title">Pagos:</h4>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-10 ml-auto mr-auto">
          <div v-loading="paymentsRefreshing" class="payments-table-wrap">
            <el-table
              v-if="paymentData.length"
              class="table-container"
              :data="paymentData"
              row-key="id"
            >
              <el-table-column
                label="Total a Pagar"
                min-width="150"
                prop="total"
              >
                <template slot-scope="{ row }">
                  {{ formatCurrency(row.total) }}
                </template>
              </el-table-column>
              <el-table-column label="Monto" min-width="110" prop="amount">
                <template slot-scope="{ row }">
                  {{ formatCurrency(row.amount) }}
                </template>
              </el-table-column>
              <el-table-column
                label="Numero de pago"
                min-width="110"
                prop="row_number"
              />
              <el-table-column
                label="Fecha de Pago"
                min-width="130"
                prop="payment_date"
              />
              <el-table-column label="Tipo" min-width="120" prop="payment_type">
                <template slot-scope="{ row }">
                  {{ row.payment_type || "—" }}
                </template>
              </el-table-column>
              <el-table-column label="Estatus" min-width="120">
                <template slot-scope="{ row }">
                  <span
                    :class="
                      row.payment_status_name === 'Pagado'
                        ? 'text-success'
                        : 'text-warning'
                    "
                  >
                    {{ row.payment_status_name }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                v-if="$can('payments.capture') || $can('payments.update')"
                :min-width="120"
                align="right"
                label="Acciones"
              >
                <template slot-scope="{ row }">
                  <base-button
                    v-if="$can('payments.update')"
                    @click.native="openEditPayment(row)"
                    class="edit btn-link"
                    type="info"
                    size="sm"
                    icon
                  >
                    <i class="tim-icons icon-pencil"></i>
                  </base-button>
                  <base-button
                    v-if="$can('payments.capture')"
                    @click.native="handlePayment(row)"
                    class="edit btn-link"
                    type="warning"
                    size="sm"
                    icon
                    :disabled="!canCapturePayment(row)"
                  >
                    <i class="tim-icons icon-money-coins"></i>
                  </base-button>
                </template>
              </el-table-column>
            </el-table>

            <p v-else class="text-muted py-3 mb-0">
              No hay pagos registrados para este contrato.
            </p>

            <div
              v-if="paymentData.length"
              class="payment-schedule-summary text-right mt-3"
            >
              <div>
                <strong>Total del contrato:</strong>
                {{ formatCurrency(scheduleSummary.totalScheduled) }}
              </div>
              <div>
                <strong>Total pagado:</strong>
                {{ formatCurrency(scheduleSummary.totalPaid) }}
              </div>
              <div>
                <strong>Saldo pendiente:</strong>
                {{ formatCurrency(scheduleSummary.pendingBalance) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <payment-edit-modal
      :visible.sync="editModalVisible"
      :payment-id="selectedPaymentId"
      :capture-mode="captureModalMode"
      :initial-payment="selectedPaymentRow"
      @success="handleEditSuccess"
      @close="closePaymentModal"
    />
  </card>
</template>

<script>
import { Table, TableColumn } from "element-ui";
import { mapGetters, mapActions } from "vuex";
import PaymentEditModal from "@/components/Payments/PaymentEditModal.vue";
import { redistributionSuccessMessage } from "@/util/paymentApi";

export default {
  name: "ContractPaymentsPanel",
  components: {
    ElTable: Table,
    ElTableColumn: TableColumn,
    PaymentEditModal,
  },
  props: {
    contractId: {
      type: [Number, String],
      required: true,
    },
    paymentReturnQuery: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      paymentsRefreshing: false,
      editModalVisible: false,
      captureModalMode: false,
      selectedPaymentId: null,
      selectedPaymentRow: null,
    };
  },
  computed: {
    ...mapGetters(["getContractPayments", "getContractFinancialSummary"]),
    paymentData() {
      return this.getContractPayments;
    },
    scheduleSummary() {
      return this.getContractFinancialSummary;
    },
  },
  watch: {
    contractId: {
      immediate: true,
      handler(id) {
        if (id) {
          this.loadContract(id);
        }
      },
    },
  },
  methods: {
    ...mapActions(["fetchContractById", "syncContractAfterPaymentUpdate"]),
    loadContract(id) {
      this.fetchContractById(id).catch((error) => {
        console.error(error);
        this.$notify({
          title: "Error",
          type: "danger",
          message: "No se pudo cargar los pagos del contrato",
          icon: "tim-icons icon-bell-55",
        });
      });
    },
    canCapturePayment(row) {
      return (
        this.$can("payments.capture") && row.payment_status_name === "Pendiente"
      );
    },
    openEditPayment(row) {
      if (!row?.id) {
        return;
      }
      this.selectedPaymentRow = row;
      this.selectedPaymentId = row.id;
      this.captureModalMode = false;
      this.editModalVisible = true;
    },
    closePaymentModal() {
      this.editModalVisible = false;
      this.selectedPaymentId = null;
      this.selectedPaymentRow = null;
      this.captureModalMode = false;
    },
    async handleEditSuccess(result) {
      const amountChanged = Boolean(result?.amountChanged);
      const adjustedCount = Number(result?.adjustedCount) || 0;
      const needsFullListReload =
        amountChanged || this.captureModalMode || result?.statusChanged;

      if (needsFullListReload) {
        this.paymentsRefreshing = true;
        try {
          await this.syncContractAfterPaymentUpdate(this.contractId);
          const rebalanceMsg = redistributionSuccessMessage(adjustedCount);
          if (rebalanceMsg) {
            this.$notify({
              title: "Calendario actualizado",
              type: "success",
              message: rebalanceMsg,
              icon: "tim-icons icon-bell-55",
            });
          } else {
            this.$notify({
              title: "Éxito",
              type: "success",
              message: this.captureModalMode
                ? "Pago capturado correctamente"
                : "Pago actualizado correctamente",
              icon: "tim-icons icon-bell-55",
            });
          }
          this.closePaymentModal();
        } catch (error) {
          console.error(error);
          this.$notify({
            title: "Error",
            type: "danger",
            message:
              "El pago se guardó pero no se pudo actualizar la tabla. Recargue la página.",
            icon: "tim-icons icon-bell-55",
          });
        } finally {
          this.paymentsRefreshing = false;
        }
        return;
      }

      this.closePaymentModal();
      this.$notify({
        title: "Éxito",
        type: "success",
        message: "Pago actualizado correctamente",
        icon: "tim-icons icon-bell-55",
      });
    },
    handlePayment(row) {
      const pendingRow =
        row && this.canCapturePayment(row)
          ? row
          : this.paymentData.find((p) => p.payment_status_name === "Pendiente");

      if (!pendingRow) {
        this.$notify({
          title: "Sin pagos pendientes",
          type: "info",
          message: "No hay pagos pendientes por capturar",
          icon: "tim-icons icon-bell-55",
        });
        return;
      }

      const paymentId = pendingRow.id;
      if (!paymentId || paymentId === "undefined") {
        this.$notify({
          title: "Error",
          type: "danger",
          message:
            "No se encontró el identificador del pago. Recargue la página e intente de nuevo.",
          icon: "tim-icons icon-bell-55",
        });
        this.loadContract(this.contractId);
        return;
      }

      this.selectedPaymentRow = pendingRow;
      this.selectedPaymentId = paymentId;
      this.captureModalMode = true;
      this.editModalVisible = true;
    },
  },
};
</script>

<style>
.payments-table-wrap .table-container {
  max-height: 480px;
  overflow-y: auto;
  width: 100%;
}

.payments-table-wrap .el-table {
  width: 100% !important;
}

.payment-schedule-summary {
  font-size: 0.95rem;
  line-height: 1.6;
}
</style>
