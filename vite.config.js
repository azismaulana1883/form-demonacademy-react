// @ts-nocheck
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import javascriptObfuscator from 'vite-plugin-javascript-obfuscator'
import copy from 'rollup-plugin-copy'

export default defineConfig(({ command }) => {
  const isBuild = command === 'build'

  return {
    plugins: [
      react(),

      // ⬇⬇⬇ Tambahkan plugin copy KESINI
      copy({
        targets: [
          { src: 'public/_redirects', dest: 'dist' }  // WAJIB ADA
        ],
        hook: 'writeBundle'
      }),

      // 🔥 Obfuscate HANYA saat build
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
