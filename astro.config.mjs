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
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  experimental: {
    optimizeHoistedScript: true
  },
  integrations: [tailwind(), sitemap(), robotsTxt(), react(), partytown(), svelte(), alpinejs(), compressor(), compress()],
  output: "server",
  adapter: vercel()
});