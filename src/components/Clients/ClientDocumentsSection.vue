<template>
  <card class="client-documents-section">
    <h4 slot="header" class="card-title">Documentos KYC</h4>
    <div class="card-body">
      <div
        v-for="doc in CLIENT_DOCUMENTS"
        :key="doc.key"
        class="document-row mb-4 pb-3 border-bottom"
      >
        <div class="d-flex flex-wrap align-items-center justify-content-between mb-2">
          <h5 class="mb-0">{{ doc.label }}</h5>
          <span
            class="badge"
            :class="statusBadgeClass(documentMeta(doc).verification_status)"
          >
            {{ statusLabel(documentMeta(doc).verification_status) }}
          </span>
        </div>

        <div v-if="documentMeta(doc).attached" class="document-meta text-muted mb-2">
          <div>
            <strong>Archivo:</strong>
            {{ documentMeta(doc).filename || "—" }}
          </div>
          <div v-if="documentMeta(doc).byte_size">
            <strong>Tamaño:</strong>
            {{ formatDocumentByteSize(documentMeta(doc).byte_size) }}
          </div>
        </div>
        <p v-else class="text-muted mb-2">
          Sin archivo — sube {{ doc.label }}
        </p>

        <div
          v-if="localPreviewUrl(doc)"
          class="document-preview mb-2"
        >
          <img
            :src="localPreviewUrl(doc)"
            :alt="doc.label"
            class="img-fluid rounded"
            style="max-height: 200px"
          />
        </div>

        <div class="d-flex flex-wrap align-items-center mb-2">
          <base-button
            v-if="canDownload && documentMeta(doc).attached"
            type="info"
            size="sm"
            class="mr-2 mb-1"
            :disabled="loadingDoc === doc.key"
            @click="viewDocument(doc)"
          >
            Ver
          </base-button>
          <base-button
            v-if="canDownload && documentMeta(doc).attached"
            type="default"
            size="sm"
            class="mb-1"
            :disabled="loadingDoc === doc.key"
            @click="downloadDocument(doc)"
          >
            Descargar
          </base-button>
        </div>

        <div v-if="editable && canUpload" class="mt-2">
          <label class="btn btn-default btn-sm btn-file mb-0">
            {{ pendingFileName(doc) ? "Cambiar archivo" : "Seleccionar archivo" }}
            <input
              type="file"
              class="d-none"
              :accept="doc.accept"
              @change="onFileSelected(doc, $event)"
            />
          </label>
          <small v-if="pendingFileName(doc)" class="d-block text-muted mt-1">
            Seleccionado: {{ pendingFileName(doc) }}
          </small>
          <small v-else class="d-block text-muted mt-1">
            PDF, JPG o PNG — máximo 10 MB
          </small>
          <p v-if="fieldErrors[doc.param]" class="text-danger small mb-0 mt-1">
            {{ fieldErrors[doc.param] }}
          </p>
        </div>

        <div
          v-if="editable && canVerify && showVerificationSelect(doc)"
          class="row mt-2"
        >
          <label class="col-sm-4 col-form-label">Estado de verificación:</label>
          <div class="col-sm-6">
            <el-select
              class="select-primary w-100"
              size="small"
              :value="verificationValue(doc)"
              @change="onVerificationChange(doc, $event)"
            >
              <el-option
                v-for="status in VERIFICATION_STATUSES"
                :key="status"
                :label="VERIFICATION_STATUS_LABELS[status]"
                :value="status"
              />
            </el-select>
          </div>
        </div>
      </div>
    </div>
  </card>
</template>

<script>
import { Select, Option } from "element-ui";
import {
  CLIENT_DOCUMENTS,
  VERIFICATION_STATUSES,
  VERIFICATION_STATUS_LABELS,
  VERIFICATION_STATUS_BADGE_CLASS,
  emptyDocumentsPayload,
} from "@/constants/clientDocuments";
import {
  formatDocumentByteSize,
  validateClientDocumentFile,
} from "@/util/clientDocumentValidation";
import { downloadClientDocument } from "@/services/clientsService";

