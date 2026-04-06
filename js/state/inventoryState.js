export function createInventoryState() {
  return {
    items: [],
    filteredItems: [],
    openItemId: null,
    searchQuery: "",
    activeFilters: {
      category: [],
      status: [],
      accessLevel: []
    },
    sortState: {
      name: null,
      category: null,
      status: null,
      accessLevel: null
    }
  };
}
