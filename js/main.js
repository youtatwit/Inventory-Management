import { createInventoryApp } from "./features/inventoryApp.js";

document.addEventListener("DOMContentLoaded", async () => {
  const app = createInventoryApp();
  await app.init();
});
