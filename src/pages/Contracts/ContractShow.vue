<template>
  <div class="row">
    <div class="col-md-12">
      <card>
        <h4 slot="header" class="card-title"><b>Contrato</b></h4>

        <div class="card-body">
          <div class="typography-line">
            <h3>
              <span><b>Fecha del Contrato:</b></span
              >{{ contractInfo.contract_date }}
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Meses a pagar:</b></span
              >{{ contractInfo.months }}
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Pago por mes:</b></span>
              {{ this.formatCurrency(contractInfo.monthly_payment) }} MXN
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Abono inicial:</b></span>
              {{ this.formatCurrency(contractInfo.down_payment) }} MXN
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Precio del terreno:</b></span
              >{{ this.formatCurrency(contractInfo.total_price) }} MXN
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Cantidad Pagada:</b></span
              >{{ this.formatCurrency(contractInfo.total_paid) }} MXN
            </h3>
          </div>
        </div>
      </card>
    </div>

    <div class="col-md-6">
      <card>
        <h4 slot="header" class="card-title"><b>Cliente</b></h4>

        <div class="card-body">
          <div class="typography-line">
            <h3>
              <span><b>Nombre:</b></span>
              {{ clientInfo.full_name }}
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Telefono:</b></span
              >{{ clientInfo.phone_number }}
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Email:</b></span
              >{{ clientInfo.email }}
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Direccion:</b></span
              >{{ clientInfo.address }}
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>RFC:</b></span
              >{{ clientInfo.rfc }}
            </h3>
          </div>
        </div>
      </card>
    </div>

    <div class="col-md-6">
      <card>
        <h4 slot="header" class="card-title"><b>Terreno</b></h4>

        <div class="card-body">
          <div class="typography-line">
            <h3>
              <span><b>Fraccionamiento:</b></span>
              {{ landInfo.residential_name }}
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Direccion:</b></span
              >{{ landInfo.address }}
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Codigo:</b></span
              >{{ landInfo.land_code }}
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Tamaño:</b></span
              >{{ landInfo.size }}
            </h3>
          </div>

          <div class="typography-line">
            <h3>
              <span><b>Numero de Casa:</b></span
              >{{ landInfo.house_number }}
            </h3>
          </div>
        </div>
      </card>
    </div>
    <div class="col-md-12">
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
                    :min-width="100"
                    align="right"
                    label="Capturar PAGOS"
                  >
                    <div slot-scope="props">
                      <base-button
                        @click.native="handlePayment()"
                        class="edit btn-link"
                        type="warning"
                        size="sm"
                        icon
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
      </card>
    </div>
  </div>
</template>
<script>
import { Table, TableColumn } from "element-ui";
import { mapGetters, mapActions } from "vuex";

export default {
  components: {
    ElTable: Table,
    ElTableColumn: TableColumn,
  },
  data() {
    return {
      type: ["", "info", "success", "warning", "danger"],
      notifications: {
        topCenter: false,
      },
      tableColumns: [
        {
          prop: "total",
          label: "Total a Pagar",
          minWidth: 150,
          formatter: (row) => {
            return `${this.formatCurrency(row.total)}`;
          },
        },
        {
          prop: "amount",
          label: "Pago",
          minWidth: 100,
          formatter: (row) => {
            return `${this.formatCurrency(row.amount)}`;
          },
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
      modals: {
        classic: false,
        notice: false,
        mini: false,
      },
    };
  },
  computed: {
    ...mapGetters([
      "getLandById",
      "getClientById",
      "getContractById",
      "getContractPayments",
    ]),

    contractInfo() {
      return this.getContractById;
    },
    landInfo() {
      return this.getLandById;
    },
    clientInfo() {
      return this.getClientById;
    },
    paymentData() {
      return this.getContractPayments;
    },
  },
  methods: {
    ...mapActions([
      "fetchContractById",
      "fetchLandById",
      "fetchClientById",
      "fetchPaymentsByContractId",
    ]),

    loadContractData(contract_id) {
      this.fetchContractById(contract_id).then((res) => {
        this.fetchLandById(res.land_id);
        this.fetchClientById(res.client_id);
      });
    },

    handlePayment() {
      const pendingRow = this.paymentData.find(
        (row) => row.payment_status_name == "Pendiente"
      );
      console.log(pendingRow);
      this.$router.push({
        name: "EditPayment",
        params: {
          id: pendingRow.id,
        },
      });
    },
  },
  created() {
    const contract_id = this.$route.params.id;
    if (contract_id) {
      this.loadContractData(contract_id);
    }
  },
};
</script>
<style>
.card .alert {
  position: relative !important;
  width: 100%;
}

.modal-body,
.modal-footer {
  padding: 24px 24px 16px 24px;
}
</style>
