const API_BASE = 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  id?: string;
  count?: number;
}

const request = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

export const api = {
  data: {
    getCities: () => request('/data/cities'),
    getRoutes: () => request('/data/routes'),
    getGoods: () => request('/data/goods'),
    getVehicles: () => request('/data/vehicles'),
    getWeather: () => request('/data/weather'),
    getEvents: () => request('/data/events'),
    getAll: () => request('/data/all'),
  },
  
  save: {
    get: () => request('/save'),
    post: (data: unknown) => request('/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    delete: () => request('/save', { method: 'DELETE' }),
  },
  
  ledger: {
    get: (day?: number) => {
      const url = day ? `/ledger?day=${day}` : '/ledger';
      return request(url);
    },
    post: (entry: unknown) => request('/ledger', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),
    postBatch: (entries: unknown[]) => request('/ledger/batch', {
      method: 'POST',
      body: JSON.stringify(entries),
    }),
    delete: (id: string) => request(`/ledger/${id}`, { method: 'DELETE' }),
  },
  
  health: () => request('/health'),
};
