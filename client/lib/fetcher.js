/**
 * Fetcher function for SWR
 * Automatically includes auth token from localStorage
 */
export async function fetcher(url) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  
  if (!res.ok) {
    const error = new Error('API request failed');
    error.status = res.status;
    throw error;
  }
  
  return res.json();
}

/**
 * Fetcher with custom headers
 */
export function createFetcher(customHeaders = {}) {
  return async function (url) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const res = await fetch(url, {
      headers: {
        ...customHeaders,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    
    if (!res.ok) {
      const error = new Error('API request failed');
      error.status = res.status;
      throw error;
    }
    
    return res.json();
  };
}
