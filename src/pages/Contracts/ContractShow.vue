<template>
  <div class="row" id="pdf">
    <div class="col-md-12">
      <card>
        <h4
          slot="header"
          class="card-title contract-show-back"
          @click="goToContracts"
        >
          <i class="tim-icons icon-minimal-left"></i>
          Contrato
        </h4>

        <base-button @click="generatePDF" type="text">
          <i class="tim-icons el-icon-document"> </i> Descargar PDF
        </base-button>

        <div v-if="loading" class="text-center py-4 text-muted">
          Cargando contrato...
        </div>
        <div v-else class="card-body contract-show-body">
          <div class="typography-line contract-show-section">
            <h6><span>CONTRATO</span></h6>
            <div class="row">
              <div
                v-for="field in contractFields"
                :key="field.label"
                class="col-6 col-md-4 col-lg-2 contract-detail-field"
              >
                <h5>{{ field.label }}</h5>
                <ul class="list-unstyled">
                  <li>{{ field.value }}</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="typography-line contract-show-section">
            <h6><span>CLIENTE</span></h6>
            <div class="row">
              <div
                v-for="field in clientFields"
                :key="field.label"
                class="col-6 col-md-4 col-lg contract-detail-field"
              >
                <h5>{{ field.label }}</h5>
                <ul class="list-unstyled">
                  <li>{{ field.value }}</li>
                </ul>
              </div>
            </div>
          </div>

          <div
            class="typography-line contract-show-section contract-show-section--last"
          >
            <h6><span>TERRENO</span></h6>
            <div class="row">
              <div
                v-for="field in landFields"
                :key="field.label"
                class="col-6 col-md-4 col-lg contract-detail-field"
              >
                <h5>{{ field.label }}</h5>
                <ul class="list-unstyled">
                  <li>{{ field.value }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </card>
    </div>

    <div class="col-md-12">
      <contract-payments-panel
        v-if="contractId && !loading"
        :contract-id="contractId"
        :payment-return-query="paymentReturnQuery"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ContractPaymentsPanel from "@/components/Contracts/ContractPaymentsPanel.vue";

function displayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return value;
}

function formatDisplayDate(dateStr) {
  if (!dateStr || dateStr === "0000-00-00") {
    return "—";
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateStr));
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  return dateStr;
}

export default {
  components: {
    ContractPaymentsPanel,
  },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    ...mapGetters(["getLandById", "getClientById", "getContractById"]),

    contractInfo() {
      return this.getContractById;
    },
    landInfo() {
      return this.getLandById;
    },
    clientInfo() {
      return this.getClientById;
    },
    contractId() {
      return this.$route.params.id;
    },
    paymentReturnQuery() {
      return {
        returnTo: "contract",
        contractId: String(this.contractId),
      };
    },
    contractFields() {
      const c = this.contractInfo;
      return [
        {
          label: "Fecha del contrato",
          value: formatDisplayDate(c.contract_date),
        },
        { label: "Meses a pagar", value: displayValue(c.months) },
        {
          label: "Pago por mes",
          value: `${this.formatCurrency(c.monthly_payment)} MXN`,
        },
        {
          label: "Abono inicial",
          value: `${this.formatCurrency(c.down_payment)} MXN`,
        },
        {
          label: "Precio del terreno",
          value: `${this.formatCurrency(c.total_price)} MXN`,
        },
        {
          label: "Cantidad pagada",
          value: `${this.formatCurrency(c.total_paid)} MXN`,
        },
      ];
    },
    clientFields() {
      const client = this.clientInfo;
      return [
        { label: "Nombre", value: displayValue(client.full_name) },
        { label: "Teléfono", value: displayValue(client.phone_number) },
        { label: "Email", value: displayValue(client.email) },
        { label: "Dirección", value: displayValue(client.address) },
        { label: "RFC", value: displayValue(client.rfc) },
      ];
    },
    landFields() {
      const land = this.landInfo;
      return [
        {
          label: "Fraccionamiento",
          value: displayValue(land.residential_name),
        },
        { label: "Dirección", value: displayValue(land.address) },
        { label: "Código", value: displayValue(land.land_code) },
        { label: "Tamaño", value: displayValue(land.size) },
        {
          label: "Número de casa",
          value: displayValue(land.house_number),
        },
      ];
    },
  },
  methods: {
    ...mapActions(["fetchContractById", "fetchLandById", "fetchClientById"]),

    goToContracts() {
      this.$router.push({ name: "Contracts" });
    },

    loadContractData(contract_id) {
      this.loading = true;
      this.fetchContractById(contract_id)
        .then((res) => {
          const user = this.$store.getters.currentUser;
          if (user?.isClient) {
            return;
          }
          if (!res?.land && res?.land_id) {
            this.fetchLandById(res.land_id).catch(() => {});
          }
          if (!res?.client && res?.client_id) {
            this.fetchClientById(res.client_id).catch(() => {});
          }
        })
        .finally(() => {
          this.loading = false;
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

<style scoped>
.contract-show-back {
  cursor: pointer;
  margin-bottom: 0;
}

.contract-show-back:hover {
  color: #e14eca !important;
}

.contract-show-body {
  padding-top: 0.5rem;
}

.contract-show-section {
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.contract-show-section--last {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.contract-detail-field {
  margin-bottom: 0.75rem;
}

.contract-detail-field h5 {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.2rem;
  color: rgba(255, 255, 255, 0.55);
}

.contract-detail-field li {
  font-size: 0.9rem;
  line-height: 1.35;
  margin-bottom: 0;
  word-break: break-word;
}

.contract-show-section h6 {
  margin-bottom: 0.75rem;
}
</style>

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
