<template>
  <div>
    <div class="row d-flex justify-content-center">
      <div class="col-md-10">
        <simple-wizard @wizard-complete="wizardComplete">
          <template slot="header">
            <h3 class="card-title">Crear un Contrato</h3>
            <h3 class="description">
              Este asistente te ayudará a crear un contrato.
            </h3>
          </template>

          <wizard-tab :before-change="() => validateStep('step1')">
            <template slot="label">
              <i class="tim-icons icon-single-02"></i>
              <p>Terreno</p>
            </template>
            <first-step
              ref="step1"
              @on-validated="onStepValidated"
            ></first-step>
          </wizard-tab>

          <wizard-tab :before-change="() => validateStep('step2')">
            <template slot="label">
              <i class="tim-icons icon-settings-gear-63"></i>
              <p>Pagos</p>
            </template>
            <second-step
              ref="step2"
              @on-validated="onStepValidated"
            ></second-step>
          </wizard-tab>

          <wizard-tab :before-change="() => validateStep('step3')">
            <template slot="label">
              <i class="tim-icons icon-delivery-fast"></i>
              <p>Info del contrato</p>
            </template>
            <third-step ref="step3"></third-step>
          </wizard-tab>
        </simple-wizard>
      </div>
    </div>
  </div>
</template>
<script>
import FirstStep from "./Wizard/LandStep.vue";
import SecondStep from "./Wizard/SecondStep.vue";
import ThirdStep from "./Wizard/ThirdStep.vue";
import swal from "sweetalert2";
import { SimpleWizard, WizardTab } from "src/components";
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      wizardModel: {},
    };
  },
  components: {
    FirstStep,
    SecondStep,
    ThirdStep,
    SimpleWizard,
    WizardTab,
  },
  computed: {
    ...mapGetters(["getContractById", "getPayments"]),
    contractInfo() {
      return this.getContractById;
    },
    payments() {
      return this.getPayments;
    },
  },
  methods: {
    ...mapActions(["createContract"]),
    validateStep(ref) {
      return this.$refs[ref].validate();
    },
    onStepValidated(validated, model) {
      this.wizardModel = { ...this.wizardModel, ...model };
    },
    wizardComplete() {
      const payload = {
        contract: {
          client_id: this.contractInfo.client_id,
          land_id: this.contractInfo.land_id,
          down_payment: this.contractInfo.down_payment,
          contract_date: this.contractInfo.start_date,
          months: this.contractInfo.months,
          monthly_payment: this.contractInfo.monthly_payment,
          payments_attributes: this.payments.map((payment) => ({
            amount: parseFloat(payment.payment).toFixed(2),
            payment_date: payment.payment_date,
            status: "pending",
          })),
        },
      };
      this.createContract(payload).then(() => {
        this.$notify({
          message:
            "Se ha CREADO el contrato exitosamente. Puedes verlo en la lista de contratos.",
          timeout: 3000,
          icon: "tim-icons icon-bell-55",
          horizontalAlign: "right",
          verticalAlign: "top",
          type: "success",
        });
      });
    },
  },
};
</script>
