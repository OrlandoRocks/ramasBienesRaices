<template>
  <div class="content">
<!--    <div class="col-md-8 ml-auto mr-auto">-->
<!--      <h2 class="text-center">Contratos</h2>-->
<!--    </div>-->
    <div class="row mt-5">
      <div class="col-12">
        <base-table :data="tableData" thead-classes="text-primary">
          <template slot="columns">
            <th>#</th>
            <th>Nombre Cliente</th>
            <th>Fecha de Contrato</th>
            <th>Tipo de Contrato</th>
            <th>Meses</th>
            <th>Precio Total</th>
            <th>Total Pagado</th>
            <th>Progreso</th>
            <th>Acciones</th>
          </template>

          <template slot-scope="{ row, index }">
            <td>{{ row.client_id }}</td>
            <td>{{ row.client_name }}</td>
            <td>{{ row.contract_date }}</td>
            <td>{{ row.type }}</td>
            <td>{{ row.months }}</td>
            <td>{{ formatCurrency(row.total_price) }}</td>
            <td>{{ formatCurrency(row.total_paid) }}</td>
            <td class="text-center">
              <base-progress :value="parseInt(row.progress)" />
            </td>
            <td class="text-center">
              <base-button
                @click.native="handleShow(row.id)"
                class="edit btn-link"
                type="warning"
                size="sm"
                icon
              >
                <i class="tim-icons icon-zoom-split"></i>
              </base-button>
            </td>
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>
<script>
import { BaseTable, BaseProgress, BasePagination } from "@/components";
import { Table, TableColumn, Select, Option } from "element-ui";
import Fuse from "fuse.js";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "MyContracts",
  components: {
    BaseTable,
    BaseProgress,
    BasePagination,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["getUserContracts", "getUserID"]),
    tableData() {
      return this.getUserContracts;
    },
    to() {
      let highBound = this.from + this.pagination.perPage;
      if (this.total < highBound) {
        highBound = this.total;
      }
      return highBound;
    },
    from() {
      return this.pagination.perPage * (this.pagination.currentPage - 1);
    },
    total() {
      return this.searchedData.length > 0
        ? this.searchedData.length
        : this.tableData.length;
    },
  },
  methods: {
    ...mapActions(["fetchUserContracts"]),
    loadContractsData(user_id) {
      this.fetchUserContracts(user_id);
    },
    handleShow(row) {
      this.$router.push(`/contracts/${row}/show`);
    },
    goToCreateContract() {
      this.$router.push({ name: "CreateContract" });
    },
  },
  mounted() {
    this.fuseSearch = new Fuse(this.getContracts, {
      keys: ["full_name", "address", "phone_number", "email"],
      threshold: 0.3,
    });
  },
  created() {
    const user_id = 3;
    if (user_id) {
      this.loadContractsData(user_id);
    }
  },
  watch: {
    searchQuery(value) {
      let result = this.tableData;
      if (value !== "") {
        const searchResult = this.fuseSearch.search(this.searchQuery);
        result = searchResult.map((item) => item.item);
      }
      this.searchedData = result;
    },
  },
};
</script>
<style></style>
