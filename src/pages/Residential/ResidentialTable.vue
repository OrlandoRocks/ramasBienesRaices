<template>
  <div class="content">
    <div class="col-md-8 ml-auto mr-auto">
      <h2 class="text-center">Fraccionamientos</h2>
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
                    @click.native="handleLike(props.$index, props.row)"
                    class="like btn-link"
                    type="info"
                    size="sm"
                    icon
                  >
                    <i class="tim-icons icon-heart-2"></i>
                  </base-button>
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
import { BasePagination } from "src/components";
import Fuse from "fuse.js";
import swal from "sweetalert2";
import { mapGetters, mapActions } from "vuex";

export default {
  components: {
    BasePagination,
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
  },
  computed: {
    ...mapGetters(["getResidentials"]),
    tableData() {
      return this.getResidentials;
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
  data() {
    return {
      pagination: {
        perPage: 5,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50],
        total: 0,
      },
      searchQuery: "",
      propsToSearch: ["name", "address", "user_name"],
      tableColumns: [
        {
          prop: "name",
          label: "Nombre",
          minWidth: 200,
        },
        {
          prop: "address",
          label: "Direccion",
          minWidth: 250,
        },
        {
          prop: "user_name",
          label: "Responsable",
          minWidth: 120,
        },
        {
          prop: "lands_count",
          label: "Lotes",
          minWidth: 100,
        },
        {
          prop: "cost",
          label: "Costo/precio",
          minWidth: 120,
        },
        {
          prop: "total_expenses",
          label: "Gastos",
          minWidth: 120,
        },
      ],
      searchedData: [],
      fuseSearch: null,
    };
  },
  methods: {
    ...mapActions(["fetchResidentials", "deleteResidential"]),
    handleLike(index, row) {
      swal.fire({
        title: `Has marcado como favorito el ${row.name}`,
        buttonsStyling: false,
        icon: "success",
        customClass: {
          confirmButton: "btn btn-success btn-fill",
        },
      });
    },
    handleEdit(index, row) {
      this.$router.push({ name: "EditResidential", params: { id: row.id } });
    },
    handleDelete(index, row) {
      swal
        .fire({
          title: "Estas seguro?",
          text: `No podras revertir estos cambios!`,
          icon: "warning",
          showCancelButton: true,
          customClass: {
            confirmButton: "btn btn-success btn-fill",
            cancelButton: "btn btn-danger btn-fill",
          },
          confirmButtonText: "Si, Borralo!",
          buttonsStyling: false,
        })
        .then((result) => {
          if (result.value) {
            this.deleteResidential(row.id);
            this.deleteRow(row);
            swal.fire({
              title: "Eliminado!",
              text: `Has Borrado: ${row.name}`,
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
      this.$router.push({ name: "CreateResidential" });
    },
  },
  mounted() {
    this.fuseSearch = new Fuse(this.getResidentials, {
      keys: ["name", "address", "user_name"],
      threshold: 0.3,
    });
  },
  created() {
    this.$store.dispatch("fetchResidentials");
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
<style>
.pagination-select,
.search-input {
  width: 200px;
}
.swal2-icon-content {
  font-size: inherit !important;
}
</style>
