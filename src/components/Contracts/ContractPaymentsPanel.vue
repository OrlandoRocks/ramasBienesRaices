<template>
  <card class="text-center">
    <div class="places-buttons">
      <div class="row">
        <div class="col-md-6 ml-auto mr-auto text-center">
          <h4 class="card-title">Pagos:</h4>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-8 ml-auto mr-auto">
          <div class="row">
            <el-table class="table-container" :data="paymentData">
              <el-table-column
                v-for="column in tableColumns"
                :key="column.label"
                :min-width="column.minWidth"
                :prop="column.prop"
                :label="column.label"
                :formatter="
                  typeof column.formatter === 'function'
                    ? column.formatter
                    : null
                "
              >
                <template
                  #default="{ row }"
                  v-if="typeof column.formatter !== 'function'"
                >
                  <div
                    v-if="column.formatter"
                    :is="column.formatter"
                    :row="row"
                    :column="column"
                  ></div>
                  <template v-else>
                    {{ row[column.prop] }}
                  </template>
                </template>
              </el-table-column>
              <el-table-column
                v-if="$can('payments.capture') || $can('payments.update')"
                :min-width="120"
                align="right"
                label="Acciones"
              >
                <div slot-scope="props">
                  <base-button
                    v-if="$can('payments.update')"
                    @click.native="openEditPayment(props.row)"
                    class="edit btn-link"
                    type="info"
                    size="sm"
                    icon
                  >
                    <i class="tim-icons icon-pencil"></i>
                  </base-button>
                  <base-button
                    v-if="$can('payments.capture')"
                    @click.native="handlePayment(props.row)"
                    class="edit btn-link"
                    type="warning"
                    size="sm"
                    icon
                    :disabled="!canCapturePayment(props.row)"
                  >
                    <i class="tim-icons icon-money-coins"></i>
                  </base-button>
                </div>
              </el-table-column>
            </el-table>
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
      editModalVisible: false,
      captureModalMode: false,
      selectedPaymentId: null,
      selectedPaymentRow: null,
      tableColumns: [
        {
          prop: "total",
          label: "Total a Pagar",
          minWidth: 150,
          formatter: (row) => `${this.formatCurrency(row.total)}`,
        },
        {
          prop: "amount",
          label: "Pago",
          minWidth: 100,
          formatter: (row) => `${this.formatCurrency(row.amount)}`,
        },
        {
          prop: "row_number",
          label: "Numero de pago",
          minWidth: 100,
        },
        {
          prop: "payment_date",
          label: "Fecha de Pago",
          minWidth: 150,
        },
        {
          prop: "payment_status_name",
          label: "Estatus",
          minWidth: 150,
          formatter: (row) => {
            return (
              <p
                class={
                  row.payment_status_name === "Pagado"
                    ? "text-success"
                    : "text-warning"
                }
              >
                {row.payment_status_name}
              </p>
            );
          },
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["getContractPayments"]),
    paymentData() {
      return this.getContractPayments;
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
    ...mapActions(["fetchContractById"]),
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
        this.$can("payments.capture") &&
        row.payment_status_name === "Pendiente"
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
    handleEditSuccess(updatedPayment) {
      this.closePaymentModal();
      if (updatedPayment) {
        this.$store.commit("updateContractPayment", updatedPayment);
      }
      this.$store
        .dispatch("refreshContractPayments", this.contractId)
        .catch((error) => {
          console.error(error);
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