export default {
  name: "ClientDocumentsSection",
  components: {
    [Select.name]: Select,
    [Option.name]: Option,
  },
  props: {
    client: {
      type: Object,
      default: () => ({}),
    },
    clientId: {
      type: [String, Number],
      default: null,
    },
    editable: {
      type: Boolean,
      default: false,
    },
    pendingFiles: {
      type: Object,
      default: () => ({}),
    },
    verificationStatuses: {
      type: Object,
      default: () => ({}),
    },
    fieldErrors: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      CLIENT_DOCUMENTS,
      VERIFICATION_STATUSES,
      VERIFICATION_STATUS_LABELS,
      loadingDoc: null,
      previewUrls: {},
    };
  },
  computed: {
    canUpload() {
      return this.$can("clients.create") || this.$can("clients.update");
    },
    canDownload() {
      return this.$can("clients.show");
    },
    canVerify() {
      return this.$can("clients.update");
    },
    documents() {
      return this.client?.documents || emptyDocumentsPayload();
    },
  },
  watch: {
    pendingFiles: {
      deep: true,
      handler() {
        this.syncPreviewUrls();
      },
    },
  },
  beforeDestroy() {
    Object.values(this.previewUrls).forEach((url) => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    });
  },
  methods: {
    formatDocumentByteSize,
    documentMeta(doc) {
      return this.documents[doc.key] || { attached: false, verification_status: "pending" };
    },
    statusLabel(status) {
      return VERIFICATION_STATUS_LABELS[status] || status || "—";
    },
    statusBadgeClass(status) {
      return VERIFICATION_STATUS_BADGE_CLASS[status] || "badge-secondary";
    },
    pendingFileName(doc) {
      const file = this.pendingFiles[doc.param];
      return file?.name || "";
    },
    localPreviewUrl(doc) {
      return this.previewUrls[doc.param] || null;
    },
    showVerificationSelect(doc) {
      return !this.pendingFiles[doc.param];
    },
    verificationValue(doc) {
      if (this.verificationStatuses[doc.statusField]) {
        return this.verificationStatuses[doc.statusField];
      }
      return this.documentMeta(doc).verification_status || "pending";
    },
    onFileSelected(doc, event) {
      const file = event.target.files?.[0] || null;
      event.target.value = "";
      if (!file) {
        return;
      }
      const error = validateClientDocumentFile(file, doc);
      if (error) {
        this.$emit("field-error", { param: doc.param, message: error });
        return;
      }
      this.$emit("field-error", { param: doc.param, message: null });
      this.$emit("file-selected", { param: doc.param, file });
    },
    onVerificationChange(doc, value) {
      this.$emit("verification-change", {
        field: doc.statusField,
        value,
      });
    },
    syncPreviewUrls() {
      CLIENT_DOCUMENTS.forEach((doc) => {
        const file = this.pendingFiles[doc.param];
        if (this.previewUrls[doc.param]) {
          URL.revokeObjectURL(this.previewUrls[doc.param]);
          this.$delete(this.previewUrls, doc.param);
        }
        if (file && file.type && file.type.startsWith("image/")) {
          this.$set(this.previewUrls, doc.param, URL.createObjectURL(file));
        }
      });
    },
    async fetchDocumentBlob(doc, disposition) {
      const id = this.clientId || this.client?.id;
      if (!id) {
        throw new Error("Cliente sin identificador");
      }
      const response = await downloadClientDocument(id, doc.key, { disposition });
      const contentType =
        response.headers["content-type"] || "application/octet-stream";
      return new Blob([response.data], { type: contentType });
    },
    async viewDocument(doc) {
      const meta = this.documentMeta(doc);
      if (!meta.attached) {
        return;
      }
      this.loadingDoc = doc.key;
      try {
        const blob = await this.fetchDocumentBlob(doc, "inline");
        const url = URL.createObjectURL(blob);
        const opened = window.open(url, "_blank");
        if (!opened) {
          this.$notify({
            title: "Aviso",
            type: "warning",
            message: "Permite ventanas emergentes para ver el documento.",
          });
        }
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } catch (error) {
        this.handleDownloadError(error);
      } finally {
        this.loadingDoc = null;
      }
    },
    async downloadDocument(doc) {
      const meta = this.documentMeta(doc);
      if (!meta.attached) {
        return;
      }
      this.loadingDoc = doc.key;
      try {
        const blob = await this.fetchDocumentBlob(doc, "attachment");
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = meta.filename || `${doc.key}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        this.handleDownloadError(error);
      } finally {
        this.loadingDoc = null;
      }
    },
    handleDownloadError(error) {
      if (error.response?.status === 403) {
        this.$notify({
          title: "Sin permiso",
          type: "warning",
          message: "No estás autorizado para ver este documento.",
        });
        return;
      }
      this.$notify({
        title: "Error",
        type: "danger",
        message: "No se pudo descargar el documento.",
      });
    },
  },
};
</script>

<style scoped>
.client-documents-section .document-row:last-child {
  border-bottom: none !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

.btn-file input[type="file"] {
  display: none;
}
</style>
