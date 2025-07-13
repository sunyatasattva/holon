import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.js'],
  },
  // optimizeDeps: { // No longer needed as Firebase is loaded globally
  //   exclude: ['firebase']
  // },
  build: {
    rollupOptions: {
      input: {
        // Define build entry points
        main: resolve(__dirname, 'src/assets/script/index.js'),
        rulebook: resolve(__dirname, 'rulebook/src/assets/script/index.js'),
      },
      // Output configuration can be refined here if needed
      // to match the old dist/bundle.js, rulebook/dist/bundle.js structure
    },
    outDir: 'dist', // Main output directory for all builds
  },
  resolve: {
    alias: {
      // Point vue to the ESM build for Vite compatibility
      'vue$': 'vue/dist/vue.esm.js',
      // Replicate aliases from old 'browser' field in package.json
      '_equipment': resolve(__dirname, './rulebook/rules/equipment.json'),
      '_mechanics': resolve(__dirname, './rulebook/rules/mechanics.json'),
      '_skills': resolve(__dirname, './rulebook/rules/skills.json'),
    }
  },
  // Optional: Configure server options if needed
  // server: {
  //   port: 3000, // Example: set dev server port
  // }
}); 