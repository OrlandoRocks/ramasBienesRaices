<template>
  <div class="content">
    <div class="col-md-8 ml-auto mr-auto">
      <h2 class="text-center">Pagos</h2>
    </div>
    <div class="row mt-5">
      <div class="col-12">
        <card card-body-classes="table-full-width">
          <h4 slot="header" class="card-title">Listado de pagos</h4>
          <div>
            <div
              class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap"
            >
              <el-select
                class="select-primary mb-3 pagination-select"
                v-model="pagination.perPage"
                placeholder="Per page"
              >
                <el-option
                  v-for="item in pagination.perPageOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
              <base-input>
                <el-input
                  type="search"
                  class="mb-3 search-input"
                  clearable
                  prefix-icon="el-icon-search"
                  placeholder="Buscar pagos"
                  v-model="searchQuery"
                />
              </base-input>
            </div>

            <el-table v-loading="loading" :data="queriedData">
              <el-table-column
                prop="client_name"
                label="Cliente"
                min-width="180"
              />
              <el-table-column
                prop="residential_name"
                label="Fraccionamiento"
                min-width="140"
              />
              <el-table-column
                prop="land_code"
                label="Lote"
                min-width="90"
              />
              <el-table-column label="Monto" min-width="110">
                <template slot-scope="{ row }">
                  {{ formatCurrency(row.amount) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="payment_date"
                label="Fecha"
                min-width="110"
              />
              <el-table-column label="Estatus" min-width="120">
                <template slot-scope="{ row }">
                  <span :class="statusBadgeClass(row.payment_status_name)">
                    {{ row.payment_status_name }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                v-if="canManagePayments"
                :min-width="100"
                align="right"
                label="Acciones"
              >
                <template slot-scope="{ row }">
                  <base-button
                    @click.native="openEdit(row)"
                    class="edit btn-link"
                    type="warning"
                    size="sm"
                    icon
                  >
                    <i class="tim-icons icon-pencil" />
                  </base-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div
            slot="footer"
            class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap"
          >
            <p class="card-category">
              Mostrando del {{ from + 1 }} al {{ to }} de {{ total }} resultados
            </p>
            <base-pagination
              class="pagination-no-border"
              v-model="pagination.currentPage"
              :per-page="pagination.perPage"
              :total="total"
            />
          </div>
        </card>
      </div>
    </div>

    <payment-edit-modal
      :visible.sync="editModalVisible"
      :payment-id="selectedPaymentId"
      :initial-payment="selectedPaymentRow"
      @success="handleEditSuccess"
      @close="closePaymentModal"
    />
  </div>
</template>

<script>
import { Table, TableColumn, Select, Option } from "element-ui";
import { BasePagination } from "@/components";
import Fuse from "fuse.js";
import { mapGetters, mapActions } from "vuex";
import PaymentEditModal from "@/components/Payments/PaymentEditModal.vue";
import { statusBadgeClass } from "@/util/paymentApi";

export default {
  name: "PaymentsTable",
  components: {
    BasePagination,
    PaymentEditModal,
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
  },
  data() {
    return {
      loading: false,
      searchQuery: "",
      searchedData: [],
      fuseSearch: null,
      editModalVisible: false,
      selectedPaymentId: null,
      selectedPaymentRow: null,
      pagination: {
        perPage: 10,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50],
      },
    };
  },
  computed: {
    ...mapGetters(["getPayments"]),
    canManagePayments() {
      return this.$can("payments.update");
    },
    tableData() {
      return this.getPayments;
    },
    queriedData() {
      let result = this.tableData;
      if (this.searchedData.length > 0) {
        result = this.searchedData;
      }
      return result.slice(this.from, this.to);
    },
    from() {
      return this.pagination.perPage * (this.pagination.currentPage - 1);
    },
    to() {
      const highBound = this.from + this.pagination.perPage;
      return this.total < highBound ? this.total : highBound;
    },
    total() {
      return this.searchedData.length > 0
        ? this.searchedData.length
        : this.tableData.length;
    },
  },
  methods: {
    ...mapActions(["fetchPayments"]),
    statusBadgeClass,
    openEdit(row) {
      this.selectedPaymentRow = row;
      this.selectedPaymentId = row.id;
      this.editModalVisible = true;
    },
    closePaymentModal() {
      this.editModalVisible = false;
      this.selectedPaymentId = null;
      this.selectedPaymentRow = null;
    },
    handleEditSuccess(updatedPayment) {
      this.closePaymentModal();
      if (updatedPayment) {
        this.$store.commit("setPaymentUpdate", updatedPayment);
      }
      this.fetchPayments();
    },
    loadPayments() {
      this.loading = true;
      this.fetchPayments().finally(() => {
        this.loading = false;
        this.fuseSearch = new Fuse(this.tableData, {
          keys: [
            "client_name",
            "residential_name",
            "land_code",
            "payment_status_name",
          ],
          threshold: 0.3,
        });
      });
    },
  },
  watch: {
    searchQuery(value) {
      let result = this.tableData;
      if (value !== "" && this.fuseSearch) {
        result = this.fuseSearch.search(value).map((item) => item.item);
      }
      this.searchedData = result;
      this.pagination.currentPage = 1;
    },
  },
  created() {
    this.loadPayments();
  },
};
</script>

<style scoped>
.pagination-select,
.search-input {
  width: 200px;
}
</style>
