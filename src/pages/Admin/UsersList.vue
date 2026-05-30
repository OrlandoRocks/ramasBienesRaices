<template>
  <div class="content">
    <div class="col-md-8 ml-auto mr-auto">
      <h2 class="text-center">Usuarios del sistema</h2>
    </div>
    <div class="row mt-5">
      <div class="col-12">
        <card card-body-classes="table-full-width">
          <h4 slot="header" class="card-title">Usuarios</h4>
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
                />
              </el-select>
              <base-button @click="goToCreate" type="info">
                <i class="tim-icons icon-simple-add" /> Nuevo usuario
              </base-button>
              <base-input>
                <el-input
                  type="search"
                  class="mb-3 search-input"
                  clearable
                  prefix-icon="el-icon-search"
                  placeholder="Buscar usuarios"
                  v-model="searchQuery"
                />
              </base-input>
            </div>

            <div v-if="loadError" class="alert alert-danger">
              {{ loadError }}
            </div>

            <el-table v-loading="loading" :data="queriedData">
              <el-table-column prop="fullName" label="Nombre" min-width="180" />
              <el-table-column prop="email" label="Correo" min-width="200" />
              <el-table-column label="Rol" min-width="140">
                <template slot-scope="{ row }">
                  {{ roleLabel(row.roleName) }}
                </template>
              </el-table-column>
              <el-table-column label="Creado" min-width="120">
                <template slot-scope="{ row }">
                  {{ formatCreatedAt(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column :min-width="135" align="right" label="Acciones">
                <div slot-scope="props">
                  <base-button
                    @click.native="handleEdit(props.row)"
                    class="edit btn-link"
                    type="warning"
                    size="sm"
                    icon
                  >
                    <i class="tim-icons icon-pencil" />
                  </base-button>
                  <base-button
                    @click.native="handleDelete(props.row)"
                    class="remove btn-link"
                    type="danger"
                    size="sm"
                    icon
                    :disabled="isCurrentUser(props.row)"
                  >
                    <i class="tim-icons icon-simple-remove" />
                  </base-button>
                </div>
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
  </div>
</template>

<script>
import { Table, TableColumn, Select, Option } from "element-ui";
import { BasePagination } from "@/components";
import Fuse from "fuse.js";
import swal from "sweetalert2";
import { mapGetters, mapActions } from "vuex";
import { roleLabel, formatCreatedAt, extractApiErrors } from "@/util/userApi";

export default {
  name: "UsersList",
  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Select.name]: Select,
    [Option.name]: Option,
    BasePagination,
  },
  data() {
    return {
      loading: false,
      loadError: null,
      searchQuery: "",
      searchedData: [],
      fuseSearch: null,
      pagination: {
        perPage: 10,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50],
      },
    };
  },
  computed: {
    ...mapGetters(["getAdminUsers", "currentUser"]),
    tableData() {
      return this.getAdminUsers;
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
    ...mapActions(["fetchUsers", "deleteUser"]),
    roleLabel,
    formatCreatedAt,
    isCurrentUser(row) {
      return String(row.id) === String(this.currentUser?.id);
    },
    goToCreate() {
      this.$router.push({ name: "CreateUser" });
    },
    handleEdit(row) {
      this.$router.push({ name: "EditUser", params: { id: row.id } });
    },
    handleDelete(row) {
      if (this.isCurrentUser(row)) {
        return;
      }
      swal
        .fire({
          title: "¿Eliminar usuario?",
          text: `${row.fullName} (${row.email})`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
        })
        .then((result) => {
          if (!result.value) {
            return;
          }
          this.deleteUser(row.id)
            .then(() => {
              swal.fire({
                title: "Eliminado",
                text: "El usuario fue eliminado correctamente.",
                icon: "success",
                confirmButtonClass: "btn btn-success btn-fill",
                buttonsStyling: false,
              });
            })
            .catch((error) => {
              const messages = extractApiErrors(error);
              swal.fire({
                title: "Error",
                text: messages.join("\n"),
                icon: "error",
              });
            });
        });
    },
    loadUsers() {
      this.loading = true;
      this.loadError = null;
      this.fetchUsers()
        .then(() => {
          this.fuseSearch = new Fuse(this.tableData, {
            keys: ["fullName", "email", "roleName"],
            threshold: 0.3,
          });
        })
        .catch((error) => {
          this.loadError = extractApiErrors(error).join(" ");
          if (error.response?.status === 403) {
            this.$router.replace({ name: "Dashboard" });
          }
        })
        .finally(() => {
          this.loading = false;
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
    this.loadUsers();
  },
};
</script>
