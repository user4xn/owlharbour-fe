import { authStore } from './../stores/auth';
import axios from 'axios'

export async function useApiFetch<T>(path: string | (() => string), options: any = {}) {
  let headers: any = {}
  const auth = authStore()

  const authToken = localStorage.getItem("bearer")

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`
  }

  const apiUrl = typeof path === 'function' ? path() : path

  try {
    const response = await axios({
      method: options.method || 'GET',
      url: 'http://localhost:8081' + apiUrl,
      withCredentials: true,
      headers: {
        ...headers,
        ...(options.headers || {})
      },
      data: options.body || null,
      ...options
    })

    return response.data as T
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      await auth.logout401();

      return
    }

    console.error('API request error:', error)
    throw new Error(error.response?.data?.message || 'An error occurred during API request')
  }
  
}
