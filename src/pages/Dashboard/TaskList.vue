<template>
  <base-table :data="tableData" thead-classes="text-primary">
    <template slot-scope="{ row }">
      <td><base-checkbox v-model="row.done"></base-checkbox></td>
      <td>
        <p class="title">{{ row.title }}</p>
        <p class="text-muted">{{ row.description }}</p>
      </td>
      <td class="td-actions text-right">
        <el-tooltip
          content="Edit task"
          effect="light"
          :open-delay="300"
          placement="top"
        >
          <base-button type="link">
            <i class="tim-icons icon-pencil"></i>
          </base-button>
        </el-tooltip>
      </td>
    </template>
  </base-table>
</template>
<script>
import { BaseTable } from "@/components";

export default {
  components: {
    BaseTable,
  },
  data() {
    return {
      tableData: [
        {
          title: "Visita Terreno",
          description: "Mostrar terrene al cliente, Nombre del cliente,  8:47 AM",
          done: false,
        },
        {
          title: "Verificar Documentacion",
          description:
            "Gestionar contratos, acuerdos, documentos de identificación, y otros documentos relevantes",
          done: true,
        },
        {
          title: "Resolver problemas",
          description:
            "Algun inconveniente que se necesite resolver con el cliente",
          done: false,
        },
        {
          title: "Procesar pagos",
          description: "Revisar pagos pendientes y procesarlos",
          done: false,
        },
        {
          title: "Exportar reporte",
          description:
            "Este reporte es importante para el cliente, por favor exportarlo",
          done: false,
        },
        {
          title: "Mas tareas necesarias",
          description: "Poner aqui la descripcion de la tarea",
          done: false,
        },
      ],
    };
  },
};
</script>
<style></style>
