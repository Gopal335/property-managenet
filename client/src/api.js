function getToken() {
  return localStorage.getItem("plm-token") || "";
}

export async function request(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Request failed.");
  }

  return response;
}

export function setAuthToken(token) {
  localStorage.setItem("plm-token", token);
}

export function clearAuthToken() {
  localStorage.removeItem("plm-token");
}

export function hasAuthToken() {
  return Boolean(getToken());
}

export async function fetchProperties() {
  const response = await request("/api/properties");
  return response.json();
}

export async function fetchPropertyById(propertyId) {
  const response = await request(`/api/properties/${propertyId}`);
  return response.json();
}

export async function fetchAdminContact() {
  const response = await request("/api/auth/admin-contact");
  return response.json();
}

export async function submitPropertyInterest(propertyId, payload) {
  const response = await request(`/api/properties/${propertyId}/interest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function createProperty(payload) {
  const response = await request("/api/properties", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function importPropertyMedia(propertyId) {
  const response = await request(`/api/properties/${propertyId}/import-drive`, {
    method: "POST",
  });
  return response.json();
}

export async function fetchPropertyReadme(propertyId) {
  const response = await request(`/api/properties/${propertyId}/readme`);
  return response.text();
}

export async function deleteProperty(propertyId) {
  const response = await request(`/api/properties/${propertyId}`, {
    method: "DELETE",
  });
  return response.json();
}

export async function login(payload) {
  const response = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function fetchMe() {
  const response = await request("/api/auth/me");
  return response.json();
}
