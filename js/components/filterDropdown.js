export function createFilterDropdown({
  filterBtn,
  filterDropdown,
  getItems,
  getActiveFilters,
  setActiveFilters,
  onApply
}) {
  function build() {
    const items = getItems();
    const activeFilters = getActiveFilters();

    const categories = [...new Set(items.map((item) => item.category).filter(Boolean))].sort();
    const statuses = [...new Set(items.map((item) => item.status).filter(Boolean))].sort();
    const accessLevels = [...new Set(items.map((item) => item.accessLevel).filter(Boolean))].sort();

    filterDropdown.innerHTML = "";

    filterDropdown.appendChild(createGroup("Category", categories, "category", activeFilters));
    filterDropdown.appendChild(createGroup("Status", statuses, "status", activeFilters));
    filterDropdown.appendChild(createGroup("Access", accessLevels, "accessLevel", activeFilters));
    filterDropdown.appendChild(createActions());
  }

  function createGroup(title, values, key, activeFilters) {
    const wrap = document.createElement("div");
    wrap.className = "filter-group";

    const heading = document.createElement("h4");
    heading.textContent = title;
    wrap.appendChild(heading);

    const list = document.createElement("div");
    list.className = "filter-list";

    values.forEach((value) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "filter-chip";
      chip.textContent = value;

      if (activeFilters[key]?.includes(value)) {
        chip.classList.add("active");
      }

      chip.addEventListener("click", () => {
        toggleFilterChip(key, value, chip);
      });

      list.appendChild(chip);
    });

    wrap.appendChild(list);
    return wrap;
  }

  function createActions() {
    const actions = document.createElement("div");
    actions.className = "filter-actions";

    const clearBtn = document.createElement("button");
    clearBtn.className = "filter-clear";
    clearBtn.type = "button";
    clearBtn.textContent = "Clear";
    clearBtn.addEventListener("click", clearFilters);

    const applyBtn = document.createElement("button");
    applyBtn.className = "filter-apply";
    applyBtn.type = "button";
    applyBtn.textContent = "Apply";
    applyBtn.addEventListener("click", () => {
      close();
      onApply();
    });

    actions.appendChild(clearBtn);
    actions.appendChild(applyBtn);

    return actions;
  }

  function toggleFilterChip(key, value, chipElement) {
    const nextFilters = structuredClone(getActiveFilters());
    const index = nextFilters[key].indexOf(value);

    if (index === -1) {
      nextFilters[key].push(value);
      chipElement.classList.add("active");
    } else {
      nextFilters[key].splice(index, 1);
      chipElement.classList.remove("active");
    }

    setActiveFilters(nextFilters);
  }

  function clearFilters() {
    setActiveFilters({
      category: [],
      status: [],
      accessLevel: []
    });

    filterDropdown.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.classList.remove("active");
    });

    onApply();
  }

  function open() {
    build();
    filterDropdown.hidden = false;
    filterDropdown.setAttribute("aria-hidden", "false");
    filterBtn.setAttribute("aria-expanded", "true");
  }

  function close() {
    filterDropdown.hidden = true;
    filterDropdown.setAttribute("aria-hidden", "true");
    filterBtn.setAttribute("aria-expanded", "false");
  }

  function toggle() {
    if (filterDropdown.hidden) {
      open();
    } else {
      close();
    }
  }

  function bindGlobalClose() {
    document.addEventListener("click", (event) => {
      if (!filterDropdown.contains(event.target) && event.target !== filterBtn) {
        close();
      }
    });

    filterBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      toggle();
    });
  }

  return {
    open,
    close,
    bindGlobalClose
  };
}
