const topbar = document.getElementById("topbar");
const hotspot = document.getElementById("hotspot");
const inventoryTable = document.getElementById("inventoryTable");
const searchInput = document.getElementById("searchInput");
const resultsCount = document.getElementById("resultsCount");

let closeTimeout = null;

function openBar() {
  if (closeTimeout) {
    clearTimeout(closeTimeout);
    closeTimeout = null;
  }
  topbar.classList.add("open");
}

function closeBar(delay = 250) {
  if (closeTimeout) clearTimeout(closeTimeout);
  closeTimeout = setTimeout(() => {
    topbar.classList.remove("open");
    closeTimeout = null;
  }, delay);
}

hotspot.addEventListener("mouseenter", openBar);
topbar.addEventListener("mouseenter", openBar);
hotspot.addEventListener("mouseleave", () => closeBar(250));
topbar.addEventListener("mouseleave", () => closeBar(250));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && topbar.classList.contains("open")) {
    closeBar(0);
  }
});

const inventoryItems = [
  {
    id: 1,
    name: "Steel Hammer",
    category: "Tools",
    status: "Active",
    accessLevel: "Low",
    sku: "TL-1001",
    supplier: "ForgeWorks",
    location: "Aisle A / Bin 12",
    updated: "2026-02-05",
    notes: "General-purpose hammer used in assembly and repair kits."
  },
  {
    id: 2,
    name: "Cordless Drill",
    category: "Power Tools",
    status: "Error",
    accessLevel: "High",
    sku: "PT-2104",
    supplier: "VoltEdge",
    location: "Aisle B / Shelf 4",
    updated: "2026-02-03",
    notes: "18V drill kit. Reorder recommended before next restock cycle."
  },
  {
    id: 3,
    name: "Safety Glasses",
    category: "Safety",
    status: "Active",
    accessLevel: "Low",
    sku: "SF-3308",
    supplier: "SafeLine",
    location: "Aisle D / Rack 2",
    updated: "2026-01-30",
    notes: "Anti-fog coated lenses. Standard issue for workshop floor staff."
  },
  {
    id: 4,
    name: "Industrial Gloves",
    category: "Safety",
    status: "Inactive",
    accessLevel: "Admin",
    sku: "SF-4412",
    supplier: "SafeLine",
    location: "Aisle D / Rack 5",
    updated: "2026-02-01",
    notes: "Awaiting supplier confirmation on incoming shipment."
  },
  {
    id: 5,
    name: "Paint Marker Set",
    category: "Consumables",
    status: "Active",
    accessLevel: "Medium",
    sku: "CS-5015",
    supplier: "MarkRight",
    location: "Aisle C / Drawer 7",
    updated: "2026-02-02",
    notes: "Used for warehouse labeling and package marking."
  }
];

let currentItems = [...inventoryItems];
let openItemId = null;

