interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, unknown>
  keepalive?: boolean
}

async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, keepalive } = options
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const res = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
    keepalive,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    
    // Handle maintenance mode (503)
    if (res.status === 503 && err.maintenance) {
      // Store maintenance message and redirect
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('maintenance_message', err.message || 'Maintenance en cours')
      }
      if (typeof navigateTo !== 'undefined') {
        navigateTo('/maintenance')
      }
    }
    
    throw new Error(err.message || err.errors?.[0]?.message || `API error ${res.status}`)
  }

  return res.json() as Promise<T>
}

export function useApi() {
  return {
    get: <T = unknown>(path: string) => api<T>(path),
    post: <T = unknown>(path: string, body?: Record<string, unknown>, opts?: { keepalive?: boolean }) =>
      api<T>(path, { method: 'POST', body, ...opts }),
  }
}
