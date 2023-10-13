import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import react from "@astrojs/react";
import partytown from '@astrojs/partytown';
import purgecss from "astro-purgecss";
import svelte from '@astrojs/svelte';
import alpinejs from "@astrojs/alpinejs";


// https://astro.build/config
export default defineConfig({
  experimental: {
    optimizeHoistedScript: true
  },
  integrations: [tailwind(), sitemap(), robotsTxt(), react(), purgecss(), partytown(), svelte(), alpinejs(),]
});