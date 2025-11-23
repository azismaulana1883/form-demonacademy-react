// @ts-nocheck
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import javascriptObfuscator from 'vite-plugin-javascript-obfuscator'

export default defineConfig(({ command }) => {
  const isBuild = command === 'build'

  return {
    plugins: [
      react(),

      // 🔥 Obfuscate HANYA saat build, biar dev tetap waras
      isBuild &&
        javascriptObfuscator({
          // === MODE BRUTAL ===
          compact: true,

          // Control flow diacak total
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 1,

          // Tambah dead code di mana-mana
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 1,

          // Semua string dimasukin ke array + diencode RC4
          stringArray: true,
          stringArrayEncoding: ['rc4'],
          stringArrayThreshold: 1,
          rotateStringArray: true,
          shuffleStringArray: true,

          // Pecah string biar susah search
          splitStrings: true,
          splitStringsChunkLength: 3,

          // Bikin fungsi / kode susah di-modif balik
          selfDefending: true,

          // Anti-debugger (DevTools bakal ke-dodge / lag)
          debugProtection: true,
          debugProtectionInterval: 4000, // ms, harus number > 0

          // Hilangin semua console output
          disableConsoleOutput: true,

          // Tambah kekacauan ekstra
          transformObjectKeys: true,
          numbersToExpressions: true,
          simplify: true,

          // Rename ke global scope juga (paling agresif)
          renameGlobals: true,

          // (Optional) kalau mau nambah:
          // identifierNamesGenerator: 'hexadecimal',
          // unicodeEscapeSequence: true,
        }),
    ].filter(Boolean),

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
          drop_console: true,
          drop_debugger: true,
        },
        mangle: true,
      },
    },
  }
})
