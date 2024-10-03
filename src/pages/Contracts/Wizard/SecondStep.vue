<template>
  <ValidationObserver ref="form">
    <form @submit.prevent="validate">
      <div>
        <h5 class="info-text">
          Seleccione los terminos del contrato.
          <br />
          Codigo de Terreno: <b>{{ landInfo.land_code }}</b>
          <br />
          Precio de Venta:
          <b>{{ formatCurrency(landInfo.price) }}</b>
        </h5>
        <div class="row justify-content-center mt-5">
          <div class="col-sm-5">
            <ValidationProvider name="fecha inicio">
              <base-input>
                <el-date-picker
                  type="date"
                  placeholder="Fecha de Inicio de Pagos"
                  v-model="start_date"
                  value-format="yyyy-MM-dd"
                >
                </el-date-picker>
              </base-input>
            </ValidationProvider>

            <ValidationProvider
              name="pago por mes"
              v-slot="{ passed, failed, errors }"
            >
              <base-input
                required
                v-model="pay_month"
                placeholder="Pago por mes"
                addon-left-icon="tim-icons icon-money-coins"
                :error="errors[0]"
                :class="[{ 'has-success': passed }, { 'has-danger': failed }]"
                :disabled="true"
              >
              </base-input>
            </ValidationProvider>
          </div>
          <div class="col-sm-5">
            <ValidationProvider
              name="numero de meses"
              rules="required|numeric"
              v-slot="{ passed, failed, errors }"
            >
              <base-input
                required
                v-model="months"
                placeholder="Numero de Meses a Pagar"
                addon-left-icon="tim-icons icon-calendar-60"
                :error="errors[0]"
                :class="[{ 'has-success': passed }, { 'has-danger': failed }]"
              >
              </base-input>
            </ValidationProvider>

            <ValidationProvider
              name="abono inicial"
              rules="numeric"
              v-slot="{ passed, failed, errors }"
            >
              <base-input
                required
                v-model="down_payment"
                placeholder="Abono inicial"
                addon-left-icon="tim-icons icon-single-02"
                :error="errors[0]"
                :class="[{ 'has-success': passed }, { 'has-danger': failed }]"
              >
              </base-input>
            </ValidationProvider>
          </div>

          <div class="text-center" v-if="start_date && months">
            <base-button
              @click="generatePayments"
              class="btn-round"
              color="primary"
            >
              Generrar Lista de Pagos
            </base-button>
          </div>
          <div class="col-sm-10" v-if="paymentData.length">
            <el-table class="table-container" :data="paymentData">
              <el-table-column
                v-for="column in tableColumns"
                :key="column.label"
                :min-width="column.minWidth"
                :prop="column.prop"
                :label="column.label"
                :fixed="column.fixed"
              >
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </form>
  </ValidationObserver>
</template>
<script>
import { extend } from "vee-validate";
import { required, numeric } from "vee-validate/dist/rules";
import { Table, TableColumn, DatePicker, Select, Option } from "element-ui";
import { mapGetters } from "vuex";

extend("required", required);
extend("numeric", numeric);

export default {
  components: {
    ElTable: Table,
    ElTableColumn: TableColumn,
    [DatePicker.name]: DatePicker,
    [Option.name]: Option,
    [Select.name]: Select,
  },
  data() {
    return {
      months: "",
      start_date: "",
      down_payment: "",
      phone: "",
      address: "",
      payment_month: "",
      paymentData: [],
      tableColumns: [
        { prop: "curr_quantity", label: "Total a Pagar", minWidth: 150 },
        { prop: "curr_payment", label: "Pago", minWidth: 100 },
        { prop: "pay_number", label: "Numero de pago", minWidth: 100 },
        { prop: "payment_date", label: "Fecha de Pago", minWidth: 150 },
        { prop: "client", label: "Cliente", minWidth: 150 },
        { prop: "status", label: "Estatus", minWidth: 150 },
      ],
    };
  },
  computed: {
    ...mapGetters(["getLandById", "getClientById"]),
    landInfo() {
      return this.getLandById;
    },
    clientFullName() {
      return this.getClientById.full_name;
    },
    pay_month() {
      const parced_down_payment = parseFloat(this.down_payment) || 0;
      const parced_months = Number(this.months);
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.payment_month =
        (this.landInfo.price - parced_down_payment) / parced_months;
      return parced_months == 0
        ? ""
        : this.formatCurrency(
            (this.landInfo.price - parced_down_payment) / parced_months
          );
    },
  },
  methods: {
    validate() {
      if (!this.paymentData.length > 0) {
        this.notifyPaymentList();
        return false;
      }

      return this.$refs.form.validate().then((res) => {
        this.$emit("on-validated", res);
        return res && this.paymentData.length > 0;
      });
    },
    generatePayments() {
      const parced_down_payment = parseFloat(this.down_payment || 0).toFixed(2);
      const parced_months = Number(this.months);
      const parced_pay_month = parseFloat(this.payment_month || 0).toFixed(2);
      const parced_start_date = this.start_date;
      this.paymentData = [];
      let total = this.landInfo.price - parced_down_payment;

      for (let i = 0; i < parced_months; i++) {
        let payment = parced_pay_month;
        const quantity = total;
        const pay_number = i + 1;
        const payment_date = new Date(parced_start_date);
        const curr_quantity = this.formatCurrency(quantity);
        let curr_payment = this.formatCurrency(payment);
        if (parced_months - 1 == i) {
          console.log(total);
          payment = total;
          curr_payment = this.formatCurrency(total);
        }
        payment_date.setMonth(payment_date.getMonth() + i);
        total = quantity - payment;
        this.paymentData.push({
          quantity,
          curr_quantity,
          payment,
          curr_payment,
          pay_number,
          payment_date: payment_date.toLocaleDateString("es-ES"),
          client: this.clientFullName,
          client_id: this.getClientById.id,
          status: "Pendiente",
        });
      }
      this.$store.commit("setPayments", this.paymentData);
      this.$store.commit("setContract", {
        land_id: this.landInfo.id,
        client_id: this.getClientById.id,
        down_payment: parced_down_payment,
        monthly_payment: parced_pay_month,
        months: parced_months,
        start_date: parced_start_date,
      });
    },
    notifyPaymentList() {
      this.$notify({
        message:
          "Es necesario GENERAR LA LISTA DE PAGOS para continuar con el proceso",
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
.table-container {
  max-height: 400px !important;
  overflow-y: auto !important;
  width: 100% !important;
}

input:disabled,
input[disabled] {
  color: white !important; /* Text color of enabled input */
  background-color: transparent !important; /* Background color of enabled input */
  cursor: not-allowed !important; /* Keep the cursor style */
}
</style>
