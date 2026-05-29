<template>
  <div>
    <div v-if="loading" class="text-center py-4">
      <i class="tim-icons icon-refresh-01 spin"></i>
      <span class="ml-2">Cargando pagos pendientes...</span>
    </div>
    <div v-else-if="loadError" class="text-center py-4 text-danger">
      {{ loadError }}
    </div>
    <div v-else-if="!tableRows.length" class="text-center py-4 text-muted">
      No hay pagos pendientes para el periodo actual.
    </div>
    <base-table v-else :data="tableRows" thead-classes="text-primary">
      <template slot="columns">
        <th>Cliente</th>
        <th>Residencial</th>
        <th>Dirección</th>
        <th>Email</th>
        <th>Teléfono</th>
        <th class="text-center">Progreso</th>
        <th>Fecha de pago</th>
        <th>Estado</th>
        <th class="text-right">Acciones</th>
      </template>

      <template slot-scope="{ row }">
        <td>{{ row.clientName }}</td>
        <td>{{ row.residentialName || "—" }}</td>
        <td>{{ row.landAddress || "—" }}</td>
        <td>{{ row.email || "—" }}</td>
        <td>{{ row.phone || "—" }}</td>
        <td class="text-center" style="min-width: 140px">
          <base-progress :value="row.progress" />
          <small class="text-muted">{{ row.progress }}%</small>
        </td>
        <td>{{ row.paymentDateLabel }}</td>
        <td>
          <span
            class="badge"
            :class="
              row.timingStatus === 'A tiempo'
                ? 'badge-warning'
                : 'badge-danger'
            "
          >
            {{ row.timingStatus }}
          </span>
        </td>
        <td class="text-right">
          <el-tooltip
            content="Capturar pago"
            effect="light"
            :open-delay="300"
            placement="top"
          >
            <base-button
              type="success"
              icon
              size="sm"
              class="btn-link"
              @click.native="goToCapturePayment(row)"
            >
              <i class="tim-icons icon-money-coins"></i>
            </base-button>
          </el-tooltip>
        </td>
      </template>
    </base-table>
  </div>
</template>

<script>
import axios from "axios";
import { BaseTable, BaseProgress } from "@/components";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;

function parsePaymentDate(dateStr) {
  if (!dateStr) {
    return null;
  }
  const normalized = String(dateStr).slice(0, 10);
  const parts = normalized.split("-");
  if (parts.length === 3) {
    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);
    const date = new Date(year, month, day);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  const parsed = new Date(dateStr);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateLabel(dateStr) {
  const date = parsePaymentDate(dateStr);
  if (!date) {
    return "—";
  }
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default {
  components: {
    BaseTable,
    BaseProgress,
  },
  props: {
    residentialId: {
      type: [Number, String],
      default: null,
    },
  },
  data() {
    return {
      loading: false,
      loadError: null,
      rows: [],
    };
  },
  computed: {
    tableRows() {
      return this.rows.map((row) => ({
        paymentId: row.payment_id,
        landId: row.land_id,
        clientName: row.client_name,
        residentialName: row.residential_name,
        landAddress: row.land_address,
        email: row.email,
        phone: row.phone,
        progress: row.progress,
        paymentDateLabel: formatDateLabel(row.payment_date),
        timingStatus: row.timing_status,
      }));
    },
  },
  watch: {
    residentialId() {
      this.loadData();
    },
  },
  methods: {
    loadData() {
      this.loading = true;
      this.loadError = null;

      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
        params: {},
      };

      if (this.residentialId) {
        config.params.residential_id = this.residentialId;
      }

      return axios
        .get(`${BASE_URL}/dashboard/pending_payments`, config)
        .then((response) => {
          this.rows = response.data || [];
        })
        .catch((error) => {
          console.error(error);
          this.rows = [];
          this.loadError = "No se pudieron cargar los pagos pendientes.";
        })
        .finally(() => {
          this.loading = false;
        });
    },
    goToCapturePayment(row) {
      if (!row.landId) {
        return;
      }
      this.$router.push({
        name: "EditLand",
        params: { id: row.landId },
      });
    },
  },
  mounted() {
    this.loadData();
  },
  activated() {
    this.loadData();
  },
};
</script>

<style scoped>
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
