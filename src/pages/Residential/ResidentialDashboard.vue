<template>
  <div class="content">
    <div class="row">
      <div class="col-12">
        <card>
          <template slot="header">
            <h4 class="card-title">Mapa de {{ residential.name }}</h4>
          </template>
          <div class="map-container-wrapper">
            <map-libre-view
              v-if="residential.id"
              :residential-id="residential.id"
            ></map-libre-view>
          </div>
        </card>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-4 col-md-6">
        <stats-card
          title="Terrenos"
          :sub-title="String(landsCount)"
          type="info"
          icon="tim-icons icon-map-big"
        >
        </stats-card>
      </div>
      <div class="col-lg-4 col-md-6">
        <stats-card
          title="Vendidos"
          :sub-title="String(soldCount)"
          type="success"
          icon="tim-icons icon-check-2"
        >
        </stats-card>
      </div>
      <div class="col-lg-4 col-md-6">
        <stats-card
          title="Disponibles"
          :sub-title="String(availableCount)"
          type="warning"
          icon="tim-icons icon-tag"
        >
        </stats-card>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import MapLibreView from "@/components/Maps/MapLibreView";
import StatsCard from "@/components/Cards/StatsCard";

export default {
  name: "ResidentialDashboard",
  components: {
    MapLibreView,
    StatsCard,
  },
  data() {
    return {
      residential: {},
    };
  },
  computed: {
    ...mapGetters(["getResidentialById"]),
    landsCount() {
      return this.residential.lands ? this.residential.lands.length : 0;
    },
    soldCount() {
      return this.residential.lands
        ? this.residential.lands.filter((l) => l.has_contract).length
        : 0;
    },
    availableCount() {
      return this.landsCount - this.soldCount;
    },
  },
  mounted() {
    this.loadResidential();
  },
  methods: {
    ...mapActions(["fetchResidentialById"]),
    loadResidential() {
      const id = this.$route.params.id;
      this.fetchResidentialById(id).then((res) => {
        this.residential = res;
      });
    },
  },
};
</script>

<style scoped>
.map-container-wrapper {
  height: 500px;
  width: 100%;
}
</style>
