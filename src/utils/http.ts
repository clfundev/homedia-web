import axios from 'axios'

// 封装axios
const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 30000,
})

export { http }
