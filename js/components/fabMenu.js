export function createFabMenu({
  fabMenu,
  profileFab,
  homeFab,
  settingsFab,
  addDeviceFab,
  onAdd
}) {
  const fabActions = [...fabMenu.querySelectorAll(".fab-action")];

  function setPositions() {
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

  function open() {
    setPositions();
    fabMenu.classList.add("is-open");
    profileFab.setAttribute("aria-expanded", "true");
  }

  function close() {
    fabMenu.classList.remove("is-open");
    profileFab.setAttribute("aria-expanded", "false");

    fabActions.forEach((action) => {
      action.style.transitionDelay = "0ms";
    });
  }

  function toggle() {
    if (fabMenu.classList.contains("is-open")) {
      close();
    } else {
      open();
    }
  }

  function bind() {
    profileFab.addEventListener("click", (event) => {
      event.stopPropagation();
      toggle();
    });

    addDeviceFab.addEventListener("click", (event) => {
      event.stopPropagation();
      close();
      onAdd();
    });

    settingsFab.addEventListener("click", (event) => {
      event.stopPropagation();
      close();
      console.log("Open settings");
    });

    homeFab.addEventListener("click", (event) => {
      event.stopPropagation();
      close();
      window.location.href = "main.html";
    });

    document.addEventListener("click", (event) => {
      if (!fabMenu.contains(event.target)) {
        close();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        close();
      }
    });

    window.addEventListener("resize", setPositions);
    setPositions();
  }

  return {
    bind,
    open,
    close
  };
}
