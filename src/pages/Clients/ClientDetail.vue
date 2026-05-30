<template>
  <div class="col-md-12">
    <card>
      <h4 slot="header" class="card-title clickable" @click="goToClients">
        <i class="tim-icons icon-minimal-left"></i>
        Clientes
      </h4>
      <div v-if="loading" class="text-center py-4 text-muted">Cargando...</div>
      <div v-else-if="loadError" class="text-danger py-4">{{ loadError }}</div>
      <div v-else class="card-body">
        <h3 class="mb-1">{{ client.full_name }}</h3>
        <p class="text-muted mb-3">
          {{ client.email }} · {{ client.phone_number }}
        </p>
        <div class="row mb-3">
          <div class="col-md-6">
            <p><b>RFC:</b> {{ client.rfc || "—" }}</p>
            <p><b>Dirección:</b> {{ client.address || "—" }}</p>
          </div>
          <div class="col-md-6">
            <p>
              <b>Ciudad:</b> {{ client.city || "—" }}, {{ client.state || "—" }}
            </p>
            <p><b>Código:</b> {{ client.code || "—" }}</p>
          </div>
        </div>
        <client-documents-section
          :client="client"
          :client-id="client.id"
          :editable="false"
        />
        <div v-if="$can('clients.update')" class="text-center mt-3">
          <base-button type="primary" @click="goToEdit">
            Editar cliente
          </base-button>
        </div>
      </div>
    </card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import ClientDocumentsSection from "@/components/Clients/ClientDocumentsSection.vue";
import { extractApiErrors } from "@/util/userApi";

export default {
  name: "ClientDetail",
  components: {
    ClientDocumentsSection,
  },
  data() {
    return {
      loading: false,
      loadError: null,
    };
  },
  computed: {
    ...mapGetters(["getClientById"]),
    client() {
      return this.getClientById;
    },
  },
  created() {
    this.loadClient();
  },
  methods: {
    ...mapActions(["fetchClientById"]),
    loadClient() {
      const id = this.$route.params.id;
      if (!id) {
        this.loadError = "Cliente no encontrado.";
        return;
      }
      this.loading = true;
      this.loadError = null;
      this.fetchClientById(id)
        .catch((error) => {
          this.loadError = extractApiErrors(error).join(" ");
        })
        .finally(() => {
          this.loading = false;
        });
    },
    goToClients() {
      this.$router.push({ name: "Clients" });
    },
    goToEdit() {
      this.$router.push({ name: "EditClient", params: { id: this.client.id } });
    },
  },
};
</script>

<style scoped>
.clickable {
  cursor: pointer;
}
.clickable:hover {
  color: #e14eca !important;
}
</style>
