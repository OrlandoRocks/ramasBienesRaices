export default {
  methods: {
    hasPermission(model, action) {
      return this.$store.getters["hasPermission"](model, action);
    },
  },
};
