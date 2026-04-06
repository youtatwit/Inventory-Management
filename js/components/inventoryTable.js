import { createElement, qsa } from "../utils/dom.js";
import { getAccessClass, getStatusClass } from "../utils/formatters.js";

export function createInventoryTable({
  inventoryTable,
  resultsCount,
  getItems,
  getOpenItemId,
  setOpenItemId,
  getSortState,
  onSortChange,
  onEdit,
  onDelete
}) {
  function render(items) {
    qsa("tbody.row-group, tbody.table-empty-body", inventoryTable).forEach((section) => {
      section.remove();
    });

    resultsCount.textContent = `${items.length} item${items.length === 1 ? "" : "s"}`;

    if (!items.length) {
      renderEmptyState();
      updateHeaderIndicators();
      return;
    }

    items.forEach((item) => {
      inventoryTable.appendChild(createRowGroup(item));
    });

    attachHeaderSortHandlers();
    restoreOpenRow();
    updateHeaderIndicators();
  }

  function renderEmptyState() {
    const emptyBody = createElement("tbody", { className: "table-empty-body" });
    const emptyRow = createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="4" class="empty-state">No matching inventory items found.</td>
    `;
    emptyBody.appendChild(emptyRow);
    inventoryTable.appendChild(emptyBody);
  }

  function createRowGroup(item) {
    const rowGroup = createElement("tbody", {
      className: "row-group",
      attributes: { "data-item-id": String(item.id) }
    });

    const summaryRow = createElement("tr", { className: "summary-row" });
    const summaryCell = createElement("td", {
      className: "summary-cell",
      attributes: { colspan: "4" }
    });

    const button = createElement("button", {
      className: "row-toggle",
      attributes: {
        type: "button",
        "aria-expanded": "false",
        "aria-controls": `details-${item.id}`
      }
    });

    button.innerHTML = `
      <span class="row-main">
        <span class="item-name">${item.name ?? "—"}</span>
        <span class="item-meta">SKU: ${item.sku ?? "—"}</span>
      </span>

      <span class="row-data category-cell">${item.category ?? "—"}</span>
      <span class="row-data">
        <span class="${getStatusClass(item.status)}">${item.status ?? "—"}</span>
      </span>
      <span class="row-data access-cell">
        <span class="${getAccessClass(item.accessLevel)}">${item.accessLevel ?? "—"}</span>
      </span>

      <span class="chevron" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </span>
    `;

    button.addEventListener("click", () => toggleRow(item.id));

    summaryCell.appendChild(button);
    summaryRow.appendChild(summaryCell);

    const detailsRow = createElement("tr", { className: "details-row" });
    const detailsCell = createElement("td", {
      className: "details-cell",
      attributes: { colspan: "4" }
    });

    const detailsPanel = createElement("div", {
      className: "details-panel",
      attributes: { id: `details-${item.id}` }
    });

    detailsPanel.innerHTML = `
      <div class="details-grid">
        <div class="detail-card">
          <span class="detail-label">Supplier</span>
          <span class="detail-value">${item.supplier ?? "—"}</span>
        </div>
        <div class="detail-card">
          <span class="detail-label">Location</span>
          <span class="detail-value">${item.location ?? "—"}</span>
        </div>
        <div class="detail-card">
          <span class="detail-label">Last Updated</span>
          <span class="detail-value">${item.updated ?? "—"}</span>
        </div>
        <div class="detail-card">
          <span class="detail-label">Notes</span>
          <span class="detail-value">${item.notes ?? "—"}</span>
        </div>
      </div>
      <div class="inv-row-actions">
        <button type="button" class="inv-edit-btn" data-id="${item.id}">Edit</button>
        <button type="button" class="inv-delete-btn" data-id="${item.id}">Delete</button>
      </div>
    `;

    detailsPanel.querySelector(".inv-edit-btn")?.addEventListener("click", () => onEdit(item));
    detailsPanel.querySelector(".inv-delete-btn")?.addEventListener("click", () => onDelete(item));

    detailsCell.appendChild(detailsPanel);
    detailsRow.appendChild(detailsCell);

    rowGroup.appendChild(summaryRow);
    rowGroup.appendChild(detailsRow);

    return rowGroup;
  }

  function attachHeaderSortHandlers() {
    qsa("thead th", inventoryTable).forEach((th) => {
      const key = th.dataset.key;
      if (!key) return;

      th.classList.add("sortable");
      th.onclick = () => onSortChange(key);
    });
  }

  function updateHeaderIndicators() {
    const sortState = getSortState();

    qsa("thead th", inventoryTable).forEach((th) => {
      const key = th.dataset.key;
      th.classList.remove("sort-asc", "sort-desc");

      if (!key) return;
      if (sortState[key] === "asc") th.classList.add("sort-asc");
      if (sortState[key] === "desc") th.classList.add("sort-desc");
    });
  }

  function toggleRow(itemId) {
    const group = inventoryTable.querySelector(`.row-group[data-item-id="${itemId}"]`);
    if (!group) return;

    const isOpen = group.classList.contains("is-open");

    if (isOpen) {
      group.classList.remove("is-open");
      group.querySelector(".row-toggle")?.setAttribute("aria-expanded", "false");
      animateDetailsClose(group);
      setOpenItemId(null);
      return;
    }

    openRow(group);
  }

  function openRow(group) {
    const currentlyOpen = inventoryTable.querySelector(".row-group.is-open");

    if (currentlyOpen && currentlyOpen !== group) {
      currentlyOpen.classList.remove("is-open");
      currentlyOpen.querySelector(".row-toggle")?.setAttribute("aria-expanded", "false");
      animateDetailsClose(currentlyOpen);
    }

    group.classList.add("is-open");
    group.querySelector(".row-toggle")?.setAttribute("aria-expanded", "true");
    animateDetailsOpen(group);
    setOpenItemId(Number(group.dataset.itemId));
  }

  function restoreOpenRow() {
    const openItemId = getOpenItemId();
    if (openItemId === null) return;

    const group = inventoryTable.querySelector(`.row-group[data-item-id="${openItemId}"]`);
    if (!group) {
      setOpenItemId(null);
      return;
    }

    openRow(group);
  }

  function animateDetailsOpen(group) {
    const panel = group.querySelector(".details-panel");
    if (!panel) return;

    panel.style.height = "0px";
    panel.offsetHeight;
    panel.style.height = `${panel.scrollHeight}px`;

    const handleOpenEnd = (event) => {
      if (event.propertyName !== "height") return;
      if (group.classList.contains("is-open")) {
        panel.style.height = "auto";
      }
      panel.removeEventListener("transitionend", handleOpenEnd);
    };

    panel.addEventListener("transitionend", handleOpenEnd);
  }

  function animateDetailsClose(group) {
    const panel = group.querySelector(".details-panel");
    if (!panel) return;

    panel.style.height = `${panel.scrollHeight}px`;
    panel.offsetHeight;
    panel.style.height = "0px";
  }

  return {
    render
  };
}
