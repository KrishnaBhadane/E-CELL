import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { rollupOptions: { input: { main: fileURLToPath(new URL('./index.html', import.meta.url)), members: fileURLToPath(new URL('./members.html', import.meta.url)), blog: fileURLToPath(new URL('./blog.html', import.meta.url)) } } },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
