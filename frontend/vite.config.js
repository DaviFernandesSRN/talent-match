import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // ESTA É A CURA: Força todo mundo a usar o mesmo React
    dedupe: ['react', 'react-dom'], 
  },
})