import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import vercel from '@astrojs/vercel';
import mdx from '@astrojs/mdx';
import pagefind from 'astro-pagefind';

// Production runs on Cloudflare; the arcade-os redesign is previewed on Vercel.
// Vercel sets VERCEL=1 in its build environment, so we swap adapters there.
const onVercel = !!process.env.VERCEL;

export default defineConfig({
  site: 'https://mcnees.me',
  output: 'static',
  adapter: onVercel
    ? vercel()
    : cloudflare({
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
