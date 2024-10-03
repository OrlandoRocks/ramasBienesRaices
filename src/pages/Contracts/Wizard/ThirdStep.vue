<template>
  <ValidationObserver ref="form">
    <form @submit.prevent="validate">
      <div class="row justify-content-center">
        <div class="col-sm-12">
          <h3 class="info-text">Información del Contrato</h3>
        </div>
        <card>
          <div class="card-body">
            <div class="typography-line">
              <h6><span> CLIENTE </span></h6>
              <div class="row">
                <div class="col-md-3">
                  <h5>Nombre</h5>
                  <ul class="list-unstyled">
                    <li>{{ this.clientInfo.full_name }}</li>
                  </ul>
                </div>
                <div class="col-md-2">
                  <h5>Celular</h5>
                  <ul class="list-unstyled">
                    <li>{{ this.clientInfo.phone_number }}</li>
                  </ul>
                </div>
                <div class="col-md-4">
                  <h5>Direccion</h5>
                  <ul class="list-unstyled">
                    <li>{{ this.clientInfo.address }}</li>
                  </ul>
                </div>
                <div class="col-md-3">
                  <h5>Email</h5>
                  <ul class="list-unstyled">
                    <li>{{ this.clientInfo.email }}</li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="typography-line">
              <h6><span> TERRENO </span></h6>
              <div class="row">
                <div class="col-md-3">
                  <h5>Fraccionamiento</h5>
                  <ul class="list-unstyled">
                    <li>{{ this.landInfo.residential_name }}</li>
                  </ul>
                </div>
                <div class="col-md-2">
                  <h5>Codigo</h5>
                  <ul class="list-unstyled">
                    <li>{{ this.landInfo.land_code }}</li>
                  </ul>
                </div>
                <div class="col-md-4">
                  <h5>Direccion</h5>
                  <ul class="list-unstyled">
                    <li>{{ this.landInfo.address }}</li>
                  </ul>
                </div>
                <div class="col-md-3">
                  <h5>Precio</h5>
                  <ul class="list-unstyled">
                    <li>{{ this.formatCurrency(this.landInfo.price) }}</li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="typography-line">
              <h6><span> PAGOS </span></h6>
              <div class="row">
                <div class="col-md-3">
                  <h5>Fecha de inicio</h5>
                  <ul class="list-unstyled">
                    <li>
                      {{ formattedStartDate }}
                    </li>
                  </ul>
                </div>
                <div class="col-md-2">
                  <h5>Meses</h5>
                  <ul class="list-unstyled">
                    <li>{{ this.contractInfo.months }}</li>
                  </ul>
                </div>
                <div class="col-md-4">
                  <h5>Abono inicial</h5>
                  <ul class="list-unstyled">
                    <li>
                      {{ this.formatCurrency(this.contractInfo.down_payment) }}
                    </li>
                  </ul>
                </div>
                <div class="col-md-3">
                  <h5>Abonos por mes</h5>
                  <ul class="list-unstyled">
                    <li>
                      {{
                        this.paymentInfo.length > 0
                          ? this.formatCurrency(this.paymentInfo[0].payment)
                          : 0
                      }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="col-sm-12">

              <ValidationProvider
                name="Aceptar Informacion del Contrato"
                rules="required|numeric"
                v-slot="{ passed, failed, errors }"
              >
                <base-checkbox
                  required
                  v-model="subscribe"
                  class="pull-right"
                  name="subscribe"
                  :error="errors[0]"
                  :class="[{ 'has-success': passed }, { 'has-danger': failed }]"
                >
                  <h5>Aceptar Informacion del Contrato</h5>
                </base-checkbox>
              </ValidationProvider>
            </div>
          </div>
        </card>
      </div>
    </form>
  </ValidationObserver>
</template>
<script>
import { Select, Option } from "element-ui";
import { extend } from "vee-validate";
import { required } from "vee-validate/dist/rules";
import { mapGetters } from "vuex";
import moment from "moment";
import "moment/locale/es";

extend("required", required);

export default {
  components: {
    [Select.name]: Select,
    [Option.name]: Option,
  },
  data() {
    return {
      street: "",
      streetNo: "",
      city: "",
      country: "",
      subscribe: false,
      countryOptions: [
        "Australia",
        "Germany",
        "Netherlands",
        "USA",
        "UK",
        "New Zealand",
      ],
    };
  },
  computed: {
    ...mapGetters([
      "getLandById",
      "getClientById",
      "getContractById",
      "getPayments",
    ]),
    landInfo() {
      return this.getLandById;
    },
    clientInfo() {
      return this.getClientById;
    },
    contractInfo() {
      return this.getContractById;
    },
    paymentInfo() {
      return this.getPayments;
    },
    formattedStartDate() {
      return moment(this.contractInfo.start_date).locale("es").format("LL"); // Formato largo localizado
    }
  },
  methods: {
    getError(fieldName) {
      return this.errors.first(fieldName);
    },
    validate() {
      if (!this.subscribe) {
        this.notifyAcceptContract();
        return;
      }
      return this.$refs.form.validate().then((res) => {
        this.$emit("on-validated", res);
        return this.subscribe;
      });
    },
    notifyAcceptContract() {
      this.$notify({
        message:
          "Es necesario ACEPTAR LA INFORMACION DEL CONTRATO para continuar",
        timeout: 3000,
        icon: "tim-icons icon-bell-55",
        horizontalAlign: "right",
        verticalAlign: "top",
        type: "danger",
      });
    },
  },
};
</script>
<style>
.typography-line {
  border-bottom: 1px solid #ccc !important; /* Color del borde puede ser cualquier color que elijas */
}
</style>
