import { formatAssigneesList } from "@/util/assignmentHelpers";

export function normalizeResidentialFromApi(residential) {
  if (!residential) {
    return null;
  }

  const assignedUsers = residential.assigned_users || [];
  const userIds = Array.isArray(residential.user_ids)
    ? residential.user_ids.map((id) => Number(id))
    : [];

  return {
    id: residential.id,
    name: residential.name || "",
    address: residential.address || "",
    cost: residential.cost,
    user_ids: userIds,
    assigned_users: assignedUsers,
    user_id: residential.user_id,
    user_name: residential.user_full_name || formatAssigneesList(assignedUsers),
    assignees_label: formatAssigneesList(
      assignedUsers,
      residential.user_full_name
    ),
    lands_count: residential.lands_count,
    total_expenses: residential.total_expenses,
    lands: residential.lands || [],
    total_payments: residential.total_payments,
    map_center: residential.map_center || null,
    map_bounds: residential.map_bounds || null,
    map_zoom_hint: residential.map_zoom_hint ?? null,
    martin_lands_tile_url: residential.martin_lands_tile_url || null,
  };
}
