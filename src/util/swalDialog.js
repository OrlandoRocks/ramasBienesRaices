import swal from "sweetalert2";

/** SweetAlert2 instance that stacks above Element UI dialogs (z-index ~2000+). */
export const swalAboveDialog = swal.mixin({
  customClass: {
    container: "swal-above-dialog",
  },
});

export default swalAboveDialog;
