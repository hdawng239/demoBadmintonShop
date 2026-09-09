import { defineConfig, loadEnv } from 'vite'
import { cwd } from 'node:process'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), ['VITE_', 'BANK_'])
  // Chỉ công khai ba biến ngân hàng, không đưa env backend vào bundle.
  const publicBankEnv = Object.fromEntries(
    ['BANK_STK', 'BANK_NAME', 'BANK_ID'].map((name) => [
      `import.meta.env.${name}`, JSON.stringify(env[name] || ''),
    ]),
  )

  return {
    define: publicBankEnv,
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 5173,
    },
  }
})
