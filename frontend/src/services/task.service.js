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

export async function getTasks(filters = {}) {
  const params = new URLSearchParams();

  if (filters.search) {
    params.append("search", filters.search);
  }

  if (filters.status) {
    params.append("status", filters.status);
  }

  if (filters.priority) {
    params.append("priority", filters.priority);
  }

  if (filters.category) {
    params.append("category", filters.category);
  }

  if (filters.sort) {
    params.append("sort", filters.sort);
  }

  const queryString = params.toString();

  const url = queryString
    ? `${API_URL}/tasks?${queryString}`
    : `${API_URL}/tasks`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await handleResponse(response);

  return data.data.tasks;
}

export async function getTaskById(taskId) {
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await handleResponse(response);

  return data.data.task;
}

export async function createTask(taskData) {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(taskData),
  });

  const data = await handleResponse(response);

  return data.data.task;
}

export async function updateTask(taskId, taskData) {
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(taskData),
  });

  const data = await handleResponse(response);

  return data.data.task;
}

export async function updateTaskStatus(taskId, status) {
  const response = await fetch(
    `${API_URL}/tasks/${taskId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  const data = await handleResponse(response);

  return data.data.task;
}

export async function deleteTask(taskId) {
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  await handleResponse(response);
}