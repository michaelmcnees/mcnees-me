import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import pagefind from 'astro-pagefind';

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
    pagefind(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
