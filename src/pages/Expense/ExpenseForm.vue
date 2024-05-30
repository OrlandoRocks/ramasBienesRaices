<template>
  <div class="col-md-12">
    <ValidationObserver v-slot="{ handleSubmit }">
      <form class="form-horizontal" @submit.prevent="handleSubmit(submit)">
        <card>
          <h4
            slot="header"
            class="card-title clickable"
            @click="goToExpenses"
          >
            <i class="tim-icons icon-minimal-left"></i>
            Gastos
          </h4>
          <div>
            <div class="row">
              <label class="col-sm-2 col-form-label">Fraccionamiento</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="fraccionamiento"
                  rules="required"
                  v-slot="{ errors }"
                >
                  <el-select
                    class="select-primary"
                    style="width: 100%; margin-bottom: 10px"
                    :error="errors[0]"
                    size="large"
                    placeholder="Seleccionar el fraccionamiento"
                    v-model="residential_id"
                  >
                    <el-option
                      v-for="option in residentialsList"
                      class="select-primary"
                      :value="option.id"
                      :label="`${option.name}`"
                      :key="option.id"
                    >
                    </el-option>
                  </el-select>
                  <span class="error-message" v-if="errors.length">{{
                    errors[0]
                  }}</span>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-2 col-form-label">Responsable</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="responsable"
                  rules="required"
                  v-slot="{ errors }"
                >
                  <el-select
                    class="select-primary"
                    style="width: 100%; margin-bottom: 10px"
                    :error="errors[0]"
                    size="large"
                    placeholder="Seleccionar el responsable"
                    v-model="user_id"
                  >
                    <el-option
                      v-for="option in usersList"
                      class="select-primary"
                      :value="option.id"
                      :label="`${option.full_name} (${option.email})`"
                      :key="option.email"
                    >
                    </el-option>
                  </el-select>
                  <span class="error-message" v-if="errors.length">{{
                    errors[0]
                  }}</span>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-2 col-form-label">Cuenta</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="cuenta"
                  rules="required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    v-model="account"
                    :error="errors[0]"
                    :class="[
                      { 'has-success': passed },
                      { 'has-danger': failed },
                    ]"
                  >
                  </base-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-2 col-form-label">Departamento</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="departamento"
                  rules="required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    v-model="department"
                    :error="errors[0]"
                    :class="[
                      { 'has-success': passed },
                      { 'has-danger': failed },
                    ]"
                  >
                  </base-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-2 col-form-label">Tipo</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="tipo"
                  rules="required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    v-model="expense_type"
                    :error="errors[0]"
                    :class="[
                      { 'has-success': passed },
                      { 'has-danger': failed },
                    ]"
                  >
                  </base-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-2 col-form-label">Comentarios</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="comentario"
                  rules="required"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    v-model="comments"
                    :error="errors[0]"
                    :class="[
                      { 'has-success': passed },
                      { 'has-danger': failed },
                    ]"
                  >
                  </base-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-2 col-form-label">Cantidad</label>
              <div class="col-sm-7">
                <ValidationProvider
                  name="cantidad"
                  rules="required|double"
                  v-slot="{ passed, failed, errors }"
                >
                  <base-input
                    required
                    v-model="amount"
                    :error="errors[0]"
                    :class="[
                      { 'has-success': passed },
                      { 'has-danger': failed },
                    ]"
                  >
                  </base-input>
                </ValidationProvider>
              </div>
            </div>
            
          </div>
          <div class="text-center">
            <base-button
              :disabled="isSubmitting"
              native-type="submit"
              type="primary"
              >{{ create_edit }} Gasto</base-button
            >
          </div>
        </card>
      </form>
    </ValidationObserver>
  </div>
</template>
<script>
import { extend } from "vee-validate";
import { required, double, regex, confirmed } from "vee-validate/dist/rules";
import { Option, Select } from "element-ui";
import { mapActions, mapGetters } from "vuex";

extend("required", required);
extend("double", double);
extend("regex", regex);
extend("confirmed", confirmed);

export default {
  components: {
    [Select.name]: Select,
    [Option.name]: Option,
  },
  computed: {
    ...mapGetters(["getResidentialsList", "getUsersList", "getResidentialById"]),
    residentialsList() {
      return this.getResidentialsList;
    },
    usersList() {
      return this.getUsersList;
    },
  },
  data() {
    return {
      id: "",
      user_id: "",
      residential_id: "",
      account: "",
      department: "",
      expense_type: "",
      comments: "",
      amount: "",
      create_edit: "Crear",
      isSubmitting: false,
    };
  },
  methods: {
    ...mapActions([
      "createExpense",
      "fetchExpenseById",
      "updateExpense",
    ]),
    loadExpenseData(id) {
      this.fetchExpenseById(id)
        .then((res) => {
          this.id = res.id;
          this.residential_id = String(res.residential_id);
          this.user_id = String(res.user_id);
          this.account = res.account;
          this.department = res.department;
          this.expense_type = res.expense_type;
          this.comments = res.comments;
          this.amount = res.amount;
          this.create_edit = "Editar";
        })
        .catch((error) => {
          console.log(error);
        });
    },
    submit() {
      this.isSubmitting = true;
      let data = {
        expense: {
          user_id: this.user_id,
          residential_id: this.residential_id,
          account: this.account,
          department: this.department,
          expense_type: this.expense_type,
          comments: this.comments,
          amount: this.amount,
        },
      };
      if (this.create_edit === "Editar") {
        data.expense.id = this.id;
        this.updateExpense(data)
          .then(() => {
            this.$notify({
              title: "Success",
              type: "success",
              message: "Gasto actualizado con éxito",
              icon: "tim-icons icon-bell-55",
            });
          })
          .catch((error) => {
            console.log(error);
            this.isSubmitting = false;
            this.$notify({
              title: "Error",
              type: "danger",
              message: "Error al actualizar el gasto",
              icon: "tim-icons icon-bell-55",
            });
          });
      } else {
        this.createExpense(data)
          .then(() => {
            this.$notify({
              title: "Success",
              type: "success",
              message: "Gasto creado con éxito",
              icon: "tim-icons icon-bell-55",
            });
          })
          .catch((error) => {
            console.log(error);
            this.isSubmitting = false;
            this.resetData();
            this.$notify({
              title: "Error",
              type: "danger",
              message: "Error al crear el gasto",
              icon: "tim-icons icon-bell-55",
            });
          });
      }
    },
    goToExpenses() {
      this.$router.push({ name: "Expenses" });
    },
    resetData() {
      this.user_id = "";
      this.residential_id = "";
      this.account = "";
      this.department = "";
      this.expense_type = "";
      this.comments = "";
      this.amount = "";
    },
  },
  mounted() {
    this.$store.dispatch("usersList");
    this.$store.dispatch("residentialsList");
  },
  created() {
    const expenseId = this.$route.params.id;
    if (expenseId) {
      this.loadExpenseData(expenseId);
    }
    this.create_edit = expenseId ? "Editar" : "Crear";
  },
};
</script>
<style>
.error-message {
  color: red;
}
.clickable {
  cursor: pointer;
}

.clickable:hover {
  color: #e14eca !important;
}
</style>
