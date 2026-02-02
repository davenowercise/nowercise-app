import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Helper to check if in demo mode
export function isDemoMode(): boolean {
  return window.location.search.includes('demo=true') || 
         window.location.hash.includes('demo=true') ||
         localStorage.getItem('demoMode') === 'true';
}

// Helper to add demo parameter to URL if needed
export function addDemoParam(url: string): string {
  if (isDemoMode()) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}demo=true`;
  }
  return url;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  url: string,
  options?: {
    method?: string;
    data?: unknown;
    headers?: Record<string, string>;
  }
): Promise<T> {
  // Add demo parameter if needed
  const urlWithDemo = addDemoParam(url);
  
  const method = options?.method || 'GET';
  const data = options?.data;
  const customHeaders = options?.headers || {};
  
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...customHeaders
  };

  // Add demo mode header if in demo mode
  if (isDemoMode()) {
    headers['X-Demo-Mode'] = 'true';
  }

  const res = await fetch(urlWithDemo, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // For methods that don't return JSON (like DELETE)
  if (method === 'DELETE' || res.headers.get('content-length') === '0') {
    return {} as T;
  }
  
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Add demo parameter if needed
    const baseUrl = queryKey[0] as string;
    const url = addDemoParam(baseUrl);
    
    // Build headers with demo mode if applicable
    const headers: Record<string, string> = {};
    if (isDemoMode()) {
      headers['X-Demo-Mode'] = 'true';
    }
    
    const res = await fetch(url, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
