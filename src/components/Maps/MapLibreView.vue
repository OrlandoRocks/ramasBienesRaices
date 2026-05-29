<template>
  <div class="map-container">
    <div :id="mapId" class="map-libre"></div>
  </div>
</template>

<script>
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { mapActions, mapGetters } from "vuex";

// Martin serves tiles at /{source}/{z}/{x}/{y} — do NOT use source.url (MapLibre requests …/source.json → 404).
const MARTIN_URL = process.env.VUE_APP_MARTIN_URL || "http://localhost:3030";

export default {
  name: "MapLibreView",
  props: {
    residentialId: {
      type: [Number, String],
      required: true,
    },
    center: {
      type: Array,
      // Test parcels from scripts/reset_postgis_test_lands.sql (~ -99, 19)
      default: () => [-99.0, 19.0003],
    },
    zoom: {
      type: Number,
      default: 16,
    },
    interactive: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      map: null,
      hoverPopup: null,
      mapId: `map-${Math.random().toString(36).substr(2, 9)}`,
    };
  },
  watch: {
    residentialId() {
      this.updateFilters();
    },
    getLands: {
      deep: true,
      handler() {
        this.refreshLandsSource();
      },
    },
  },
  computed: {
    ...mapGetters(["getLands"]),
  },
  mounted() {
    this.fetchLands();
    this.initMap();
    this.$root.$on("refresh-map-tiles", this.refreshMapTiles);
  },
  beforeDestroy() {
    this.$root.$off("refresh-map-tiles", this.refreshMapTiles);
    if (this.map) {
      this.map.remove();
    }
  },
  methods: {
    martinTiles(sourceId) {
      return [`${MARTIN_URL}/${sourceId}/{z}/{x}/{y}?t=${Date.now()}`];
    },
    landFillColorExpression() {
      const flagIsSet = (property) => [
        "any",
        ["==", ["get", property], 1],
        ["==", ["to-string", ["get", property]], "1"],
      ];

      return [
        "case",
        flagIsSet("is_late"),
        "#ff0000",
        flagIsSet("has_contract"),
        "#808080",
        flagIsSet("has_client"),
        "#808080",
        "#00ff00",
      ];
    },
    ...mapActions(["fetchLands"]),
    initMap() {
      const rid = parseInt(this.residentialId, 10);

      this.map = new maplibregl.Map({
        container: this.mapId,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "&copy; OpenStreetMap contributors",
            },
            geo_layers: {
              type: "vector",
              tiles: this.martinTiles("geo_layers"),
              minzoom: 0,
              maxzoom: 22,
            },
            lands: {
              type: "vector",
              tiles: this.martinTiles("lands"),
              minzoom: 0,
              maxzoom: 22,
            },
            residentials: {
              type: "vector",
              tiles: this.martinTiles("residentials"),
              minzoom: 0,
              maxzoom: 22,
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
            {
              id: "geo-layers-fill",
              type: "fill",
              source: "geo_layers",
              "source-layer": "geo_layers",
              filter: [
                "any",
                ["==", ["get", "residential_id"], rid],
                [
                  "==",
                  ["to-string", ["get", "residential_id"]],
                  String(this.residentialId),
                ],
              ],
              paint: {
                "fill-color": "#888",
                "fill-opacity": 0.25,
              },
            },
            {
              id: "geo-layers-line",
              type: "line",
              source: "geo_layers",
              "source-layer": "geo_layers",
              filter: [
                "any",
                ["==", ["get", "residential_id"], rid],
                [
                  "==",
                  ["to-string", ["get", "residential_id"]],
                  String(this.residentialId),
                ],
              ],
              paint: {
                "line-color": "#666",
                "line-width": 1,
              },
            },
            {
              id: "lands-fill",
              type: "fill",
              source: "lands",
              "source-layer": "lands",
              filter: [
                "any",
                ["==", ["get", "residential_id"], rid],
                [
                  "==",
                  ["to-string", ["get", "residential_id"]],
                  String(this.residentialId),
                ],
              ],
              paint: {
                "fill-color": this.landFillColorExpression(),
                "fill-opacity": 0.6,
              },
            },
            {
              id: "lands-outline",
              type: "line",
              source: "lands",
              "source-layer": "lands",
              filter: [
                "any",
                ["==", ["get", "residential_id"], rid],
                [
                  "==",
                  ["to-string", ["get", "residential_id"]],
                  String(this.residentialId),
                ],
              ],
              paint: {
                "line-color": "#fff",
                "line-width": 0.5,
              },
            },
          ],
        },
        center: this.center,
        zoom: this.zoom,
        interactive: this.interactive,
      });

      if (this.interactive) {
        this.map.addControl(new maplibregl.NavigationControl());
      }

      this.map.on("idle", () => {
        this.fitToResidential();
      });

      this.map.on("click", "lands-fill", (e) => {
        const feature = e.features[0];
        const { id } = feature.properties;

        // Redirect directly to the land edit page
        if (id) {
          this.$router.push(`/lands/${id}/edit`);
          return;
        }

        const land = this.getLands.find((l) => l.id === id);
        const land_code = land?.land_code ?? feature.properties.land_code;
        const block = land?.block ?? feature.properties.block;
        const house_number =
          land?.house_number ?? feature.properties.house_number;
        const size = land?.size ?? feature.properties.size;
        const price = land?.price ?? feature.properties.price;
        const client_name = land?.client_name ?? feature.properties.client_name;
        const is_late = feature.properties.is_late === 1;

        new maplibregl.Popup()
          .setLngLat(e.lngLat)
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
      });

      this.map.on("mouseenter", "lands-fill", (e) => {
        this.map.getCanvas().style.cursor = "pointer";

        const feature = e.features[0];
        const { id } = feature.properties;

        const land = this.getLands.find((l) => l.id === id);
        const land_code = land?.land_code ?? feature.properties.land_code;
        const block = land?.block ?? feature.properties.block;
        const house_number =
          land?.house_number ?? feature.properties.house_number;
        const size = land?.size ?? feature.properties.size;
        const price = land?.price ?? feature.properties.price;
        const client_name = land?.client_name ?? feature.properties.client_name;
        const is_late = feature.properties.is_late === 1;

        if (this.hoverPopup) {
          this.hoverPopup.remove();
        }

        this.hoverPopup = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
        })
          .setLngLat(e.lngLat)
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
      });
      this.map.on("mouseleave", "lands-fill", () => {
        this.map.getCanvas().style.cursor = "";
        if (this.hoverPopup) {
          this.hoverPopup.remove();
          this.hoverPopup = null;
        }
      });
    },
    updateFilters() {
      if (!this.map || !this.map.isStyleLoaded()) return;
      const rid = parseInt(this.residentialId, 10);
      const filter = [
        "any",
        ["==", ["get", "residential_id"], rid],
        [
          "==",
          ["to-string", ["get", "residential_id"]],
          String(this.residentialId),
        ],
      ];
      this.map.setFilter("geo-layers-fill", filter);
      this.map.setFilter("geo-layers-line", filter);
      this.map.setFilter("lands-fill", filter);
      this.map.setFilter("lands-outline", filter);
    },
    refreshMapTiles() {
      if (!this.map) return;

      ["lands", "geo_layers", "residentials"].forEach((sourceId) => {
        const source = this.map.getSource(sourceId);
        if (source) {
          source.setTiles(this.martinTiles(sourceId));
        }
      });
    },
    refreshLandsSource() {
      this.refreshMapTiles();
    },
    fitToResidential() {
      let features = this.map.querySourceFeatures("residentials", {
        sourceLayer: "residentials",
        filter: [
          "any",
          ["==", ["get", "id"], parseInt(this.residentialId, 10)],
          ["==", ["to-string", ["get", "id"]], String(this.residentialId)],
        ],
      });

      if (features.length === 0) {
        features = this.map.querySourceFeatures("lands", {
          sourceLayer: "lands",
          filter: [
            "any",
            ["==", ["get", "residential_id"], parseInt(this.residentialId, 10)],
            [
              "==",
              ["to-string", ["get", "residential_id"]],
              String(this.residentialId),
            ],
          ],
        });
      }

      if (features.length === 0) {
        features = this.map.querySourceFeatures("geo_layers", {
          sourceLayer: "geo_layers",
          filter: [
            "any",
            ["==", ["get", "residential_id"], parseInt(this.residentialId, 10)],
            [
              "==",
              ["to-string", ["get", "residential_id"]],
              String(this.residentialId),
            ],
          ],
        });
      }

      console.log(
        `Features found in tiles for residential_id ${this.residentialId}:`,
        features.length
      );

      if (features.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        features.forEach((feature) => {
          if (feature.geometry.type === "Point") {
            bounds.extend(feature.geometry.coordinates);
          } else if (
            feature.geometry.type === "Polygon" ||
            feature.geometry.type === "LineString"
          ) {
            feature.geometry.coordinates.forEach((ring) => {
              if (Array.isArray(ring[0])) {
                ring.forEach((coord) => bounds.extend(coord));
              } else {
                bounds.extend(ring);
              }
            });
          } else if (
            feature.geometry.type === "MultiPolygon" ||
            feature.geometry.type === "MultiLineString"
          ) {
            feature.geometry.coordinates.forEach((polygon) => {
              polygon.forEach((ring) => {
                if (Array.isArray(ring[0])) {
                  ring.forEach((coord) => bounds.extend(coord));
                } else {
                  bounds.extend(ring);
                }
              });
            });
          }
        });

        if (!bounds.isEmpty()) {
          this.map.fitBounds(bounds, { padding: 50, duration: 1000 });
        }
      }
    },
  },
};
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 500px;
}
.map-libre {
  width: 100%;
  height: 100%;
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
