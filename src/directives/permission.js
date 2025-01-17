export default {
  bind(el, binding, vnode) {
    const [model, action] = binding.value.split(".");
    const hasPermission = vnode.context.$store.getters["hasPermissionView"](model, action);
    if (!hasPermission) {
      el.style.display = "none";
    }
  },
};
