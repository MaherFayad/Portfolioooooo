import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import compress from 'astro-compress';
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  experimental: {
    // viewTransitions: true,
    optimizeHoistedScript: true
  },
  integrations: [tailwind(), compress(), sitemap(), robotsTxt(), react()]
});