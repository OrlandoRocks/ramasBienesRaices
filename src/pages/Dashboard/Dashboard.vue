<template>
  <div class="row">
    <div class="row col-lg-12 col-md-12" v-if="getUserRole !== 'client'">
      <!-- Small charts -->
      <div class="col-lg-4" :class="{ 'text-right': isRTL }">
        <card type="chart">
          <template slot="header">
            <h5 class="card-category">Total Contratos</h5>
            <h3 class="card-title">
              <i class="tim-icons icon-bell-55 text-primary"></i> 763,215
            </h3>
          </template>
          <div class="chart-area">
            <line-chart
              style="height: 100%"
              :chart-data="purpleLineChart.chartData"
              :gradient-colors="purpleLineChart.gradientColors"
              :gradient-stops="purpleLineChart.gradientStops"
              :extra-options="purpleLineChart.extraOptions"
            >
            </line-chart>
          </div>
        </card>
      </div>
      <div class="col-lg-4" :class="{ 'text-right': isRTL }">
        <card type="chart">
          <template slot="header">
            <h5 class="card-category">Total de Ventas</h5>
            <h3 class="card-title">
              <i class="tim-icons icon-delivery-fast text-info"></i> 3,500,000$
            </h3>
          </template>
          <div class="chart-area">
            <bar-chart
              style="height: 100%"
              :chart-data="blueBarChart.chartData"
              :gradient-stops="blueBarChart.gradientStops"
              :extra-options="blueBarChart.extraOptions"
            >
            </bar-chart>
          </div>
        </card>
      </div>
      <div class="col-lg-4" :class="{ 'text-right': isRTL }">
        <card type="chart">
          <template slot="header">
            <h5 class="card-category">Total de Clientes</h5>
            <h3 class="card-title">
              <i class="tim-icons icon-send text-success"></i> 1,100K
            </h3>
          </template>
          <div class="chart-area">
            <line-chart
              style="height: 100%"
              :chart-data="greenLineChart.chartData"
              :gradient-stops="greenLineChart.gradientStops"
              :extra-options="greenLineChart.extraOptions"
            >
            </line-chart>
          </div>
        </card>
      </div>
    </div>

    <div class="row col-lg-12 col-md-12" v-if="getUserRole === 'client'">
      <div class="col-lg-3 col-md-6">
        <stats-card
          :title="formatCurrency(paymentsData)"
          :sub-title="'Pagos del Mes'"
          :type="'warning'"
          :icon="'tim-icons icon-money-coins'"
        >
        </stats-card>
      </div>

      <div class="col-lg-3 col-md-6">
        <stats-card
          :title="landsSoldData"
          :sub-title="'Terrenos Comprados'"
          :type="'warning'"
          :icon="'tim-icons icon-molecule-40'"
        >
        </stats-card>
      </div>

      <div class="col-lg-3 col-md-6">
        <stats-card
          :title="formatCurrency(totalPaidData)"
          :sub-title="'Total Pagado'"
          :type="'warning'"
          :icon="'tim-icons icon-coins'"
        >
        </stats-card>
      </div>
    </div>
    <div class="row col-lg-12 col-md-12" v-else>
      <!-- Stats Cards -->
      <div class="col-lg-3 col-md-6" v-for="card in statsCards" :key="card.title">
        <stats-card
          :title="card.title"
          :sub-title="card.subTitle"
          :type="card.type"
          :icon="card.icon"
        >
          <div slot="footer" v-html="card.footer"></div>
        </stats-card>
      </div>
    </div>

    <div class="col-lg-12" v-if="getUserRole === 'client'">
      <card class="card" :header-classes="{ 'text-right': isRTL }">
        <h5 slot="header" class="card-title">Contratos</h5>
        <div class="table-responsive"><my-contracts></my-contracts></div>
      </card>
    </div>
  </div>
</template>
<script>
import LineChart from "@/components/Charts/LineChart";
import BarChart from "@/components/Charts/BarChart";
import * as chartConfigs from "@/components/Charts/config";
import UserTable from "./UserTable";
import StatsCard from "src/components/Cards/StatsCard";
import config from "@/config";
import MyContracts from "@/pages/Dashboard/ContractTable.vue";
import { mapActions, mapGetters } from "vuex";

