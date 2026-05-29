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
      <contract-payments-panel
        v-if="contractId"
        :contract-id="contractId"
        :payment-return-query="paymentReturnQuery"
      />
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import ContractPaymentsPanel from "@/components/Contracts/ContractPaymentsPanel.vue";

export default {
  components: {
    ContractPaymentsPanel,
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
  },
  methods: {
    ...mapActions(["fetchContractById", "fetchLandById", "fetchClientById"]),

    loadContractData(contract_id) {
      this.fetchContractById(contract_id).then((res) => {
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
