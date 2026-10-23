import { defineConfig } from 'vite';

export default defineConfig({
  base: '/mabar/',
  build: {
    outDir: 'dist/mabar',
    emptyOutDir: true,
  },
});
