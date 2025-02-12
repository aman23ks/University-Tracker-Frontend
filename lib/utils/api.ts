export interface FetchAPIOptions {
  method?: string
  headers?: Record<string, string>
  body?: any
  responseType?: 'json' | 'blob' | 'text'
  query?: Record<string, any>
}

function buildUrl(endpoint: string, query?: Record<string, any>): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  const url = new URL(endpoint, baseUrl)
  
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString())
      }
    })
  }
  
  return url.toString()
}

export async function fetchAPI<T = any>(
  endpoint: string,
  options: FetchAPIOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    responseType = 'json',
    query
  } = options

  try {
    const token = localStorage.getItem('token')
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    }

    const url = buildUrl(endpoint, query)

    const response = await fetch(url, {
      method,
      headers: defaultHeaders,
      ...(body ? { body: JSON.stringify(body) } : {})
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'API request failed')
    }

    if (responseType === 'blob') {
      return response.blob() as Promise<T>
    }
    
    if (responseType === 'text') {
      return response.text() as Promise<T>
    }

    return response.json()
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch data')
  }
}