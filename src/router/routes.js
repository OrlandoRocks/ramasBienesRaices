import DashboardLayout from "src/pages/Layout/DashboardLayout.vue";
import AuthLayout from "src/pages/Pages/AuthLayout.vue";
// GeneralViews
import NotFound from "src/pages/GeneralViews/NotFoundPage.vue";

// Calendar
const Calendar = () =>
  import(
    /* webpackChunkName: "extra" */ "src/pages/Calendar/CalendarRoute.vue"
  );
// Charts
const Charts = () =>
  import(/* webpackChunkName: "dashboard" */ "src/pages/Charts.vue");

// Components pages
const Buttons = () =>
  import(
    /* webpackChunkName: "components" */ "src/pages/Components/Buttons.vue"
  );
const GridSystem = () =>
  import(
    /* webpackChunkName: "components" */ "src/pages/Components/GridSystem.vue"
  );
const Panels = () =>
  import(
    /* webpackChunkName: "components" */ "src/pages/Components/Panels.vue"
  );
const SweetAlert = () =>
  import(
    /* webpackChunkName: "components" */ "src/pages/Components/SweetAlert.vue"
  );
const Notifications = () =>
  import(
    /* webpackChunkName: "components" */ "src/pages/Components/Notifications.vue"
  );
const Icons = () =>
  import(/* webpackChunkName: "components" */ "src/pages/Components/Icons.vue");
const Typography = () =>
  import(
    /* webpackChunkName: "components" */ "src/pages/Components/Typography.vue"
  );
// Dashboard pages
const Dashboard = () =>
  import(
    /* webpackChunkName: "dashboard" */ "src/pages/Dashboard/Dashboard.vue"
  );
import Widgets from "src/pages/Widgets.vue";

// Forms pages
const RegularForms = () => import("src/pages/Forms/RegularForms.vue");
const ExtendedForms = () => import("src/pages/Forms/ExtendedForms.vue");
const ValidationForms = () => import("src/pages/Forms/ValidationForms.vue");
const Wizard = () => import("src/pages/Forms/Wizard.vue");
const ResidentialForm = () =>
  import("src/pages/Residential/ResidentialForm.vue");
const ClientForm = () => import("src/pages/Clients/ClientForm.vue");

// Maps pages
const GoogleMaps = () =>
  import(/* webpackChunkName: "extra" */ "src/pages/Maps/GoogleMaps.vue");
const FullScreenMap = () =>
  import(/* webpackChunkName: "extra" */ "src/pages/Maps/FullScreenMap.vue");
const VectorMaps = () =>
  import(/* webpackChunkName: "extra" */ "src/pages/Maps/VectorMaps.vue");

// Pages
const User = () =>
  import(/* webpackChunkName: "pages" */ "src/pages/Pages/UserProfile.vue");
// const Pricing = () =>
//   import(/* webpackChunkName: "pages" */ "src/pages/Pages/Pricing.vue");
const Login = () =>
  import(/* webpackChunkName: "pages" */ "src/pages/Pages/Login.vue");
const Register = () =>
  import(/* webpackChunkName: "pages" */ "src/pages/Pages/Register.vue");

// TableList pages
const ResidentialsTable = () =>
  import("src/pages/Residential/ResidentialTable.vue");
const ClientTable = () => import("src/pages/Clients/ClientTable.vue");

const RegularTables = () =>
  import(/* webpackChunkName: "tables" */ "src/pages/Tables/RegularTables.vue");
const ExtendedTables = () =>
  import(
    /* webpackChunkName: "tables" */ "src/pages/Tables/ExtendedTables.vue"
  );
const PaginatedTables = () =>
  import(
    /* webpackChunkName: "tables" */ "src/pages/Tables/PaginatedTables.vue"
  );
