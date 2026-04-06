const API_BASE = "/api/items";

async function handleJsonResponse(response) {
  if (!response.ok) {
    let message = "Request failed";
    try {
      const error = await response.json();
      message = error.detail || message;
    } catch {
      // ignore JSON parse failure
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function fetchItems() {
  const response = await fetch(API_BASE);
  return handleJsonResponse(response);
}

export async function createItem(itemData) {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(itemData)
  });

  return handleJsonResponse(response);
}

export async function updateItem(itemId, itemData) {
  const response = await fetch(`${API_BASE}/${itemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(itemData)
  });

  return handleJsonResponse(response);
}

export async function deleteItem(itemId) {
  const response = await fetch(`${API_BASE}/${itemId}`, {
    method: "DELETE"
  });

  return handleJsonResponse(response);
}
