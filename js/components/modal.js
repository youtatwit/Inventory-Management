export function createItemModal({ onSubmit }) {
  const backdrop = document.createElement("div");
  backdrop.className = "inv-modal-backdrop";
  backdrop.hidden = true;

  backdrop.innerHTML = `
    <div class="inv-modal" role="dialog" aria-modal="true" aria-labelledby="invModalTitle">
      <div class="inv-modal-header">
        <h2 id="invModalTitle">Add Item</h2>
        <button type="button" class="inv-modal-close" id="invModalClose" aria-label="Close">&#10005;</button>
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
          <label for="invFieldAccessLevel">Access Level</label>
          <select id="invFieldAccessLevel" name="accessLevel">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Admin">Admin</option>
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

  const modalTitle = backdrop.querySelector("#invModalTitle");
  const form = backdrop.querySelector("#invItemForm");
  const closeButton = backdrop.querySelector("#invModalClose");
  const cancelButton = backdrop.querySelector("#invModalCancel");

  let editingItemId = null;

  function open(item = null) {
    editingItemId = item ? item.id : null;
    modalTitle.textContent = item ? "Edit Item" : "Add Item";
    form.reset();

    if (item) {
      form.name.value = item.name ?? "";
      form.sku.value = item.sku ?? "";
      form.category.value = item.category ?? "";
      form.status.value = item.status ?? "Active";
      form.accessLevel.value = item.accessLevel ?? "Low";
      form.quantity.value = item.quantity ?? 0;
      form.supplier.value = item.supplier ?? "";
      form.location.value = item.location ?? "";
      form.notes.value = item.notes ?? "";
    }

    backdrop.hidden = false;
  }

  function close() {
    backdrop.hidden = true;
    editingItemId = null;
  }

  closeButton.addEventListener("click", close);
  cancelButton.addEventListener("click", close);

  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) {
      close();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.value.trim(),
      sku: form.sku.value.trim() || null,
      category: form.category.value.trim() || null,
      status: form.status.value,
      accessLevel: form.accessLevel.value,
      quantity: Number.parseInt(form.quantity.value, 10) || 0,
      supplier: form.supplier.value.trim() || null,
      location: form.location.value.trim() || null,
      updated: new Date().toISOString().split("T")[0],
      notes: form.notes.value.trim() || null
    };

    await onSubmit(payload, editingItemId);
    close();
  });

  return {
    open,
    close
  };
}
