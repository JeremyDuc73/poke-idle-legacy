const API_BASE = 'http://localhost:3333'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, unknown>
}

async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body } = options

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || err.errors?.[0]?.message || `API error ${res.status}`)
  }

  return res.json() as Promise<T>
}

export function useApi() {
  return {
    get: <T = unknown>(path: string) => api<T>(path),
    post: <T = unknown>(path: string, body?: Record<string, unknown>) =>
      api<T>(path, { method: 'POST', body }),
  }
}
