import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import react from "@astrojs/react";
import compressor from "astro-compressor";

export default defineConfig({
  experimental: {
    optimizeHoistedScript: true
  },
  integrations: [tailwind(),sitemap(), robotsTxt(), react(), compressor()]
});