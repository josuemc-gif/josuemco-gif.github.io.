import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/NOMBRE-EXACTO-DEL-REPOSITORIO/',
  plugins: [react(), tailwindcss()],
})
