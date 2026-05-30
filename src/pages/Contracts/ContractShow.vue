<template>
  <div class="row">
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
