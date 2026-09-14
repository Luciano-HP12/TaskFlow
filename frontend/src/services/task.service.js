const API_URL = "http://localhost:3000/api";

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

export async function getTasks() {
  const response = await fetch(`${API_URL}/tasks`, {
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