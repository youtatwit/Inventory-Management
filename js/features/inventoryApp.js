import { fetchItems, createItem, updateItem, deleteItem } from "../api/itemsApi.js";
import { createInventoryState } from "../state/inventoryState.js";
import { debounce } from "../utils/debounce.js";
import { normalizeSearchValue } from "../utils/formatters.js";
import { createInventoryTable } from "../components/inventoryTable.js";
import { createFilterDropdown } from "../components/filterDropdown.js";
import { createItemModal } from "../components/modal.js";
import { createFabMenu } from "../components/fabMenu.js";

export function createInventoryApp() {
  const state = createInventoryState();

  const inventoryTableEl = document.getElementById("inventoryTable");
  const resultsCountEl = document.getElementById("resultsCount");
  const searchInputEl = document.getElementById("searchInput");
  const filterBtnEl = document.getElementById("filterBtn");
  const filterDropdownEl = document.getElementById("filterDropdown");
  const fabMenuEl = document.getElementById("fabMenu");
  const profileFabEl = document.getElementById("profileFab");
  const homeFabEl = document.getElementById("homeFab");
  const settingsFabEl = document.getElementById("settingsFab");
  const addDeviceFabEl = document.getElementById("addDeviceFab");

  const table = createInventoryTable({
    inventoryTable: inventoryTableEl,
    resultsCount: resultsCountEl,
    getItems: () => state.filteredItems,
    getOpenItemId: () => state.openItemId,
    setOpenItemId: (value) => {
      state.openItemId = value;
    },
    getSortState: () => state.sortState,
    onSortChange: handleSortChange,
    onEdit: handleEditItem,
    onDelete: handleDeleteItem
  });

  const modal = createItemModal({
    onSubmit: handleSaveItem
  });

  const filters = createFilterDropdown({
    filterBtn: filterBtnEl,
    filterDropdown: filterDropdownEl,
    getItems: () => state.items,
    getActiveFilters: () => state.activeFilters,
    setActiveFilters: (value) => {
      state.activeFilters = value;
    },
    onApply: applyFiltersAndRender
  });

  const fabMenu = createFabMenu({
    fabMenu: fabMenuEl,
    profileFab: profileFabEl,
    homeFab: homeFabEl,
    settingsFab: settingsFabEl,
    addDeviceFab: addDeviceFabEl,
    onAdd: () => modal.open()
  });

  async function init() {
    bindEvents();
    filters.bindGlobalClose();
    fabMenu.bind();
    await loadItems();
  }

  function bindEvents() {
    searchInputEl.addEventListener(
      "input",
      debounce((event) => {
        state.searchQuery = event.target.value.trim();
        applyFiltersAndRender();
      }, 220)
    );
  }

  async function loadItems() {
    const items = await fetchItems();

    state.items = items.map((item) => ({
      ...item,
      accessLevel: item.accessLevel ?? "Low"
    }));

    applyFiltersAndRender();
  }

  function applyFiltersAndRender() {
    let items = [...state.items];

    const normalizedQuery = normalizeSearchValue(state.searchQuery);

    if (normalizedQuery) {
      items = items.filter((item) => {
        return [
          item.name,
          item.category,
          item.status,
          item.accessLevel,
          item.sku,
          item.supplier,
          item.location,
          item.notes
        ].some((value) => normalizeSearchValue(value).includes(normalizedQuery));
      });
    }

    if (state.activeFilters.category.length) {
      items = items.filter((item) => state.activeFilters.category.includes(item.category));
    }

    if (state.activeFilters.status.length) {
      items = items.filter((item) => state.activeFilters.status.includes(item.status));
    }

    if (state.activeFilters.accessLevel.length) {
      items = items.filter((item) => state.activeFilters.accessLevel.includes(item.accessLevel));
    }

    const activeSortKey = Object.keys(state.sortState).find((key) => state.sortState[key]);

    if (activeSortKey) {
      const direction = state.sortState[activeSortKey] === "asc" ? 1 : -1;

      items.sort((a, b) => {
        const aValue = normalizeSearchValue(a[activeSortKey]);
        const bValue = normalizeSearchValue(b[activeSortKey]);

        if (aValue < bValue) return -1 * direction;
        if (aValue > bValue) return 1 * direction;
        return 0;
      });
    }

    state.filteredItems = items;
    table.render(state.filteredItems);
  }

  function handleSortChange(key) {
    const current = state.sortState[key];
    const next = current === null ? "asc" : current === "asc" ? "desc" : null;

    Object.keys(state.sortState).forEach((sortKey) => {
      state.sortState[sortKey] = null;
    });

    state.sortState[key] = next;
    applyFiltersAndRender();
  }

  async function handleSaveItem(payload, editingItemId) {
    const apiPayload = {
      name: payload.name,
      sku: payload.sku,
      category: payload.category,
      status: payload.status,
      quantity: payload.quantity,
      supplier: payload.supplier,
      location: payload.location,
      updated: payload.updated,
      notes: payload.notes
    };

    if (editingItemId !== null) {
      await updateItem(editingItemId, apiPayload);
    } else {
      await createItem(apiPayload);
    }

    await loadItems();
  }

  function handleEditItem(item) {
    modal.open(item);
  }

  async function handleDeleteItem(item) {
    const confirmed = window.confirm(`Delete "${item.name}"?`);
    if (!confirmed) return;

    await deleteItem(item.id);
    await loadItems();
  }

  return {
    init
  };
}
