const MARTIN_URL = process.env.VUE_APP_MARTIN_URL || "http://localhost:3030";

/** Martin vector tile URL filtered by residential (Option A). */
export function landsTileUrlForResidential(residential) {
  if (!residential?.id) {
    return null;
  }
  if (residential.martin_lands_tile_url) {
    return residential.martin_lands_tile_url;
  }
  return `${MARTIN_URL}/lands/{z}/{x}/{y}?residential_id=${residential.id}`;
}

/** Append cache-buster without breaking existing query string. */
export function landsTileUrlWithCacheBuster(residential) {
  const base = landsTileUrlForResidential(residential);
  if (!base) {
    return null;
  }
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}t=${Date.now()}`;
}

export function fitBoundsFromResidential(map, residential) {
  if (!map || !residential) {
    return;
  }

  const bounds = residential.map_bounds;
  if (Array.isArray(bounds) && bounds.length === 4) {
    map.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ],
      {
        padding: 48,
        duration: 800,
        maxZoom: residential.map_zoom_hint || 16,
      }
    );
    return;
  }

  const center = residential.map_center;
  if (Array.isArray(center) && center.length === 2) {
    map.flyTo({
      center,
      zoom: residential.map_zoom_hint || 15,
      duration: 800,
    });
  }
}

export function landFillColorExpression() {
  const flagIsSet = (property) => [
    "any",
    ["==", ["get", property], 1],
    ["==", ["to-string", ["get", property]], "1"],
  ];

  return [
    "case",
    flagIsSet("is_late"),
    "#ff0000",
    flagIsSet("has_contract"),
    "#808080",
    flagIsSet("has_client"),
    "#808080",
    "#00ff00",
  ];
}
