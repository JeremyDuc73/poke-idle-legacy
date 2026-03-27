interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, unknown>
  keepalive?: boolean
}

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
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
    
    // Handle maintenance mode (503) — hard redirect to reset all SPA state
    if (res.status === 503 && err.maintenance) {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('maintenance_message', err.message || 'Maintenance en cours')
      }
      if (typeof window !== 'undefined' && window.location.pathname !== '/maintenance') {
        window.location.href = '/maintenance'
      }
    }
    
    throw new ApiError(err.message || err.errors?.[0]?.message || `API error ${res.status}`, res.status)
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
