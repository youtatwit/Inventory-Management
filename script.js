const topbar = document.getElementById("topbar");
const hotspot = document.getElementById("hotspot");
const tableBody = document.getElementById("inventoryTableBody");
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

let currentItems = [];
let allItems = [];
let openItemId = null;

// ── API helpers ──────────────────────────────────────────────────────────────

async function loadItems() {
  const res = await fetch("/api/items");
  const data = await res.json();
  allItems = data;
  currentItems = [...allItems];
  renderTable(currentItems);
}

async function createItem(formData) {
  const res = await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData)
  });
  if (!res.ok) throw new Error("Failed to create item");
  await loadItems();
}

async function updateItem(id, formData) {
  const res = await fetch(`/api/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData)
  });
  if (!res.ok) throw new Error("Failed to update item");
  await loadItems();
}

async function deleteItem(id) {
  const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete item");
  await loadItems();
}

// ── Status helper ─────────────────────────────────────────────────────────────

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

// ── Table rendering ───────────────────────────────────────────────────────────

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
    <span class="row-data qty-cell">${item.quantity}</span>

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

  detailsPanel.querySelector(".inv-edit-btn").addEventListener("click", () => {
    const target = allItems.find((i) => i.id === item.id);
    if (target) openModal(target);
  });

  detailsPanel.querySelector(".inv-delete-btn").addEventListener("click", async () => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    await deleteItem(item.id);
  });

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
  tableBody.innerHTML = "";
  resultsCount.textContent = `${items.length} item${items.length === 1 ? "" : "s"}`;

  if (!items.length) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="4" class="empty-state">
        No matching inventory items found.
      </td>
    `;
    tableBody.appendChild(emptyRow);
    return;
  }

  items.forEach((item) => {
    tableBody.appendChild(createRowGroup(item));
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

// ── Search / filter ───────────────────────────────────────────────────────────

function filterItems(query) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    currentItems = [...allItems];
    renderTable(currentItems);
    return;
  }

  currentItems = allItems.filter((item) => {
    return [
      item.name,
      item.category,
      item.status,
      item.sku,
      item.supplier,
      item.location,
      item.notes
    ].some((value) => String(value ?? "").toLowerCase().includes(normalized));
  });

  renderTable(currentItems);
}

searchInput.addEventListener("input", (event) => {
  filterItems(event.target.value);
});

// ── Modal ─────────────────────────────────────────────────────────────────────

function createModal() {
  const style = document.createElement("style");
  style.textContent = `
    .inv-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: grid;
      place-items: center;
      padding: 16px;
    }
    .inv-modal-backdrop[hidden] { display: none; }
    .inv-modal {
      background: #2E3A3F;
      border: 1px solid rgba(240,240,233,0.12);
      border-radius: 16px;
      width: min(520px, 100%);
      max-height: 90vh;
      overflow-y: auto;
      padding: 28px;
      color: #F0F0E9;
    }
    .inv-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .inv-modal-header h2 { margin: 0; font-size: 1.3rem; font-family: Arial, sans-serif; }
    .inv-modal-close {
      background: none;
      border: none;
      color: #9F9FBA;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 4px 8px;
      line-height: 1;
    }
    .inv-form-row {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 14px;
    }
    .inv-form-row label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #9F9FBA;
      font-family: Arial, sans-serif;
    }
    .inv-form-row input,
    .inv-form-row select,
    .inv-form-row textarea {
      background: rgba(240,240,233,0.06);
      border: 1px solid rgba(240,240,233,0.15);
      border-radius: 8px;
      color: #F0F0E9;
      padding: 0.65rem 0.85rem;
      font-size: 0.95rem;
      font-family: Arial, sans-serif;
      outline: none;
    }
    .inv-form-row select option { background: #2E3A3F; }
    .inv-form-row input:focus,
    .inv-form-row select:focus,
    .inv-form-row textarea:focus {
      border-color: rgba(159,159,186,0.5);
    }
    .inv-modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 6px;
    }
    .inv-cancel-btn {
      background: none;
      border: 1px solid rgba(240,240,233,0.2);
      border-radius: 999px;
      color: #F0F0E9;
      padding: 0.55rem 1.1rem;
      font-size: 0.9rem;
      cursor: pointer;
      font-family: Arial, sans-serif;
    }
    .inv-save-btn {
      background: #E1924E;
      border: none;
      border-radius: 999px;
      color: #fff;
      padding: 0.55rem 1.3rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      font-family: Arial, sans-serif;
    }
    .inv-row-actions {
      display: flex;
      gap: 8px;
      padding: 8px 20px 16px;
    }
    .inv-edit-btn {
      background: none;
      border: 1px solid rgba(240,240,233,0.2);
      border-radius: 999px;
      color: #F0F0E9;
      padding: 0.4rem 1rem;
      font-size: 0.85rem;
      cursor: pointer;
      font-family: Arial, sans-serif;
    }
    .inv-delete-btn {
      background: rgba(205,88,51,0.12);
      border: 1px solid rgba(205,88,51,0.35);
      border-radius: 999px;
      color: #ffd0c4;
      padding: 0.4rem 1rem;
      font-size: 0.85rem;
      cursor: pointer;
      font-family: Arial, sans-serif;
    }
  `;
  document.head.appendChild(style);

  const backdrop = document.createElement("div");
  backdrop.className = "inv-modal-backdrop";
  backdrop.hidden = true;

  backdrop.innerHTML = `
    <div class="inv-modal">
      <div class="inv-modal-header">
        <h2 id="invModalTitle">Add Item</h2>
        <button type="button" class="inv-modal-close" id="invModalClose">✕</button>
      </div>
      <form id="invItemForm">
        <div class="inv-form-row">
          <label for="invFieldName">Name</label>
          <input id="invFieldName" name="name" type="text" required />
        </div>
        <div class="inv-form-row">
          <label for="invFieldSku">SKU</label>
          <input id="invFieldSku" name="sku" type="text" />
        </div>
        <div class="inv-form-row">
          <label for="invFieldCategory">Category</label>
          <input id="invFieldCategory" name="category" type="text" />
        </div>
        <div class="inv-form-row">
          <label for="invFieldStatus">Status</label>
          <select id="invFieldStatus" name="status">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Error">Error</option>
          </select>
        </div>
        <div class="inv-form-row">
          <label for="invFieldQty">Quantity</label>
          <input id="invFieldQty" name="quantity" type="number" min="0" value="0" required />
        </div>
        <div class="inv-form-row">
          <label for="invFieldSupplier">Supplier</label>
          <input id="invFieldSupplier" name="supplier" type="text" />
        </div>
        <div class="inv-form-row">
          <label for="invFieldLocation">Location</label>
          <input id="invFieldLocation" name="location" type="text" placeholder="Aisle A / Bin 12" />
        </div>
        <div class="inv-form-row">
          <label for="invFieldNotes">Notes</label>
          <textarea id="invFieldNotes" name="notes" rows="3"></textarea>
        </div>
        <div class="inv-modal-footer">
          <button type="button" class="inv-cancel-btn" id="invModalCancel">Cancel</button>
          <button type="submit" class="inv-save-btn">Save Item</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(backdrop);
  return backdrop;
}

const modalBackdrop = createModal();
const modalTitle = document.getElementById("invModalTitle");
const itemForm = document.getElementById("invItemForm");
let editingId = null;

function openModal(item = null) {
  editingId = item ? item.id : null;
  modalTitle.textContent = item ? "Edit Item" : "Add Item";
  itemForm.reset();
  if (item) {
    itemForm.name.value     = item.name ?? "";
    itemForm.sku.value      = item.sku ?? "";
    itemForm.category.value = item.category ?? "";
    itemForm.status.value   = item.status ?? "Active";
    itemForm.quantity.value = item.quantity ?? 0;
    itemForm.supplier.value = item.supplier ?? "";
    itemForm.location.value = item.location ?? "";
    itemForm.notes.value    = item.notes ?? "";
  }
  modalBackdrop.hidden = false;
}

function closeModal() {
  modalBackdrop.hidden = true;
  editingId = null;
}

document.getElementById("invModalClose").addEventListener("click", closeModal);
document.getElementById("invModalCancel").addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

itemForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = {
    name:     itemForm.name.value.trim(),
    sku:      itemForm.sku.value.trim(),
    category: itemForm.category.value.trim(),
    status:   itemForm.status.value,
    quantity: parseInt(itemForm.quantity.value, 10),
    supplier: itemForm.supplier.value.trim() || null,
    location: itemForm.location.value.trim() || null,
    updated:  new Date().toISOString().split("T")[0],
    notes:    itemForm.notes.value.trim() || null
  };
  if (editingId !== null) {
    await updateItem(editingId, formData);
  } else {
    await createItem(formData);
  }
  closeModal();
});

// Wire the ➕ Add button in the topbar
const addBtn = document.querySelector('.tool[title="Add"]');
if (addBtn) addBtn.addEventListener("click", () => openModal());

// ── Init ──────────────────────────────────────────────────────────────────────

loadItems();
