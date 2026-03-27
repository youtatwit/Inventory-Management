const inventoryTable = document.getElementById("inventoryTable");
const searchInput = document.getElementById("searchInput");
const resultsCount = document.getElementById("resultsCount");
const filterBtn = document.getElementById("filterBtn");
const filterDropdown = document.getElementById("filterDropdown");
const fabMenu = document.getElementById("fabMenu");
const profileFab = document.getElementById("profileFab");
const settingsFab = document.getElementById("settingsFab");
const addDeviceFab = document.getElementById("addDeviceFab");
const homeFab = document.getElementById("homeFab");

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
let activeFilters = {
    category: [],
    status: [],
    accessLevel: []
};

// tri-state sorting state: null = none, 'asc', 'desc'
let sortState = {
    name: null,
    category: null,
    status: null,
    accessLevel: null
};

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

    // add interactive handlers for header clicks (tri-state sort)
    attachHeaderSortHandlers();

    if (openItemId !== null) {
        const existingGroup = document.querySelector(`.row-group[data-item-id="${openItemId}"]`);
        if (existingGroup) {
            openRow(existingGroup);
        } else {
            openItemId = null;
        }
    }
}

function attachHeaderSortHandlers() {
    const headerCells = inventoryTable.querySelectorAll('thead th');

    // clear previous handlers by cloning nodes
    headerCells.forEach((th) => {
        const key = th.dataset.key;
        if (!key) return;
        th.classList.add('sortable');

        th.onclick = () => {
            handleHeaderClick(key, th);
        };
    });
}

function handleHeaderClick(key, th) {
    // toggle tri-state for the clicked key, clear others
    const current = sortState[key];
    const next = current === null ? 'asc' : current === 'asc' ? 'desc' : null;

    // reset all
    Object.keys(sortState).forEach(k => sortState[k] = null);
    sortState[key] = next;

    // update UI indicators
    updateHeaderIndicators();

    // apply sorting
    applySortAndRender();
}

function updateHeaderIndicators() {
    const headerCells = inventoryTable.querySelectorAll('thead th');
    headerCells.forEach((th) => {
        const key = th.dataset.key;
        th.classList.remove('sort-asc', 'sort-desc');
        if (!key) return;
        if (sortState[key] === 'asc') th.classList.add('sort-asc');
        if (sortState[key] === 'desc') th.classList.add('sort-desc');
    });
}

function applySortAndRender() {
    const activeKey = Object.keys(sortState).find(k => sortState[k]);
    let items = [...currentItems];

    if (activeKey) {
        const dir = sortState[activeKey] === 'asc' ? 1 : -1;
        items.sort((a, b) => {
            const av = (a[activeKey] || '').toString().toLowerCase();
            const bv = (b[activeKey] || '').toString().toLowerCase();
            if (av < bv) return -1 * dir;
            if (av > bv) return 1 * dir;
            return 0;
        });
    }

    renderTable(items);
}

function closeAllRows() {
    document.querySelectorAll(".row-group").forEach((group) => {
        group.classList.remove("is-open");
        const btn = group.querySelector(".row-toggle");
        if (btn) btn.setAttribute("aria-expanded", "false");
    });
}

function openRow(group) {
    const currentlyOpen = document.querySelector(".row-group.is-open");

    if (currentlyOpen && currentlyOpen !== group) {
        currentlyOpen.classList.remove("is-open");
        const currentBtn = currentlyOpen.querySelector(".row-toggle");
        if (currentBtn) currentBtn.setAttribute("aria-expanded", "false");
        animateDetailsClose(currentlyOpen);
    }

    group.classList.add("is-open");
    const btn = group.querySelector(".row-toggle");
    if (btn) btn.setAttribute("aria-expanded", "true");

    animateDetailsOpen(group);
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
        animateDetailsClose(group);
        openItemId = null;
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
    debounceFilter(event.target.value);
});

// debounce helper
let debounceTimer = null;
function debounceFilter(val) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => filterItems(val), 220);
}

// Build filter dropdown content
function buildFilterDropdown() {
    const categories = Array.from(new Set(inventoryItems.map(i => i.category))).sort();
    const statuses = Array.from(new Set(inventoryItems.map(i => i.status))).sort();
    const access = Array.from(new Set(inventoryItems.map(i => i.accessLevel))).sort();

    filterDropdown.innerHTML = '';

    const makeGroup = (title, list, key) => {
        const wrap = document.createElement('div');
        wrap.className = 'filter-group';
        const h = document.createElement('h4');
        h.textContent = title;
        wrap.appendChild(h);

        const listWrap = document.createElement('div');
        listWrap.className = 'filter-list';

        list.forEach(v => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'filter-chip';
            chip.textContent = v;
            chip.dataset.value = v;
            // mark active if already present in activeFilters so selection persists
            const arrKey = key;
            if (Array.isArray(activeFilters[arrKey]) && activeFilters[arrKey].includes(v)) {
                chip.classList.add('active');
            }
            chip.addEventListener('click', () => {
                toggleFilterChip(key, v, chip);
            });
            listWrap.appendChild(chip);
        });

        wrap.appendChild(listWrap);
        return wrap;
    };

    filterDropdown.appendChild(makeGroup('Category', categories, 'category'));
    filterDropdown.appendChild(makeGroup('Status', statuses, 'status'));
    filterDropdown.appendChild(makeGroup('Access', access, 'accessLevel'));

    const actions = document.createElement('div');
    actions.className = 'filter-actions';

    const clearBtn = document.createElement('button');
    clearBtn.className = 'filter-clear';
    clearBtn.type = 'button';
    clearBtn.textContent = 'Clear';
    clearBtn.addEventListener('click', () => {
        activeFilters = { category: [], status: [], accessLevel: [] };
        // reset chips
        filterDropdown.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        applyFiltersAndRender();
    });

    const applyBtn = document.createElement('button');
    applyBtn.className = 'filter-apply';
    applyBtn.type = 'button';
    applyBtn.textContent = 'Apply';
    applyBtn.addEventListener('click', () => {
        closeFilterDropdown();
        applyFiltersAndRender();
    });

    actions.appendChild(clearBtn);
    actions.appendChild(applyBtn);
    filterDropdown.appendChild(actions);
}

