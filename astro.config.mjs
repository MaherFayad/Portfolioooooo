import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import compress from 'astro-compress';
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import react from "@astrojs/react";
import compressor from "astro-compressor";

export default defineConfig({
  experimental: {
    optimizeHoistedScript: true
  },
  integrations: [tailwind(), compress({
    CSS: true,
    HTML: true,
    Image: true,
    JavaScript: true,
    SVG: true
  }), sitemap(), robotsTxt(), react(), compressor()]
});