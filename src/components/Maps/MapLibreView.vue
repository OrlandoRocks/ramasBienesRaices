<template>
  <residential-map
    ref="innerMap"
    :residential-id="residentialId"
    :interactive="interactive"
    :zoomable="zoomable"
    :land-clickable="landClickable"
  />
</template>

<script>
import ResidentialMap from "@/components/Maps/ResidentialMap.vue";

/**
 * @deprecated Use ResidentialMap directly. Kept for existing imports.
 */
export default {
  name: "MapLibreView",
  components: {
    ResidentialMap,
  },
  props: {
    residentialId: {
      type: [Number, String],
      required: true,
    },
    center: {
      type: Array,
      default: undefined,
    },
    zoom: {
      type: Number,
      default: undefined,
    },
    interactive: {
      type: Boolean,
      default: true,
    },
    zoomable: {
      type: Boolean,
      default: true,
    },
    landClickable: {
      type: Boolean,
      default: null,
    },
  },
  methods: {
    refreshMapTiles() {
      if (this.$refs.innerMap?.refreshMapTiles) {
        this.$refs.innerMap.refreshMapTiles();
      }
    },
    refreshLandsTiles() {
      this.refreshMapTiles();
    },
  },
};
</script>

<style scoped>
::v-deep .residential-map-wrap {
  height: 500px;
}
</style>
