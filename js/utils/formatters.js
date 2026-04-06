export function getStatusClass(status = "") {
  switch (status.toLowerCase()) {
    case "active":
      return "status-pill status-pill--active";
    case "inactive":
      return "status-pill status-pill--inactive";
    case "error":
      return "status-pill status-pill--error";
    default:
      return "status-pill";
  }
}

export function getAccessClass(level = "") {
  switch (level.toLowerCase()) {
    case "low":
      return "access-pill access-low";
    case "medium":
      return "access-pill access-medium";
    case "high":
      return "access-pill access-high";
    case "admin":
      return "access-pill access-admin";
    default:
      return "access-pill";
  }
}

export function normalizeSearchValue(value) {
  return String(value ?? "").toLowerCase();
}
