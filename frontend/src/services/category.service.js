import { API_URL } from "../config/api.js";

function getToken() {
  return sessionStorage.getItem("token");
}

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Ocurrió un error");
  }

  return data;
}

export async function getCategories() {
  const response = await fetch(`${API_URL}/categories`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await handleResponse(response);

  return data.data.categories;
}

export async function createCategory(categoryData) {
  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(categoryData),
  });

  const data = await handleResponse(response);

  return data.data.category;
}

export async function updateCategory(categoryId, categoryData) {
  const response = await fetch(
    `${API_URL}/categories/${categoryId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(categoryData),
    }
  );

  const data = await handleResponse(response);

  return data.data.category;
}

export async function deleteCategory(categoryId) {
  const response = await fetch(
    `${API_URL}/categories/${categoryId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  await handleResponse(response);
}