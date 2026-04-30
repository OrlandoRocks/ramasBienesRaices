<template>
  <div class="content">
    <div class="col-md-10 ml-auto mr-auto">
      <h2 class="text-center">Editor de Contrato</h2>

      <card>
        <div v-if="isLoadingTemplate" class="text-center p-5 text-muted">
          <i class="tim-icons icon-refresh-01 fa-spin"></i> Cargando plantilla y
          estilos...
        </div>

        <div v-else>
          <div
            class="editor-toolbar"
            v-if="userRole === 'admin' || userRole === 'user'"
          >
            <div class="toolbar-group">
              <button @click="formatText('bold')" class="toolbar-btn" title="Negrita"><b>B</b></button>
              <button @click="formatText('italic')" class="toolbar-btn" title="Cursiva"><i>I</i></button>
              <button @click="formatText('underline')" class="toolbar-btn" title="Subrayado"><u>U</u></button>
            </div>

            <div class="toolbar-divider"></div>

            <div class="toolbar-group">
              <button
                @click="formatText('justifyLeft')"
                class="toolbar-btn"
                title="Alinear a la izquierda"
              >
                <i class="tim-icons icon-align-left-2"></i>
              </button>
              <button
                @click="formatText('justifyCenter')"
                class="toolbar-btn"
                title="Centrar"
              >
                <i class="tim-icons icon-align-center"></i>
              </button>
              <button @click="formatText('justifyRight')" class="toolbar-btn" title="Alinear a la derecha">Derecha</button>
              <button @click="formatText('justifyFull')" class="toolbar-btn" title="Justificar">Justificar</button>
            </div>

            <div class="toolbar-divider"></div>

            <div class="toolbar-group">
              <button @click="formatText('insertUnorderedList')" class="toolbar-btn" title="Lista de viñetas">• Lista</button>
              <button @click="formatText('insertOrderedList')" class="toolbar-btn" title="Lista numerada">1. Lista</button>
            </div>

            <div class="toolbar-divider"></div>

            <div class="toolbar-group">
              <button @click="formatText('undo')" class="toolbar-btn" title="Deshacer">↩</button>
              <button @click="formatText('redo')" class="toolbar-btn" title="Rehacer">↪</button>
            </div>
          </div>
          <div class="editor-wrapper">
            <iframe
              ref="pdfIframe"
              class="pdf-iframe"
              @load="enableEditing(userRole)"
            ></iframe>
          </div>

          <div class="actions text-center mt-4">
            <div v-if="userRole === 'admin' || userRole === 'user'">
              <base-button
                @click="handleSaveOnly"
                :disabled="isSaving || isGeneratingPdf"
                type="info"
                class="mr-2"
              >
                <i class="tim-icons icon-notes"></i>
                {{ isSaving ? "Guardando..." : "Guardar Versión" }}
              </base-button>

              <base-button
                @click="handleSaveAndDownload"
                :disabled="isSaving || isGeneratingPdf"
                type="primary"
              >
                <i class="tim-icons icon-cloud-download-93"></i>
                {{
                  isGeneratingPdf ? "Procesando..." : "Guardar y Descargar PDF"
                }}
              </base-button>
            </div>
            <div v-else>
              <base-button
                @click="handleGeneratePdf"
                :disabled="isGeneratingPdf"
                type="primary"
              >
                <i class="tim-icons icon-cloud-download-93"></i>
                {{ isGeneratingPdf ? "Generando PDF..." : "Descargar PDF" }}
              </base-button>
            </div>
          </div>
        </div>
      </card>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "ContractEditor",
  props: {
    contractId: {
      type: [Number, String],
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getUserRole"]),
    userRole() {
      return this.getUserRole;
    },
  },
  data() {
    return {
      isLoadingTemplate: true,
      isGeneratingPdf: false,
      isSaving: false,
      rawHtml: "",
    };
  },
  methods: {
    ...mapActions([
      "fetchContractTemplate",
      "generateContractPdf",
      "saveContractVersion",
    ]),

    getEditorHtml() {
      const iframe = this.$refs.pdfIframe;
      return iframe
        ? iframe.contentWindow.document.documentElement.outerHTML
        : null;
    },

    async loadTemplate() {
      this.isLoadingTemplate = true;
      try {
        this.rawHtml = await this.fetchContractTemplate(this.$route.params.id);
        this.isLoadingTemplate = false;

        this.$nextTick(() => {
          const iframe = this.$refs.pdfIframe;
          if (iframe) {
            const doc = iframe.contentWindow.document;
            doc.open();
            doc.write(this.rawHtml);
            doc.close();
          }
        });
      } catch (error) {
        this.$notify({
          type: "danger",
          message: "No se pudo cargar la plantilla del contrato.",
        });
        this.isLoadingTemplate = false;
      }
    },

    enableEditing(role) {
      const iframe = this.$refs.pdfIframe;
      if (iframe) {
        if (role === "admin" || role === "user") {
          iframe.contentWindow.document.designMode = "on";
          iframe.contentWindow.focus();
        } else {
          iframe.contentWindow.document.designMode = "off";
        }
      }
    },

    formatText(command, value = null) {
      const iframe = this.$refs.pdfIframe;
      if (iframe) {
        iframe.contentWindow.focus();
        iframe.contentWindow.document.execCommand(command, false, value);
      }
    },

    async handleSaveOnly() {
      const html = this.getEditorHtml();
      if (!html) return;

      this.isSaving = true;
      try {
        await this.saveContractVersion({
          id: this.$route.params.id,
          html_content: html,
        });
        this.$notify({
          type: "success",
          message: "Versión guardada en el historial.",
        });
      } catch (error) {
        this.$notify({
          type: "danger",
          message: "No se pudo guardar la versión.",
        });
      } finally {
        this.isSaving = false;
      }
    },

    async handleSaveAndDownload() {
      const html = this.getEditorHtml();
      if (!html) return;

      this.isGeneratingPdf = true;
      try {
        await this.saveContractVersion({
          id: this.$route.params.id,
          html_content: html,
        });

        const blobData = await this.generateContractPdf({
          id: this.$route.params.id,
          html_content: html,
        });

        this.downloadBlob(blobData);

        this.$notify({
          type: "success",
          message: "Contrato guardado y PDF generado.",
        });
      } catch (error) {
        this.$notify({
          type: "danger",
          message: "Error en el proceso de generación.",
        });
      } finally {
        this.isGeneratingPdf = false;
      }
    },

    downloadBlob(blobData) {
      const fileURL = window.URL.createObjectURL(
        new Blob([blobData], { type: "application/pdf" })
      );
      const fileLink = document.createElement("a");
      fileLink.href = fileURL;
      fileLink.setAttribute(
        "download",
        `Contrato_Final_${this.$route.params.id}.pdf`
      );
      document.body.appendChild(fileLink);
      fileLink.click();
      fileLink.remove();
      window.URL.revokeObjectURL(fileURL);
    },

    async handleGeneratePdf() {
      this.isGeneratingPdf = true;
      try {
        const modifiedHtml =
          this.$refs.pdfIframe.contentWindow.document.documentElement.outerHTML;

        const blobData = await this.generateContractPdf({
          id: this.$route.params.id,
          html_content: modifiedHtml,
        });

        this.downloadBlob(blobData);

        this.$notify({
          type: "success",
          message: "PDF generado y descargado correctamente.",
        });
      } catch (error) {
        this.$notify({
          type: "danger",
          message: "Ocurrió un error al compilar el PDF.",
        });
      } finally {
        this.isGeneratingPdf = false;
      }
    },
  },
  mounted() {
    this.loadTemplate();
  },
};
</script>

<style scoped>
.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  background-color: #f1f3f5;
  padding: 10px;
  border: 1px solid #ddd;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  gap: 10px;
}
.toolbar-group {
  display: flex;
  gap: 5px;
}
.toolbar-btn {
  background: white;
  border: 1px solid #ccc;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.2s;
}
.toolbar-btn:hover {
  background: #e2e6ea;
  border-color: #adb5bd;
}
.toolbar-divider {
  width: 1px;
  height: 24px;
  background-color: #ccc;
  margin: 0 5px;
}
.editor-wrapper {
  background: #f4f5f7;
  padding: 20px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}
.pdf-iframe {
  width: 100%;
  height: 75vh;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
</style>
