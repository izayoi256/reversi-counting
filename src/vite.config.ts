import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  return {
    base: process.env.PUBLIC_BASE_PATH || '/',
    plugins: [
      svelte(),
      tailwindcss(),
    ],
  };
});
