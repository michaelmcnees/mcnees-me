import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://mcnees.me',
  output: 'static',
  adapter: cloudflare({
    routes: {
      extend: {
        exclude: [{ pattern: '/pagefind/*' }],
      },
    },
  }),
  integrations: [
    react(),
    mdx({
      shikiConfig: {
        theme: 'github-dark-default',
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
      },
    },
  },
});