let componentsMenu = {
  path: "/components",
  component: DashboardLayout,
  redirect: "/components/buttons",
  name: "Components",
  children: [
    {
      path: "buttons",
      name: "Buttons",
      components: { default: Buttons },
    },
    {
      path: "grid-system",
      name: "Grid System",
      components: { default: GridSystem },
    },
    {
      path: "panels",
      name: "Panels",
      components: { default: Panels },
    },
    {
      path: "sweet-alert",
      name: "Sweet Alert",
      components: { default: SweetAlert },
    },
    {
      path: "notifications",
      name: "Notifications",
      components: { default: Notifications },
    },
    {
      path: "icons",
      name: "Icons",
      components: { default: Icons },
    },
    {
      path: "typography",
      name: "Typography",
      components: { default: Typography },
    },
  ],
  meta: { requiresAuth: true },
};
let formsMenu = {
  path: "/forms",
  component: DashboardLayout,
  redirect: "/forms/regular",
  name: "Forms",
  children: [
    {
      path: "regular",
      name: "Regular Forms",
      components: { default: RegularForms },
    },
    {
      path: "extended",
      name: "Extended Forms",
      components: { default: ExtendedForms },
    },
    {
      path: "validation",
      name: "Validation Forms",
      components: { default: ValidationForms },
    },
    {
      path: "wizard",
      name: "Wizard",
      components: { default: Wizard },
    },
  ],
  meta: { requiresAuth: true },
};

let tablesMenu = {
  path: "/table-list",
  component: DashboardLayout,
  redirect: "/table-list/regular",
  name: "Tables",
  children: [
    {
      path: "regular",
      name: "Regular Tables",
      components: { default: RegularTables },
    },
    {
      path: "extended",
      name: "Extended Tables",
      components: { default: ExtendedTables },
    },
    {
      path: "paginated",
      name: "Paginated Tables",
      components: { default: PaginatedTables },
    },
  ],
  meta: { requiresAuth: true },
};

let mapsMenu = {
  path: "/maps",
  component: DashboardLayout,
  name: "Maps",
  redirect: "/maps/google",
  children: [
    {
      path: "google",
      name: "Google Maps",
      components: { default: GoogleMaps },
    },
    {
      path: "full-screen",
      name: "Full Screen Map",
      meta: {
        hideContent: true,
        hideFooter: true,
      },
      components: { default: FullScreenMap },
    },
    {
      path: "vector-map",
      name: "Vector Map",
      components: { default: VectorMaps },
    },
  ],
  meta: { requiresAuth: true },
};

let residentialsMenu = {
  path: "/residentials",
  component: DashboardLayout,
  name: "Residentials",
  redirect: "/residentials",
  children: [
    {
      path: "",
      name: "Residentials",
      components: { default: ResidentialsTable },
    },
    {
      path: "new",
      name: "CreateResidential",
      components: { default: ResidentialForm },
    },
    {
      path: ":id/edit",
      name: "EditResidential",
      components: { default: ResidentialForm },
    },
  ],
  meta: { requiresAuth: true },
};

let clientsMenu = {
  path: "/clients",
  component: DashboardLayout,
  name: "Clients",
  redirect: "/clients",
  children: [
    {
      path: "",
      name: "Clients",
      components: { default: ClientTable },
    },
    {
      path: "new",
      name: "CreateClient",
      components: { default: ClientForm },
    },
    {
      path: ":id/edit",
      name: "EditResidential",
      components: { default: ClientForm },
    },
  ],
  meta: { requiresAuth: true },
};

let authPages = {
  path: "/",
  component: AuthLayout,
  name: "Authentication",
  children: [
    {
      path: "/login",
      name: "Login",
      component: Login,
    },
    {
      path: "/register",
      name: "Register",
      component: Register,
    },
  ],
  meta: { requiresAuth: false },
};

const routes = [
  {
    path: "/",
    redirect: "/dashboard",
    name: "Home",
  },
  componentsMenu,
  formsMenu,
  tablesMenu,
  mapsMenu,
  residentialsMenu,
  clientsMenu,
  authPages,
  {
    path: "/",
    component: DashboardLayout,
    redirect: "/dashboard",
    name: "Dashboard layout",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        components: { default: Dashboard },
      },
      {
        path: "calendar",
        name: "Calendar",
        components: { default: Calendar },
      },
      {
        path: "charts",
        name: "Charts",
        components: { default: Charts },
      },
      {
        path: "widgets",
        name: "Widgets",
        components: { default: Widgets },
      },
    ],
    meta: { requiresAuth: true },
  },
  { path: "*", component: NotFound },
];

export default routes;
