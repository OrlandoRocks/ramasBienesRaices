<template>
  <div class="content">
    <div class="col-md-8 ml-auto mr-auto">
      <h2 class="text-center">Clientes</h2>
    </div>
    <div class="row mt-5">
      <div class="col-12">
        <card card-body-classes="table-full-width">
          <h4 slot="header" class="card-title">Elementos por Pagina</h4>
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
                  class="select-primary"
                  v-for="item in pagination.perPageOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
              <base-button @click="goToCreateResidential" type="info">
                <i class="tim-icons icon-simple-add"> </i> Crear Nuevo
              </base-button>
              <base-input>
                <el-input
                  type="search"
                  class="mb-3 search-input"
                  clearable
                  prefix-icon="el-icon-search"
                  placeholder="Buscar registros"
                  v-model="searchQuery"
                  aria-controls="datatables"
                >
                </el-input>
              </base-input>
            </div>
            <el-table :data="queriedData">
              <el-table-column
                v-for="column in tableColumns"
                :key="column.label"
                :min-width="column.minWidth"
                :prop="column.prop"
                :label="column.label"
              >
              </el-table-column>
              <el-table-column :min-width="135" align="right" label="Actions">
                <div slot-scope="props">
                  <base-button
                    @click.native="handleEdit(props.$index, props.row)"
                    class="edit btn-link"
                    type="warning"
                    size="sm"
                    icon
                  >
                    <i class="tim-icons icon-pencil"></i>
                  </base-button>
                  <base-button
                    @click.native="handleDelete(props.$index, props.row)"
                    class="remove btn-link"
                    type="danger"
                    size="sm"
                    icon
                  >
                    <i class="tim-icons icon-simple-remove"></i>
                  </base-button>
                </div>
              </el-table-column>
            </el-table>
          </div>
          <div
            slot="footer"
            class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap"
          >
            <div class="">
              <p class="card-category">
                Mostrando del {{ from + 1 }} al {{ to }} de
                {{ total }} resultados
              </p>
            </div>
            <base-pagination
              class="pagination-no-border"
              v-model="pagination.currentPage"
              :per-page="pagination.perPage"
              :total="total"
            >
            </base-pagination>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
import { Table, TableColumn, Select, Option } from "element-ui";
import { BasePagination } from "@/components";
import Fuse from "fuse.js";
import swal from "sweetalert2";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "ClientTable",
  components: {
    ElTable: Table,
    ElTableColumn: TableColumn,
    ElSelect: Select,
    ElOption: Option,
    BasePagination,
  },
  data() {
    return {
      pagination: {
        perPage: 5,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50],
        total: 0,
      },
      searchQuery: "",
      propsToSearch: ["full_name", "address", " email", "phone_number"],
      tableColumns: [
        {
          prop: "full_name",
          label: "Nombre",
          minWidth: 200,
        },
        {
          prop: "address",
          label: "Direccion",
          minWidth: 250,
        },
        {
          prop: "email",
          label: "Correo",
          minWidth: 120,
        },
        {
          prop: "phone_number",
          label: "Telefono",
          minWidth: 120,
        },
        {
          prop: "rfc",
          label: "RFC",
          minWidth: 120,
        },
        {
          prop: "lands",
          label: "Lotes",
          minWidth: 80,
        },
      ],
      searchedData: [],
      fuseSearch: null,
    };
  },
  computed: {
    ...mapGetters(["getClients"]),
    tableData() {
      return this.getClients;
    },
    queriedData() {
      let result = this.tableData;
      if (this.searchedData.length > 0) {
        result = this.searchedData;
      }
      return result.slice(this.from, this.to);
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
    ...mapActions(["fetchClients", "deleteClient"]),
    handleEdit(index, row) {
      this.$router.push(`/admin/clients/${row.id}/edit`);
    },
    handleDelete(index, row) {
      swal
        .fire({
          title: "¿Estas seguro?",
          text: "No podras revertir esta accion",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Si, borrar",
          cancelButtonText: "Cancelar",
        })
        .then((result) => {
          if (result.value) {
            this.deleteClient(row.id);
            this.deleteRow(row);
            swal.fire({
              title: "Eliminado!",
              text: `You deleted ${row.name}`,
              icon: "success",
              confirmButtonClass: "btn btn-success btn-fill",
              buttonsStyling: false,
            });
          }
        });
    },
    deleteRow(row) {
      let indexToDelete = this.tableData.findIndex(
        (tableRow) => tableRow.id === row.id
      );
      if (indexToDelete >= 0) {
        this.tableData.splice(indexToDelete, 1);
      }
    },
    goToCreateResidential() {
      this.$router.push({ name: "CreateClient" });
    },
  },
  mounted() {
    this.fuseSearch = new Fuse(this.getResidentials, {
      keys: ["full_name", "address", "phone_number", "email"],
      threshold: 0.3,
    });
  },
  created() {
    this.fetchClients();
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

<style scoped></style>
