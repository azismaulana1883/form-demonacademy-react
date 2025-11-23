// @ts-nocheck
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import obfuscator from 'rollup-plugin-obfuscator'

export default defineConfig({
  plugins: [
    react(),
  ],

  server: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    },
    host: true,
    port: 5173,
  },

    build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,    // buang semua console.log
        drop_debugger: true,   // buang debugger;
      },
    },
    rollupOptions: {
      plugins: [
        obfuscator({
          compact: true,
          controlFlowFlattening: true,
          deadCodeInjection: true,
          debugProtection: true,
          stringArray: true,
          stringArrayEncoding: ['base64'],
        })
      ]
    }
  },
})
