// @ts-nocheck
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import javascriptObfuscator from 'vite-plugin-javascript-obfuscator'
import fs from 'fs'

export default defineConfig(({ command }) => {
const isBuild = command === 'build'

return {
  plugins: [
    react(),

    // 🔥 Obfuscation hanya saat build
    isBuild &&
      javascriptObfuscator({
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 1,
        stringArray: true,
        stringArrayEncoding: ['rc4'],
        stringArrayThreshold: 1,
        rotateStringArray: true,
        shuffleStringArray: true,
        splitStrings: true,
        splitStringsChunkLength: 3,
        selfDefending: true,
        debugProtection: true,
        debugProtectionInterval: 4000,
        disableConsoleOutput: true,
        transformObjectKeys: true,
        numbersToExpressions: true,
        simplify: true,
        renameGlobals: true,
      }),
  ].filter(Boolean),

  // 🔥 LOCAL DEV HTTPS hanya saat `npm run dev`
  server: command === 'serve'
    ? {
        https: {
          key: fs.readFileSync('./localhost-key.pem'),
          cert: fs.readFileSync('./localhost.pem'),
        },
        host: true,
        port: 5173,
      }
    : undefined,

  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: true,
    },
  },
}
})
