import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import react from "@astrojs/react";
import partytown from '@astrojs/partytown';
import svelte from '@astrojs/svelte';
import alpinejs from "@astrojs/alpinejs";
import compressor from "astro-compressor";
import compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
  experimental: {
    optimizeHoistedScript: true
  },
  integrations: [
    tailwind(),
    sitemap(),
    robotsTxt(),
    react(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    svelte(),
    alpinejs(),
    compress({
      css: true,
      html: true,
      js: true,
      img: true,
      svg: true
    })
  ],
});