function toggleFilterChip(key, value, chipEl) {
    const arrKey = key;
    const idx = activeFilters[arrKey].indexOf(value);
    if (idx === -1) {
        activeFilters[arrKey].push(value);
        chipEl.classList.add('active');
    } else {
        activeFilters[arrKey].splice(idx, 1);
        chipEl.classList.remove('active');
    }
}

function openFilterDropdown() {
    filterDropdown.hidden = false;
    filterDropdown.setAttribute('aria-hidden', 'false');
    filterBtn.setAttribute('aria-expanded', 'true');
}

function closeFilterDropdown() {
    filterDropdown.hidden = true;
    filterDropdown.setAttribute('aria-hidden', 'true');
    filterBtn.setAttribute('aria-expanded', 'false');
}

filterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (filterDropdown.hidden) {
        buildFilterDropdown();
        openFilterDropdown();
    } else {
        closeFilterDropdown();
    }
});

document.addEventListener('click', (e) => {
    if (!filterDropdown.contains(e.target) && e.target !== filterBtn) {
        closeFilterDropdown();
    }
});

// Apply activeFilters and search query, then sort and render
function applyFiltersAndRender() {
    // start from full inventory
    currentItems = [...inventoryItems];

    // apply text search
    const q = searchInput.value.trim().toLowerCase();
    if (q) {
        currentItems = currentItems.filter((item) => {
            return [
                item.name,
                item.category,
                item.status,
                item.accessLevel,
                item.sku,
                item.supplier,
                item.location,
                item.notes
            ].some((value) => String(value).toLowerCase().includes(q));
        });
    }

    // category filter
    if (activeFilters.category.length) {
        currentItems = currentItems.filter(i => activeFilters.category.includes(i.category));
    }

    // status filter
    if (activeFilters.status.length) {
        currentItems = currentItems.filter(i => activeFilters.status.includes(i.status));
    }

    // accessLevel filter
    if (activeFilters.accessLevel.length) {
        currentItems = currentItems.filter(i => activeFilters.accessLevel.includes(i.accessLevel));
    }

    // after filters, apply sort
    const activeKey = Object.keys(sortState).find(k => sortState[k]);
    if (activeKey) {
        const dir = sortState[activeKey] === 'asc' ? 1 : -1;
        currentItems.sort((a, b) => {
            const av = (a[activeKey] || '').toString().toLowerCase();
            const bv = (b[activeKey] || '').toString().toLowerCase();
            if (av < bv) return -1 * dir;
            if (av > bv) return 1 * dir;
            return 0;
        });
    }

    renderTable(currentItems);
}

// Clicking on cells for category/status/access toggles sort for that column
function attachCellClickSortHandlers() {
    // Disabled: sorting only happens from header clicks.
    // Row body cells should not trigger sort to avoid conflicting with row expand/collapse.
}

// Ensure cell click handlers are attached after render
const originalRenderTable = renderTable;
renderTable = function(items) {
    originalRenderTable(items);
    attachCellClickSortHandlers();
    updateHeaderIndicators();
};

const fabActions = [...document.querySelectorAll(".fab-action")];

function closeFabMenu() {
    fabMenu.classList.remove("is-open");
    profileFab.setAttribute("aria-expanded", "false");

    fabActions.forEach((action) => {
        action.style.transitionDelay = "0ms";
    });
}

function setFabActionPositions() {
    fabActions.forEach((action, index) => {
        const angleDeg = Number(action.dataset.angle || -120);
        const radius = Number(action.dataset.radius || 112);
        const angleRad = (angleDeg * Math.PI) / 180;

        const x = Math.cos(angleRad) * radius;
        const y = Math.sin(angleRad) * radius;

        action.style.setProperty("--x", `${x}px`);
        action.style.setProperty("--y", `${y}px`);
        action.style.transitionDelay = `${index * 55}ms`;
    });
}

homeFab.addEventListener("click", (event) => {
    event.stopPropagation();
    console.log("Go to home");
    closeFabMenu();
});

function openFabMenu() {
    setFabActionPositions();
    fabMenu.classList.add("is-open");
    profileFab.setAttribute("aria-expanded", "true");

    fabActions.forEach((action, index) => {
        action.style.transitionDelay = `${index * 55}ms`;
    });
}

function toggleFabMenu() {
    if (fabMenu.classList.contains("is-open")) {
        closeFabMenu();
        return;
    }

    openFabMenu();
}

profileFab.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleFabMenu();
});

settingsFab.addEventListener("click", (event) => {
    event.stopPropagation();
    console.log("Open settings");
    closeFabMenu();
});

addDeviceFab.addEventListener("click", (event) => {
    event.stopPropagation();
    console.log("Open add device flow");
    closeFabMenu();
});

document.addEventListener("click", (event) => {
    if (!fabMenu.contains(event.target)) {
        closeFabMenu();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeFabMenu();
    }
});

window.addEventListener("resize", setFabActionPositions);

setFabActionPositions();

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