function getStatusClass(status) {
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

function getAccessClass(level) {
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

function createRowGroup(item) {
  const rowGroup = document.createElement("tbody");
  rowGroup.className = "row-group";
  rowGroup.dataset.itemId = item.id;

  const summaryRow = document.createElement("tr");
  summaryRow.className = "summary-row";

  const summaryCell = document.createElement("td");
  summaryCell.colSpan = 4;
  summaryCell.className = "summary-cell";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "row-toggle";
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", `details-${item.id}`);

  button.innerHTML = `
    <span class="row-main">
      <span class="item-name">${item.name}</span>
      <span class="item-meta">SKU: ${item.sku}</span>
    </span>

    <span class="row-data category-cell">${item.category}</span>
    <span class="row-data">
      <span class="${getStatusClass(item.status)}">${item.status}</span>
    </span>
    <span class="row-data access-cell">
      <span class="${getAccessClass(item.accessLevel)}">${item.accessLevel}</span>
    </span>

    <span class="chevron" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="18" height="18">
        <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    </span>
  `;

  summaryCell.appendChild(button);
  summaryRow.appendChild(summaryCell);

  const detailsRow = document.createElement("tr");
  detailsRow.className = "details-row";

  const detailsCell = document.createElement("td");
  detailsCell.colSpan = 4;
  detailsCell.className = "details-cell";

  const detailsPanel = document.createElement("div");
  detailsPanel.className = "details-panel";
  detailsPanel.id = `details-${item.id}`;

  detailsPanel.innerHTML = `
    <div class="details-grid">
      <div class="detail-card">
        <span class="detail-label">Supplier</span>
        <span class="detail-value">${item.supplier}</span>
      </div>
      <div class="detail-card">
        <span class="detail-label">Location</span>
        <span class="detail-value">${item.location}</span>
      </div>
      <div class="detail-card">
        <span class="detail-label">Last Updated</span>
        <span class="detail-value">${item.updated}</span>
      </div>
      <div class="detail-card">
        <span class="detail-label">Notes</span>
        <span class="detail-value">${item.notes}</span>
      </div>
    </div>
  `;

  detailsCell.appendChild(detailsPanel);
  detailsRow.appendChild(detailsCell);

  button.addEventListener("click", () => {
    toggleRow(item.id);
  });

  rowGroup.appendChild(summaryRow);
  rowGroup.appendChild(detailsRow);

  return rowGroup;
}

function renderTable(items) {
  inventoryTable
    .querySelectorAll("tbody.row-group, tbody.table-empty-body")
    .forEach((section) => section.remove());

  resultsCount.textContent = `${items.length} item${items.length === 1 ? "" : "s"}`;

  if (!items.length) {
    const emptyBody = document.createElement("tbody");
    emptyBody.className = "table-empty-body";

    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="4" class="empty-state">
        No matching inventory items found.
      </td>
    `;
    emptyBody.appendChild(emptyRow);
    inventoryTable.appendChild(emptyBody);
    return;
  }

  items.forEach((item) => {
    inventoryTable.appendChild(createRowGroup(item));
  });

  if (openItemId !== null) {
    const existingGroup = document.querySelector(`.row-group[data-item-id="${openItemId}"]`);
    if (existingGroup) {
      openRow(existingGroup);
    } else {
      openItemId = null;
    }
  }
}

function closeAllRows() {
  document.querySelectorAll(".row-group").forEach((group) => {
    group.classList.remove("is-open");
    const btn = group.querySelector(".row-toggle");
    if (btn) btn.setAttribute("aria-expanded", "false");
  });
}

function openRow(group) {
  closeAllRows();
  group.classList.add("is-open");
  const btn = group.querySelector(".row-toggle");
  if (btn) btn.setAttribute("aria-expanded", "true");
  openItemId = Number(group.dataset.itemId);
}

function toggleRow(itemId) {
  const group = document.querySelector(`.row-group[data-item-id="${itemId}"]`);
  if (!group) return;

  const isOpen = group.classList.contains("is-open");

  if (isOpen) {
    group.classList.remove("is-open");
    const btn = group.querySelector(".row-toggle");
    if (btn) btn.setAttribute("aria-expanded", "false");
    openItemId = null;
    return;
  }

  openRow(group);
}

function filterItems(query) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    currentItems = [...inventoryItems];
    renderTable(currentItems);
    return;
  }

  currentItems = inventoryItems.filter((item) => {
    return [
      item.name,
      item.category,
      item.status,
      item.accessLevel,
      item.sku,
      item.supplier,
      item.location,
      item.notes
    ].some((value) => String(value).toLowerCase().includes(normalized));
  });

  renderTable(currentItems);
}

searchInput.addEventListener("input", (event) => {
  filterItems(event.target.value);
});

renderTable(currentItems);

/*
  Later, when your MySQL backend is ready, replace inventoryItems with:

  async function loadItems() {
    const response = await fetch("/api/items");
    const data = await response.json();
    currentItems = data;
    renderTable(currentItems);
  }

  loadItems();
*/
