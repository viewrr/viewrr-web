// Hub base URL. Override with VITE_API_BASE in .env; dev default per contract.
export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://localhost:8080'
