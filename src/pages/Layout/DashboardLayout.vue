<template>
  <div class="wrapper" :class="{ 'nav-open': $sidebar.showSidebar }">
    <notifications></notifications>
    <sidebar-fixed-toggle-button />
    <side-bar
      :background-color="sidebarBackground"
      :short-title="$t('sidebar.shortTitle')"
      :title="$t('sidebar.title')"
    >
      <template slot="links">
        <sidebar-item
          :link="{
            name: $t('sidebar.dashboard'),
            icon: 'tim-icons icon-chart-pie-36',
            path: '/dashboard',
          }"
        >
        </sidebar-item>
        <sidebar-item
          :link="{
            name: $t('sidebar.neighborhood'),
            icon: 'tim-icons icon-square-pin',
            path: '/residentials',
          }"
        ></sidebar-item>
        <sidebar-item
          :link="{
            name: $t('sidebar.lands'),
            icon: 'tim-icons icon-vector',
            path: '/lands',
          }"
        ></sidebar-item>
        <sidebar-item
          :link="{
            name: $t('sidebar.clients'),
            icon: 'tim-icons icon-badge',
            path: '/clients',
          }"
        ></sidebar-item>
        <sidebar-item
          :link="{
            name: $t('sidebar.expenses'),
            icon: 'tim-icons icon-money-coins',
            path: '/expenses',
          }"
        ></sidebar-item>
        <sidebar-item
          :link="{
            name: $t('sidebar.contracts'),
            icon: 'tim-icons icon-paper',
            path: '/contracts',
          }"
        ></sidebar-item>
        <sidebar-item
          :link="{
            name: $t('sidebar.charts'),
            icon: 'tim-icons icon-chart-bar-32',
            path: '/charts',
          }"
        ></sidebar-item>
        <sidebar-item
          :link="{
            name: $t('sidebar.calendar'),
            icon: 'tim-icons icon-time-alarm',
            path: '/calendar',
          }"
        ></sidebar-item>
      </template>
    </side-bar>
    <!--Share plugin (for demo purposes). You can remove it if don't plan on using it-->
    <!--    <sidebar-share :background-color.sync="sidebarBackground"> </sidebar-share>-->
    <div class="main-panel" :data="sidebarBackground">
      <dashboard-navbar></dashboard-navbar>
      <router-view name="header"></router-view>
      <div
        :class="{ content: !$route.meta.hideContent }"
        @click="toggleSidebar"
      >
        <zoom-center-transition :duration="200" mode="out-in">
          <!-- your content here -->
          <router-view></router-view>
        </zoom-center-transition>
      </div>
      <content-footer v-if="!$route.meta.hideFooter"></content-footer>
    </div>
  </div>
</template>
<script>
/* eslint-disable no-new */
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
// import SidebarShare from "./SidebarSharePlugin";
function hasElement(className) {
  return document.getElementsByClassName(className).length > 0;
}

function initScrollbar(className) {
  if (hasElement(className)) {
    new PerfectScrollbar(`.${className}`);
  } else {
    // try to init it later in case this component is loaded async
    setTimeout(() => {
      initScrollbar(className);
    }, 100);
  }
}

import DashboardNavbar from "./DashboardNavbar.vue";
import ContentFooter from "./ContentFooter.vue";
import SidebarFixedToggleButton from "./SidebarFixedToggleButton.vue";
import { ZoomCenterTransition } from "vue2-transitions";

export default {
  components: {
    DashboardNavbar,
    ContentFooter,
    SidebarFixedToggleButton,
    ZoomCenterTransition,
    // SidebarShare,
  },
  data() {
    return {
      sidebarBackground: "vue", //vue|blue|orange|green|red|primary
    };
  },
  methods: {
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false);
      }
    },
    initScrollbar() {
      let docClasses = document.body.classList;
      let isWindows = navigator.platform.startsWith("Win");
      if (isWindows) {
        // if we are on windows OS we activate the perfectScrollbar function
        initScrollbar("sidebar");
        initScrollbar("main-panel");
        initScrollbar("sidebar-wrapper");

        docClasses.add("perfect-scrollbar-on");
      } else {
        docClasses.add("perfect-scrollbar-off");
      }
    },
  },
  mounted() {
    this.initScrollbar();
  },
};
</script>
<style lang="scss">
$scaleSize: 0.95;
@keyframes zoomIn95 {
  from {
    opacity: 0;
    transform: scale3d($scaleSize, $scaleSize, $scaleSize);
  }
  to {
    opacity: 1;
  }
}

.main-panel .zoomIn {
  animation-name: zoomIn95;
}

@keyframes zoomOut95 {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: scale3d($scaleSize, $scaleSize, $scaleSize);
  }
}

.main-panel .zoomOut {
  animation-name: zoomOut95;
}
</style>