export default {
  components: {
    MyContracts,
    LineChart,
    BarChart,
    StatsCard,
    UserTable,
  },
  data() {
    return {
      statsCards: [
        {
          title: "150,000$",
          subTitle: "Pagos del Mes",
          type: "warning",
          icon: "tim-icons icon-money-coins",
          footer: '<i class="tim-icons icon-refresh-01"></i> Actualizar',
        },
        {
          title: "+45K",
          subTitle: "Terrenos Vendidos",
          type: "primary",
          icon: "tim-icons icon-world",
          footer:
            '<i class="tim-icons icon-pencil" @click.native="console.log()" ></i></i> Lista de Terrenos',
        },
        {
          title: "150,000",
          subTitle: "Clientes",
          type: "info",
          icon: "tim-icons icon-single-02",
          footer: '<i class="tim-icons icon-pencil"></i> Ver Clientes',
        },
        {
          title: "23",
          subTitle: "Deudas del Mes",
          type: "danger",
          icon: "tim-icons icon-button-pause",
          footer: '<i class="tim-icons icon-pencil"></i> Ver Deudas',
        },
      ],
      purpleLineChart: {
        extraOptions: chartConfigs.purpleChartOptions,
        chartData: {
          labels: ["JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
          datasets: [
            {
              label: "Data",
              fill: true,
              borderColor: config.colors.primary,
              borderWidth: 2,
              borderDash: [],
              borderDashOffset: 0.0,
              pointBackgroundColor: config.colors.primary,
              pointBorderColor: "rgba(255,255,255,0)",
              pointHoverBackgroundColor: config.colors.primary,
              pointBorderWidth: 20,
              pointHoverRadius: 4,
              pointHoverBorderWidth: 15,
              pointRadius: 4,
              data: [8, 10, 7, 8, 12, 8],
            },
          ],
        },
        gradientColors: config.colors.primaryGradient,
        gradientStops: [1, 0.2, 0],
      },
      greenLineChart: {
        extraOptions: chartConfigs.greenChartOptions,
        chartData: {
          labels: ["JUL", "AUG", "SEP", "OCT", "NOV"],
          datasets: [
            {
              label: "My First dataset",
              fill: true,
              borderColor: config.colors.danger,
              borderWidth: 2,
              borderDash: [],
              borderDashOffset: 0.0,
              pointBackgroundColor: config.colors.danger,
              pointBorderColor: "rgba(255,255,255,0)",
              pointHoverBackgroundColor: config.colors.danger,
              pointBorderWidth: 20,
              pointHoverRadius: 4,
              pointHoverBorderWidth: 15,
              pointRadius: 4,
              data: [90, 27, 60, 12, 80],
            },
          ],
        },
        gradientColors: [
          "rgba(66,134,121,0.15)",
          "rgba(66,134,121,0.0)",
          "rgba(66,134,121,0)",
        ],
        gradientStops: [1, 0.4, 0],
      },
      blueBarChart: {
        extraOptions: chartConfigs.barChartOptions,
        chartData: {
          labels: ["USA", "GER", "AUS", "UK", "RO", "BR"],
          datasets: [
            {
              label: "Countries",
              fill: true,
              borderColor: config.colors.info,
              borderWidth: 2,
              borderDash: [],
              borderDashOffset: 0.0,
              data: [53, 20, 10, 80, 100, 45],
            },
          ],
        },
        gradientColors: config.colors.primaryGradient,
        gradientStops: [1, 0.4, 0],
      },
    };
  },
  computed: {
    ...mapGetters(["getPaymentsByMonth", "getLandsSold", "getTotalPaid", "getUserRole"]),
    paymentsData() {
      return this.getPaymentsByMonth;
    },
    landsSoldData() {
      return this.getLandsSold;
    },
    totalPaidData() {
      return this.getTotalPaid;
    },
    enableRTL() {
      return this.$route.query.enableRTL;
    },
    isRTL() {
      return this.$rtl.isRTL;
    },
    bigLineChartCategories() {
      return [
        { name: "Pagados", icon: "tim-icons icon-single-02" },
        { name: "Pendientes", icon: "tim-icons icon-gift-2" },
        { name: "Todos", icon: "tim-icons icon-tap-02" },
      ];
    },
  },
  methods: {
    ...mapActions(["fetchPaymentsByMonth", "fetchLandsSold", "fetchTotalPaid"]),
    loadPayments() {
      this.fetchPaymentsByMonth();
    },
    loadLandsSold() {
      this.fetchLandsSold();
    },
    loadTotalPaid() {
      this.fetchTotalPaid();
    },
    initBigChart(index) {
      let chartData = {
        datasets: [
          {
            ...bigChartDatasetOptions,
            data: bigChartData[index],
          },
        ],
        labels: bigChartLabels,
      };
      this.$refs.bigChart.updateGradients(chartData);
      this.bigLineChart.chartData = chartData;
      this.bigLineChart.activeIndex = index;
    },
  },
  mounted() {
    this.i18n = this.$i18n;
    if (this.enableRTL) {
      this.i18n.locale = "ar";
      this.$rtl.enableRTL();
    }
    this.initBigChart(0);
  },
  beforeDestroy() {
    if (this.$rtl.isRTL) {
      this.i18n.locale = "en";
      this.$rtl.disableRTL();
    }
  },
  created() {
    this.loadPayments();
    this.loadLandsSold();
    this.loadTotalPaid();
  },
};
</script>
<style></style>
