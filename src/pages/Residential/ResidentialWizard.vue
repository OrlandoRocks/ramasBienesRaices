<template>
  <div>
    <div class="row d-flex justify-content-center">
      <div class="col-md-10">
        <simple-wizard>
          <template slot="header">
            <h3 class="card-title">Fraccionamientos y Terrenos</h3>
            <h3 class="description">
              Formulario para agregar o editar fraccionamientos y terrenos
            </h3>
          </template>

          <wizard-tab :before-change="() => validateStep('residentialForm')">
            <template slot="label">
              <i class="tim-icons icon-square-pin"></i>
              <p>Fraccionamiento</p>
            </template>
            <residential-form
              ref="residentialForm"
              @on-validated="onStepValidated"
            ></residential-form>
          </wizard-tab>

          <wizard-tab :before-change="() => validateStep('step3')">
            <template slot="label">
              <i class="tim-icons icon-vector"></i>
              <p>Terrenos</p>
            </template>
            <land-form ref="step3"></land-form>
          </wizard-tab>
        </simple-wizard>
      </div>
    </div>
  </div>
</template>
<script>
import ResidentialForm from "./ResidentialForm.vue";
import LandForm from "../Land/LandForm.vue";
import swal from "sweetalert2";
import { SimpleWizard, WizardTab } from "src/components";

export default {
  data() {
    return {
      wizardModel: {},
    };
  },
  components: {
    ResidentialForm,
    LandForm,
    SimpleWizard,
    WizardTab,
  },
  methods: {
    validateStep(ref) {
      return this.$refs[ref].handleSubmit().then((res) => {
        return res;
      });
    },
    onStepValidated(validated, model) {
      console.log("Step validated", validated, model);
      this.wizardModel = { ...this.wizardModel, ...model };
    },
    wizardComplete() {
      swal("Good job!", "You clicked the finish button!", "success");
    },
  },
};
</script>
