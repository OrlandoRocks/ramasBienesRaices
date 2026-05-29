<template>
  <div class="row">
    <!-- Residential Map Section -->
    <div class="col-12">
      <card>
        <template slot="header">
          <div class="d-flex justify-content-between align-items-center">
            <h4 class="card-title">Mapa de Residenciales</h4>
            <div class="residential-selector">
              <el-select
                v-model="selectedResidentialId"
                placeholder="Seleccionar Residencial"
                class="select-primary"
                style="width: 100%"
                size="large"
                filterable
              >
                <el-option
                  v-for="residential in getResidentials"
                  :key="residential.id"
                  :label="residential.name"
                  :value="residential.id"
                >
                </el-option>
              </el-select>
            </div>
          </div>
        </template>
        <div class="map-container-wrapper">
          <map-libre-view
            v-if="selectedResidentialId"
            ref="dashboardMap"
            :residential-id="selectedResidentialId"
            :key="selectedResidentialId"
            :interactive="false"
          ></map-libre-view>
          <div v-else class="map-placeholder">
            <i class="tim-icons icon-map-big"></i>
            <p>Selecciona un residencial para ver el mapa</p>
          </div>
        </div>
      </card>
    </div>

    <!-- Stats Cards -->
    <div class="col-lg-3 col-md-6" v-for="card in statsCards" :key="card.title">
      <stats-card
        :title="card.title"
        :sub-title="card.subTitle"
        :type="card.type"
        :icon="card.icon"
      >
        <div slot="footer" v-html="card.footer"></div>
      </stats-card>
    </div>

    <div class="col-lg-12">
      <card class="card" :header-classes="{ 'text-right': isRTL }">
        <h5 slot="header" class="card-title">Tabla de control</h5>
        <div class="table-responsive">
          <pending-payments-control-table
            :residential-id="selectedResidentialId"
          />
        </div>
      </card>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import { Select, Option } from "element-ui";
import PendingPaymentsControlTable from "./PendingPaymentsControlTable";
import StatsCard from "src/components/Cards/StatsCard";
import MapLibreView from "@/components/Maps/MapLibreView";

const DASHBOARD_RESIDENTIAL_STORAGE_KEY = "dashboard_selected_residential_id";

export default {
  components: {
    StatsCard,
    PendingPaymentsControlTable,
    MapLibreView,
    [Select.name]: Select,
    [Option.name]: Option,
  },
  data() {
    return {
      selectedResidentialId: null,
      hasRestoredResidentialSelection: false,
      statsCards: [
        {
          title: "150,000$",
          subTitle: "Pagos del Mes",
          type: "warning",
          icon: "tim-icons icon-money-coins",
          footer: '<i class="tim-icons icon-refresh-01"></i> Actualizar',
        },
        {
          title: "+45K",
          subTitle: "Terrenos Vendidos",
          type: "primary",
          icon: "tim-icons icon-world",
          footer: '<i class="tim-icons icon-pencil"></i> Lista de Terrenos',
        },
        {
          title: "150,000",
          subTitle: "Clientes",
          type: "info",
          icon: "tim-icons icon-single-02",
          footer: '<i class="tim-icons icon-pencil"></i> Ver Clientes',
        },
        {
          title: "23",
          subTitle: "Deudas del Mes",
          type: "danger",
          icon: "tim-icons icon-button-pause",
          footer: '<i class="tim-icons icon-pencil"></i> Ver Deudas',
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["getResidentials"]),
    enableRTL() {
      return this.$route.query.enableRTL;
    },
    isRTL() {
      return this.$rtl.isRTL;
    },
  },
  watch: {
    getResidentials(residentials) {
      if (this.hasRestoredResidentialSelection || !residentials.length) {
        return;
      }
      this.restoreSelectedResidential();
      this.hasRestoredResidentialSelection = true;
    },
    selectedResidentialId(id) {
      if (id === null || id === undefined || id === "") {
        localStorage.removeItem(DASHBOARD_RESIDENTIAL_STORAGE_KEY);
        return;
      }
      localStorage.setItem(DASHBOARD_RESIDENTIAL_STORAGE_KEY, String(id));
    },
  },
  methods: {
    ...mapActions(["fetchResidentials", "fetchLands"]),
    refreshDashboardMap() {
      this.fetchLands().finally(() => {
        if (this.$refs.dashboardMap) {
          this.$refs.dashboardMap.refreshMapTiles();
        } else {
          this.$root.$emit("refresh-map-tiles");
        }
      });
    },
    restoreSelectedResidential() {
      const savedId = localStorage.getItem(DASHBOARD_RESIDENTIAL_STORAGE_KEY);
      if (!savedId) {
        return;
      }

      const residential = this.getResidentials.find(
        (item) => String(item.id) === String(savedId)
      );

      if (residential) {
        this.selectedResidentialId = residential.id;
      } else {
        localStorage.removeItem(DASHBOARD_RESIDENTIAL_STORAGE_KEY);
      }
    },
  },
  mounted() {
    this.fetchResidentials();
    this.refreshDashboardMap();
    this.i18n = this.$i18n;
    if (this.enableRTL) {
      this.i18n.locale = "ar";
      this.$rtl.enableRTL();
    }
  },
  activated() {
    this.refreshDashboardMap();
  },
  beforeDestroy() {
    if (this.$rtl.isRTL) {
      this.i18n.locale = "en";
      this.$rtl.disableRTL();
    }
  },
};
</script>
<style scoped>
.map-container-wrapper {
  height: 450px;
  width: 100%;
  overflow: hidden;
  position: relative;
  border-radius: 8px;
}

.map-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.map-placeholder i {
  font-size: 48px;
  color: #9a9a9a;
  margin-bottom: 15px;
}

.map-placeholder p {
  color: #9a9a9a;
  font-size: 16px;
}

.residential-selector {
  min-width: 250px;
}
</style>
<style>
.map-container-wrapper .map-container {
  height: 100% !important;
}
.map-container-wrapper .map-libre {
  height: 100% !important;
}
</style>
