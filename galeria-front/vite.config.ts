import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // permite acesso externo
    port: 5174,
    allowedHosts: ['ec2-15-228-149-9.sa-east-1.compute.amazonaws.com'], // libera seu domínio público da EC2
  }
})