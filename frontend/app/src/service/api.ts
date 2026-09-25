const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1").replace(/\/$/, "")
const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "")

export const getAssetUrl = (path?: string | null) => {
  if (!path) return undefined
  if (/^https?:\/\//i.test(path)) return path
  return `${API_ORIGIN}/${path.replace(/^\/+/, "")}`
}

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

export const getAuthHeadersForFormData = () => {
  const token = localStorage.getItem("token")
  return {
    Authorization: `Bearer ${token}`,
  }
}

export { API_BASE_URL }
