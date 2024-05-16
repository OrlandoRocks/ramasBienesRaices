<template>
  <base-table :data="table" thead-classes="text-primary">
    <template slot="columns">
      <th>#</th>
      <th>Nombre</th>
      <th>Posicion</th>
      <th>Progreso</th>
      <th class="text-right">Tareas</th>
      <th class="text-right">Actions</th>
    </template>

    <template slot-scope="{ row, index }">
      <td class="text-center">
        <div class="photo"><img :src="row.img" alt="photo" /></div>
      </td>
      <td>{{ row.name }}</td>
      <td>{{ row.job }}</td>
      <td class="text-center"><base-progress :value="row.progress" /></td>
      <td class="text-right">10</td>
      <td class="text-right">
        <el-tooltip
          content="Refresh"
          effect="light"
          :open-delay="300"
          placement="top"
        >
          <base-button
            :type="index > 2 ? 'success' : 'neutral'"
            icon
            size="sm"
            class="btn-link"
          >
            <i class="tim-icons icon-refresh-01"></i>
          </base-button>
        </el-tooltip>
        <el-tooltip
          content="Delete"
          effect="light"
          :open-delay="300"
          placement="top"
        >
          <base-button
            :type="index > 2 ? 'danger' : 'neutral'"
            icon
            size="sm"
            class="btn-link"
          >
            <i class="tim-icons icon-simple-remove"></i>
          </base-button>
        </el-tooltip>
      </td>
    </template>
  </base-table>
</template>
<script>
import { BaseTable, BaseProgress } from "@/components";

export default {
  components: {
    BaseTable,
    BaseProgress,
  },
  data() {
    return {
      table: [
        {
          id: 1,
          img: "img/tania.jpg",
          name: "Rosa Medrano",
          job: "Contadora",
          progress: 25,
          salary: "99",
        },
        {
          id: 2,
          img: "img/robi.jpg",
          name: "Elver Garcia",
          job: "Vendedor",
          progress: 77,
          salary: "89",
        },
        {
          id: 3,
          img: "img/lora.jpg",
          name: "Adrian Monino",
          job: "Arquitecto",
          progress: 41,
          salary: "22",
        },
        {
          id: 4,
          img: "img/jana.jpg",
          name: "Juana Perez",
          job: "Marketing",
          progress: 50,
          salary: "49",
        },
        {
          id: 5,
          img: "img/mike.jpg",
          name: "Ramas Midnight",
          job: "El mero Jefe",
          progress: 100,
          salary: "69",
        },
        {
          id: 6,
          img: "img/emilyz.jpg",
          name: "Manuela Rico",
          job: "Manager",
          progress: 15,
          salary: "99",
        },
      ],
    };
  },
};
</script>
<style></style>
