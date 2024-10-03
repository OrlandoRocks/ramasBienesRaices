<template>
  <div class="content">
    <div class="col-md-8 ml-auto mr-auto">
      <h2 class="text-center">Terrenos</h2>
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
              <base-button @click="goToCreateLand" type="info">
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
                :formatter="
                  typeof column.formatter === 'function'
                    ? column.formatter
                    : null
                "
              >
                <template
                  #default="{ row }"
                  v-if="typeof column.formatter !== 'function'"
                >
                  <div
                    v-if="column.formatter"
                    :is="column.formatter"
                    :row="row"
                    :column="column"
                  ></div>
                  <template v-else>
                    {{ row[column.prop] }}
                  </template>
                </template>
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
                    class="delete btn-link"
                    type="danger"
                    size="sm"
                    icon
                  >
                    <i class="tim-icons icon-trash-simple"></i>
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
                mostrando de {{ from + 1 }} a {{ to }} de {{ total }} registros
              </p>
            </div>
            <base-pagination
              class="pagination-no-border"
              v-model="pagination.currentPage"
              :per-page="pagination.perPage"
              :total="total"
            ></base-pagination>
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
import { mapActions, mapGetters } from "vuex";

export default {
  name: "LandTable",
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
        perPage: 10,
        perPageOptions: [10, 20, 30, 40, 50],
        currentPage: 1,
        total: 0,
      },
      searchQuery: "",
      propsToSearch: [
        "residential_name",
        "land_code",
        "address",
        "house_number",
        "size",
        "price",
      ],
      tableColumns: [
        { prop: "residential_name", label: "Fraccionamiento", minWidth: 200 },
        { prop: "land_code", label: "Codigo", minWidth: 100 },
        { prop: "address", label: "Dirección", minWidth: 250 },
        { prop: "house_number", label: "Número de Casa", minWidth: 100 },
        { prop: "size", label: "Tamaño", minWidth: 100 },
        {
          prop: "price",
          label: "Precio",
          minWidth: 100,
          formatter: (row) => {
            return `${this.formatCurrency(row.price)}`;
          },
        },
      ],
      searchedData: [],
      fuseSearch: null,
    };
  },
  computed: {
    ...mapGetters(["getLands"]),
    tableData() {
      return this.getLands;
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
    ...mapActions(["fetchLands", "deleteLand"]),
    handleEdit(index, row) {
      this.$router.push(`/lands/${row.id}/edit`);
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
            this.deleteLand(row.id);
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
    goToCreateLand() {
      this.$router.push({ name: "CreateLand" });
    },
  },
  mounted() {
    this.fuseSearch = new Fuse(this.getLands, {
      keys: [
        "residential_name",
        "land_code",
        "address",
        "house_number",
        "size",
        "price",
      ],
      threshold: 0.3,
    });
  },
  created() {
    this.fetchLands();
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
