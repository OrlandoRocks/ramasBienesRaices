<template>
  <div class="residential-map-wrap">
    <div ref="mapContainer" class="residential-map" />
    <div v-if="loading" class="residential-map-overlay">Cargando mapa…</div>
    <div v-else-if="loadError" class="residential-map-overlay text-danger">
      {{ loadError }}
    </div>
    <p
      v-if="showNoGeometryHint && !loading && !loadError"
      class="residential-map-hint text-muted"
    >
      No hay geometría cargada para este desarrollo
    </p>
  </div>
</template>

<script>
import axios from "axios";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { mapActions, mapGetters } from "vuex";
import {
  fitBoundsFromResidential,
  landFillColorExpression,
  landsTileUrlForResidential,
  landsTileUrlWithCacheBuster,
} from "@/util/residentialMap";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;
const DEFAULT_CENTER = [-106.92, 28.39];

function authConfig() {
  return {
    headers: {
      Authorization: localStorage.getItem("auth_token"),
    },
  };
}

export default {
  name: "ResidentialMap",
  props: {
    residentialId: {
      type: [Number, String],
      required: true,
    },
    interactive: {
      type: Boolean,
      default: true,
    },
    /** Pan/zoom controls (NavigationControl + map gestures). Can be true while interactive is false. */
    zoomable: {
      type: Boolean,
      default: true,
    },
    /** Click/hover on parcels → land edit. Defaults to match `interactive`. */
    landClickable: {
      type: Boolean,
      default: null,
    },
  },
  data() {
    return {
      map: null,
      residential: null,
      loading: false,
      loadError: null,
      mapReady: false,
      hoverPopup: null,
      boundaryLoaded: false,
      landInteractionsBound: false,
    };
  },
  computed: {
    ...mapGetters(["getLands"]),
    enableLandClicks() {
      if (this.landClickable !== null && this.landClickable !== undefined) {
        return this.landClickable;
      }
      return this.interactive;
    },
    showNoGeometryHint() {
      if (!this.residential || this.loading || this.loadError) {
        return false;
      }
      return !this.residential.map_bounds && !this.residential.map_center;
    },
  },
  watch: {
    residentialId: {
      immediate: true,
      handler() {
        this.loadResidential();
      },
    },
    getLands: {
      deep: true,
      handler() {
        this.refreshLandsTiles();
      },
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.ensureMap();
    });
    this.$root.$on("refresh-map-tiles", this.refreshLandsTiles);
  },
  beforeDestroy() {
    this.$root.$off("refresh-map-tiles", this.refreshLandsTiles);
    if (this.hoverPopup) {
      this.hoverPopup.remove();
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  },
  methods: {
    ...mapActions(["fetchLands"]),

    async loadResidential() {
      const id = this.residentialId;
      if (!id) {
        return;
      }

      this.loading = true;
      this.loadError = null;
      this.boundaryLoaded = false;

      try {
        const { data } = await axios.get(
          `${BASE_URL}/residentials/${id}`,
          authConfig()
        );
        this.residential = data;
        this.fetchLands().catch(() => {});
        await this.$nextTick();
        this.ensureMap();
        this.applyResidentialToMap();
        this.loadBoundaryGeoJson();
      } catch (error) {
        console.error("Failed to load residential for map", error);
        this.loadError = "No se pudo cargar el mapa";
        this.residential = null;
      } finally {
        this.loading = false;
        this.$nextTick(() => this.resizeMap());
      }
    },

    ensureMap() {
      if (this.map || !this.$refs.mapContainer) {
        return;
      }
      this.initMap();
    },

    resizeMap() {
      if (this.map) {
        this.map.resize();
      }
    },

    initMap() {
      if (!this.$refs.mapContainer) {
        return;
      }
      this.map = new maplibregl.Map({
        container: this.$refs.mapContainer,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "&copy; OpenStreetMap contributors",
            },
          },
          layers: [
            {
              id: "osm-layer",
              type: "raster",
              source: "osm",
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: DEFAULT_CENTER,
        zoom: 14,
        interactive: this.interactive || this.zoomable,
        doubleClickZoom: this.interactive,
      });

      if (this.zoomable) {
        this.map.addControl(new maplibregl.NavigationControl());
      }

      this.map.on("load", () => {
        this.mapReady = true;
        this.resizeMap();
        if (this.residential) {
          this.applyResidentialToMap();
          this.loadBoundaryGeoJson();
        }
      });
    },

    applyResidentialToMap() {
      const r = this.residential;
      if (!r || !this.map || !this.mapReady) {
        return;
      }

      const tiles = [landsTileUrlForResidential(r)].filter(Boolean);
      if (!tiles.length) {
        return;
      }

      const sourceId = "lands";

      if (this.map.getSource(sourceId)) {
        this.map.getSource(sourceId).setTiles(tiles);
      } else {
        this.map.addSource(sourceId, {
          type: "vector",
          tiles,
          minzoom: 0,
          maxzoom: 22,
        });

        this.map.addLayer({
          id: "lands-fill",
          type: "fill",
          source: sourceId,
          "source-layer": "lands",
          paint: {
            "fill-color": landFillColorExpression(),
            "fill-opacity": 0.6,
          },
        });

        this.map.addLayer({
          id: "lands-outline",
          type: "line",
          source: sourceId,
          "source-layer": "lands",
          paint: {
            "line-color": "#ffffff",
            "line-width": 0.5,
          },
        });

        this.bindLandInteractions();
      }

      fitBoundsFromResidential(this.map, r);
      this.$nextTick(() => this.resizeMap());
    },

    async loadBoundaryGeoJson() {
      const id = this.residential?.id;
      if (!id || !this.map || !this.mapReady || this.boundaryLoaded) {
        return;
      }

      try {
        const { data } = await axios.get(
          `${BASE_URL}/residentials/${id}/geojson`,
          authConfig()
        );

        const sourceId = "residential-boundary";
        if (this.map.getSource(sourceId)) {
          this.map.getSource(sourceId).setData(data);
        } else {
          this.map.addSource(sourceId, {
            type: "geojson",
            data,
          });
          this.map.addLayer({
            id: "residential-boundary-line",
            type: "line",
            source: sourceId,
            paint: {
              "line-color": "#e63946",
              "line-width": 2,
              "line-dasharray": [2, 2],
            },
          });
        }
        this.boundaryLoaded = true;
      } catch {
        // Optional overlay — ignore if unavailable
      }
    },

    refreshLandsTiles() {
      if (!this.map || !this.mapReady || !this.residential) {
        return;
      }

      const source = this.map.getSource("lands");
      if (!source) {
        this.applyResidentialToMap();
        return;
      }

      const url = landsTileUrlWithCacheBuster(this.residential);
      if (url) {
        source.setTiles([url]);
      }
    },

    /** Backward-compatible alias (Dashboard ref, legacy MapLibreView). */
    refreshMapTiles() {
      this.refreshLandsTiles();
    },

    bindLandInteractions() {
      if (
        !this.map ||
        !this.enableLandClicks ||
        this.landInteractionsBound ||
        !this.map.getLayer("lands-fill")
      ) {
        return;
      }

      this.landInteractionsBound = true;

      this.map.on("click", "lands-fill", (e) => {
        if (e.originalEvent) {
          e.originalEvent.stopPropagation();
        }
        const feature = e.features[0];
        const landId = this.landIdFromFeature(feature);

        if (landId && this.canOpenLandEdit()) {
          this.$router.push({
            name: "EditLand",
            params: { id: String(landId) },
          });
          return;
        }

        this.showLandPopup(e.lngLat, feature);
      });

      this.map.on("mouseenter", "lands-fill", (e) => {
        this.map.getCanvas().style.cursor = "pointer";
        if (this.hoverPopup) {
          this.hoverPopup.remove();
        }
        this.hoverPopup = this.showLandPopup(e.lngLat, e.features[0], {
          closeButton: false,
          closeOnClick: false,
        });
      });

      this.map.on("mouseleave", "lands-fill", () => {
        this.map.getCanvas().style.cursor = "";
        if (this.hoverPopup) {
          this.hoverPopup.remove();
          this.hoverPopup = null;
        }
      });
    },

    landIdFromFeature(feature) {
      const props = feature?.properties || {};
      return props.id ?? props.land_id ?? props.landId ?? null;
    },

    canOpenLandEdit() {
      return this.$can("lands.update") || this.$can("lands.show");
    },

    showLandPopup(lngLat, feature, options = {}) {
      const id = this.landIdFromFeature(feature);
      const land = this.getLands.find((l) => String(l.id) === String(id));
      const land_code = land?.land_code ?? feature.properties.land_code;
      const block = land?.block ?? feature.properties.block;
      const house_number =
        land?.house_number ?? feature.properties.house_number;
      const size = land?.size ?? feature.properties.size;
      const price = land?.price ?? feature.properties.price;
      const client_name = land?.client_name ?? feature.properties.client_name;
      const is_late = feature.properties.is_late === 1;

      const popup = new maplibregl.Popup(options)
        .setLngLat(lngLat)
        .setHTML(
          `
            <div class="map-popup">
              <h6>Terreno: ${land_code ?? "—"}</h6>
              ${
                client_name
                  ? `<p><strong>Cliente:</strong> ${client_name}</p>`
                  : ""
              }
              ${
                is_late
                  ? `<p style="color: #ff4d4d;"><strong>⚠️ Pago Atrasado</strong></p>`
                  : ""
              }
              <p><strong>Bloque:</strong> ${block ?? "—"}</p>
              <p><strong>Número de Casa:</strong> ${house_number ?? "—"}</p>
              <p><strong>Tamaño:</strong> ${size ?? "—"}</p>
              <p><strong>Precio:</strong> ${
                price != null ? `$${Number(price).toLocaleString()}` : "—"
              }</p>
            </div>
          `
        )
        .addTo(this.map);

      return popup;
    },
  },
};
</script>

<style scoped>
.residential-map-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.residential-map {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.residential-map-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 30, 47, 0.85);
  pointer-events: none;
}

.residential-map-hint {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  margin: 0;
  padding: 6px 12px;
  font-size: 0.8rem;
  background: rgba(30, 30, 47, 0.9);
  border-radius: 4px;
  pointer-events: none;
}
</style>

<style>
.maplibregl-popup-content {
  background-color: black !important;
  color: white !important;
}
.maplibregl-popup-tip {
  border-top-color: black !important;
  border-bottom-color: black !important;
}
.map-popup {
  color: white;
}
.map-popup h6 {
  margin-bottom: 5px;
  color: white;
}
.map-popup p {
  margin-bottom: 2px;
  color: white;
}
</style>
