<template>
  <div class="content">
    <div class="col-md-8 ml-auto mr-auto">
      <h2 class="text-center">Balance General</h2>
    </div>
    <card>
      <!--<template slot="header">
        <h4 class="card-title">Fraccionamientos</h4>
         <p class="card-category">descripcion</p> 
      </template>-->
      <form class="form-horizontal" @submit.prevent="fetchRecords()">
        <card>
          <div class="row">
            <label class="col-sm-2 col-form-label in-middle" for="residential">Fraccionamiento:</label>
            <div class="col-sm-3">
              <el-select
                class="select-primary in-middle"
                style="width: 100%;"
                size="large"
                placeholder="Seleccionar el fracionamiento"
                v-model="residential_id"
                multiple
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
            </div>
            
            <label class="col-sm-1 col-form-label in-middle" for="month">Mes:</label>
            <div class="col-sm-2">
              <el-select 
                v-model="selectedMonth" 
                id="month" 
                class="select-primary in-middle"
                style="width: 100%;"
              >
                <el-option disabled value="">Seleccione un mes</el-option>
                <el-option v-for="(month, index) in months" :key="index" :value="index + 1" :label="month"></el-option>
              </el-select>
            </div>
            
            <label class="col-sm-1 col-form-label in-middle" for="year">Año:</label>
            <div class="col-sm-1">
              <base-input type="number" v-model="selectedYear" placeholder="Año" id="year" class="in-middle"></base-input>
            </div>
            <div class="col-sm-2 text-center">
              <button type="submit" class="btn btn-round btn-default">Buscar</button>
            </div>
          </div> 
        </card>
      </form>
      <div class="row">
        <div v-if="queriedData" class="col-md-12 ml-auto mr-auto">
          
          <div class="table-responsive">
            <el-divider></el-divider>
            <h4 class="info-labels">ACTIVOS</h4>
            <el-divider></el-divider>
            <el-table :data="queriedData" class="table" style="width: 100%;" :cell-style="cellStyle">
              <!--<el-table-column
                label="Column"
                prop="column"
                width="150">
              </el-table-column>
              <el-table-column
                label="Value"
                prop="value">
              </el-table-column>-->
              <el-table-column
                v-for="(column, index) in activeColumns"
                :key="column.label"
                :min-width="column.minWidth"
                :prop="column.prop"
                :label="index === 0 ? '' : column.label"
              >
              </el-table-column>
            </el-table>
          </div>

          <el-divider></el-divider>
          <h4 class="info-labels">PASIVOS</h4>
          <el-divider></el-divider>
          <div class="table-responsive">
            <el-table :data="queriedData" class="table" style="width: 100%;" :cell-style="cellStyle">
              <el-table-column
                v-for="(column, index) in pasiveColumns"
                :key="column.label"
                :min-width="column.minWidth"
                :prop="column.prop"
                :label="index === 0 ? '' : column.label"
              >
              </el-table-column>
            </el-table>
          </div>

          <el-divider></el-divider>
          <h4 class="info-labels">NETO</h4>
          <el-divider></el-divider>
          <div class="table-responsive">
            <el-table :data="lastRowData" class="table" style="width: 100%;" :show-header="false" :cell-style="cellStyle">
              <el-table-column
                v-for="column in totalColumn"
                :key="column.label"
                :min-width=120
                :prop="column.prop"
                :label="column.label"
              >
                <template v-slot="scope">
                  
                    ${{ scope.row[column.prop].toLocaleString() }}
                  
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div v-else class="col-md-12 ml-auto mr-auto">
          <p>No hay registros para este mes.</p>
        </div> 
      </div>
    </card>
  </div>
