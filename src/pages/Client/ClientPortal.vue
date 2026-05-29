<template>
  <div class="content">
    <div class="col-md-8 ml-auto mr-auto">
      <h2 class="text-center">Mi contrato</h2>
      <p class="text-center text-muted">
        Consulta tu contrato y el estado de tus pagos.
      </p>
    </div>

    <div v-if="loading" class="text-center py-5">
      <i class="tim-icons icon-refresh-01"></i>
      Cargando...
    </div>

    <div v-else-if="loadError" class="text-center py-5 text-danger">
      {{ loadError }}
    </div>

    <div v-else-if="!contracts.length" class="text-center py-5 text-muted">
      No hay contratos asociados a tu cuenta.
    </div>

    <div v-else class="row mt-4">
      <div class="col-12" v-for="contract in contracts" :key="contract.id">
        <card>
          <h4 slot="header" class="card-title">
            Contrato #{{ contract.id }}
            <span v-if="contractLandLabel(contract)">
              — {{ contractLandLabel(contract) }}
            </span>
          </h4>
          <div class="card-body">
            <p>
              <b>Fecha:</b> {{ contract.contract_date || "—" }}
            </p>
            <p>
              <b>Mensualidad:</b>
              {{ formatCurrency(contract.monthly_payment) }}
            </p>
            <base-button
              type="primary"
              size="sm"
              @click="openContract(contract.id)"
            >
              Ver detalle y pagos
            </base-button>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapGetters } from "vuex";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;

export default {
  name: "ClientPortal",
  data() {
    return {
      loading: false,
      loadError: null,
      contracts: [],
    };
  },
  computed: {
    ...mapGetters(["currentUser"]),
  },
  mounted() {
    this.loadContracts();
  },
  methods: {
    loadContracts() {
      this.loading = true;
      this.loadError = null;

      axios
        .get(`${BASE_URL}/contracts`, {
          headers: { Authorization: localStorage.getItem("auth_token") },
        })
        .then((response) => {
          this.contracts = response.data || [];
        })
        .catch((error) => {
          this.loadError =
            error.response?.data?.error ||
            "No se pudieron cargar tus contratos.";
          this.contracts = [];
        })
        .finally(() => {
          this.loading = false;
        });
    },
    contractLandLabel(contract) {
      const address =
        contract.land_address || contract.land?.address || "";
      return String(address).trim();
    },
    openContract(id) {
      this.$router.push({ name: "ShowContract", params: { id } });
    },
  },
};
</script>
