import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['style.css']
    }
  },
  // ...other configuration options...
});