</template>
<script>
import { Table, TableColumn, Select, Option, Divider } from "element-ui";
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
    [Divider.name]: Divider,
  },
  computed: {
    ...mapGetters(["getBalanceData", "getResidentialsList"]),
    residentialsList() {
      return this.getResidentialsList;
    },
    tableData() {
      return this.getBalanceData;
    },
    queriedData() {
      let result = this.tableData;
      if (this.searchedData.length > 0) {
        result = this.searchedData;
      }
      //return result.slice(this.from, this.to);
      return result;
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
    tableDataWithSums() {
      if (this.queriedData.length === 0) {
        return [];
      }
      // Clone the original data to prevent modifying it directly
      const tableData = [...this.queriedData];

      // Calculate sums for each column
      const sums = { net_balance: this.tableData.reduce((sum, row) => {
        return sum + (row.net_balance || 0); // Sum values for "columnA" only
      }, 0) };

      // Optionally, add a label for the summed row
      sums.label = "Balance Neto";

      // Add the sum row to the end of the table data
      tableData.push(sums);

      return tableData;
    },
    lastRowData() {
      return this.tableDataWithSums.length > 0 ? [this.tableDataWithSums[this.tableDataWithSums.length - 1]] : [];
    }
    //transformedData() {
    //  const data = [];
      //this.queriedData.forEach((row, rowIndex) => {
        /* this.tableColumns.forEach((col, colIndex) => {
          data.push({
            column: col.label,
            value: this.queriedData[col.prop],
          });
        }); */
      //});
    //  return data;
    //}
  },
  data() {
    return {
      pagination: {
        perPage: 5,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50],
        total: 0,
      },
      activeColumns: [
        {
          prop: "name",
          label: "Nombre",
          width: 200,
        },
        {
          prop: "payments_by_month",
          label: "Monto",
          width: 120,
        }
      ],
      pasiveColumns: [
        {
          prop: "name",
          label: "Nombre",
          width: 200,
        },
        {
          prop: "expenses_by_month",
          label: "Monto",
          width: 120,
        }
      ],
      totalColumn: [
        {
          prop: "net_balance",
          label: "Balance Neto"
        }
      ],
      searchedData: [],
      fuseSearch: null,
      selectedMonth: "",
      selectedYear: new Date().getFullYear(),
      residentials: [],
      residentials_list: [],
      months: [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ],
      residential_id: [],
      //residential_id: ""
    };
  },
  methods: {
    ...mapActions([
      "fetchBalanceData"
    ]),
    async fetchRecords() {
      let filter_data = {
        residential_id: this.residential_id,
        month: this.selectedMonth,
        year: this.selectedYear
      };
      if (this.residential_id.length === 0) {
        swal
        .fire({
          title: "Favor de seleccionar fraccionamiento.",
          icon: "warning",
          //showCancelButton: true,
          customClass: {
            confirmButton: "btn btn-success btn-fill",
            //cancelButton: "btn btn-danger btn-fill",
          },
          confirmButtonText: "Aceptar",
          buttonsStyling: false,
        });
        return;
      } else if (!this.selectedMonth) {
        swal
        .fire({
          title: "Favor de seleccionar mes.",
          icon: "warning",
          //showCancelButton: true,
          customClass: {
            confirmButton: "btn btn-success btn-fill",
            //cancelButton: "btn btn-danger btn-fill",
          },
          confirmButtonText: "Aceptar",
          buttonsStyling: false,
        });
        return;
      } else {
        this.fetchBalanceData(filter_data)
      }
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        return {
          rowspan: 1,
          colspan: 2
        };
      } else {
        return {
          rowspan: 1,
          colspan: 1
        };
      }
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      const style = {};

      style.borderBottom = 'unset';

      if (columnIndex === 1) {
        style.fontWeight = 'bold';
      }

      if (column.property === 'net_balance') {
        style.fontWeight = 'bold';
      }

      return style;
    }
  },
  mounted() {
    this.fuseSearch = new Fuse(this.getBalanceResidentials, {
      keys: ["name", "address", "user_name"],
      threshold: 0.3,
    });
    this.$store.dispatch("residentialsList");
  },
  created() {
    //this.$store.dispatch("fetchBalanceResidentials");
  },
  watch: {
    
  },
};
</script>
<style scoped>
.pagination-select,
.search-input {
  width: 200px;
}
.swal2-icon-content {
  font-size: inherit !important;
}
.search-select {
  display: flex;
  align-items: center;
  justify-content: center;
}
.el-table {
  width: auto;
}
.el-table__body-wrapper {
  display: flex;
  flex-direction: row;
}
.el-table__body {
  display: flex;
  flex-direction: column;
}
.el-table__row {
  display: flex;
  flex-direction: column;
}
.in-middle {
  vertical-align: middle;
}
table tr th:nth-child(1),
table tr td:nth-child(1){
 display: none;
}
th:first-child {
  visibility:hidden;
}
.info-labels {
  margin: 15px;
  color: #e14eca;
  font-weight: bold;
}
.el-divider--horizontal {
  margin: 0 !important;
}
.amount-style {
  font-weight: bold;
}
</style>
