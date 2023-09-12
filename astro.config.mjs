import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import react from "@astrojs/react";
import compress from "astro-compress";
import partytown from '@astrojs/partytown';
import purgecss from "astro-purgecss";

// https://astro.build/config
export default defineConfig({
  experimental: {
    optimizeHoistedScript: true
  },
  integrations: [tailwind(), sitemap(), robotsTxt(), react(), purgecss(), partytown()]
});