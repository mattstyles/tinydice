// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import pkg from './package.json'

export default defineConfig({
  build: {
    outDir: 'lib',
    sourcemap: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      name: pkg.name,
      // the proper extensions will be added
      fileName: pkg.name,
      
    },
    rollupOptions: {
      external: Object.keys(pkg.dependencies)
    }
  },
  plugins: [
    dts({
      insertTypesEntry: true
    })
  ]
})