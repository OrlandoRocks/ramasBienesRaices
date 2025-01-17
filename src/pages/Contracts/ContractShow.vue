<template>
  <div class="row" id="pdf">
    <div class="col-md-12">
      <card>
        <h4 slot="header" class="card-title"><b>Contrato</b></h4>

        <base-button @click="generatePDF" type="text">
          <i class="tim-icons el-icon-document"> </i> Descargar PDF
        </base-button>

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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

    generatePDF() {
      const doc = new jsPDF();
      var totalPagesExp = "{total_pages_count_string}";

      var finalY = doc.lastAutoTable.finalY || 10;
      doc.setFont("Helvetica", "normal", "bold");
      doc.text("Contrato", 14, finalY + 15);
      doc.setFont("Helvetica", "", "normal");
      autoTable(doc, {
        // columnStyles: { europe: { halign: 'center' } }, // European countries centered
        startY: finalY + 20,
        body: [
          {
            contract_date: this.contractInfo.contract_date,
            months: this.contractInfo.months,
            monthly_payment:
              this.formatCurrency(this.contractInfo.monthly_payment) + " MXN",
            down_payment:
              this.formatCurrency(this.contractInfo.down_payment) + " MXN",
            total_price:
              this.formatCurrency(this.contractInfo.total_price) + " MXN",
            total_paid:
              this.formatCurrency(this.contractInfo.total_paid) + " MXN",
          },
        ],
        columns: [
          { header: "Fecha del Contrato", dataKey: "contract_date" },
          { header: "Meses a Pagar", dataKey: "months" },
          { header: "Pago por Mes", dataKey: "monthly_payment" },
          { header: "Abono Inicial", dataKey: "down_payment" },
          { header: "Precio del Terreno", dataKey: "total_price" },
          { header: "Cantidad Pagada", dataKey: "total_paid" },
        ],
      });

      finalY = doc.lastAutoTable.finalY;
      doc.setFontSize(16);
      doc.setFont("Helvetica", "normal", "bold");
      doc.text("Cliente", 14, finalY + 15);
      doc.setFont("Helvetica", "", "normal");
      doc.setFontSize(11);
      doc.setFont("Helvetica", "normal", "bold");
      doc.text("Nombre:", 14, finalY + 25);
      doc.setFont("Helvetica", "", "normal");
      doc.text(this.clientInfo.full_name, 31, finalY + 25);
      doc.setFont("Helvetica", "normal", "bold");
      doc.text("Teléfono:", 140, finalY + 25);
      doc.setFont("Helvetica", "", "normal");
      doc.text(this.clientInfo.phone_number, 158, finalY + 25);
      doc.setFont("Helvetica", "normal", "bold");
      doc.text("Email:", 14, finalY + 33);
      doc.setFont("Helvetica", "", "normal");
      doc.text(this.clientInfo.email, 27, finalY + 33);
      // autoTable(doc, {
      //   // columnStyles: { europe: { halign: 'center' } }, // European countries centered
      //   startY: finalY + 20,
      //   body: [
      //     {
      //       full_name: this.clientInfo.full_name,
      //       phone_number: this.clientInfo.phone_number,
      //       email: this.clientInfo.email,
      //       // address: this.clientInfo.address,
      //       // rfc: this.clientInfo.rfc,
      //     },
      //   ],
      //   columns: [
      //     { header: "Nombre", dataKey: "full_name" },
      //     { header: "Teléfono", dataKey: "phone_number" },
      //     { header: "Email", dataKey: "email" },
      //     // { header: "Dirección", dataKey: "address" },
      //     // { header: "RFC", dataKey: "rfc" },
      //   ],
      // });

      finalY = doc.lastAutoTable.finalY + 40;
      doc.setFontSize(16);
      doc.setFont("Helvetica", "normal", "bold");
      doc.text("Terreno", 14, finalY + 15);
      doc.setFontSize(11);
      doc.setFont("Helvetica", "normal", "bold");
      doc.text("Fraccionamiento:", 14, finalY + 25);
      doc.setFont("Helvetica", "", "normal");
      doc.text(this.landInfo.residential_name, 47, finalY + 25);
      doc.setFont("Helvetica", "normal", "bold");
      doc.text("Dirección:", 125, finalY + 25);
      doc.setFont("Helvetica", "", "normal");
      doc.text(this.landInfo.address, 145, finalY + 25);
      doc.setFont("Helvetica", "normal", "bold");
      doc.text("Código:", 14, finalY + 33);
      doc.setFont("Helvetica", "", "normal");
      doc.text(this.landInfo.land_code, 29, finalY + 33);
      doc.setFont("Helvetica", "normal", "bold");
      doc.text("Tamaño:", 125, finalY + 33);
      doc.setFont("Helvetica", "", "normal");
      doc.text(this.landInfo.size + "m²", 142, finalY + 33);
      // autoTable(doc, {
      //   // columnStyles: { europe: { halign: 'center' } }, // European countries centered
      //   startY: finalY + 20,
      //   body: [
      //     {
      //       residential_name: this.landInfo.residential_name,
      //       address: this.landInfo.address,
      //       land_code: this.landInfo.land_code,
      //       size: this.landInfo.size + "m²",
      //       // house_number: this.landInfo.house_number,
      //     },
      //   ],
      //   columns: [
      //     { header: "Fraccionamiento", dataKey: "residential_name" },
      //     { header: "Dirección", dataKey: "address" },
      //     { header: "Código", dataKey: "land_code" },
      //     { header: "Tamaño", dataKey: "size" },
      //     // { header: "Número de Casa", dataKey: "house_number" },
      //   ],
      // });

      const paymentColumns = [
        "Total a Pagar",
        "Pago",
        "Número de Pago",
        "Fecha de Pago",
        "Estatus",
      ];
      finalY = doc.lastAutoTable.finalY + 75;
      doc.setFontSize(16);
      doc.setFont("Helvetica", "normal", "bold");
      doc.text("Pagos", 14, finalY + 15);
      doc.setFont("Helvetica", "", "normal");
      const rows = this.paymentData.map((row) => [
        this.formatCurrency(row.total) + " MXN",
        this.formatCurrency(row.amount) + " MXN",
        row.row_number,
        row.payment_date,
        row.payment_status_name,
      ]);
      autoTable(doc, {
        // columnStyles: { europe: { halign: 'center' } }, // European countries centered
        startY: finalY + 20,
        head: [paymentColumns],
        body: rows,
        // columns: [
        //   { header: "Total a Pagar", dataKey: "total" },
        //   { header: "Pago", dataKey: "amount" },
        //   { header: "Número de Pago", dataKey: "row_number" },
        //   { header: "Fecha de Pago", dataKey: "payment_date" },
        //   { header: "Estatus", dataKey: "payment_status_name" },
        // ],
        didDrawPage: function (data) {
          // Footer
          var str = "Página " + doc.internal.getNumberOfPages();
          // Total page number plugin only available in jspdf v1.0+
          if (typeof doc.putTotalPages === "function") {
            str = str + " de " + totalPagesExp;
          }
          doc.setFontSize(10);

          // jsPDF 1.4+ uses getHeight, <1.4 uses .height
          var pageSize = doc.internal.pageSize;
          var pageHeight = pageSize.height
            ? pageSize.height
            : pageSize.getHeight();
          doc.text(str, data.settings.margin.left, pageHeight - 10);
        },
        margin: { top: 30 },
      });

      if (typeof doc.putTotalPages === "function") {
        doc.putTotalPages(totalPagesExp);
      }

      doc.save("reporte.pdf");
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
