import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import compress from 'astro-compress';
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import react from "@astrojs/react";
import vercel from 'astro-vercel-edge';

// import { astroImageTools } from "astro-imagetools";

// https://astro.build/config
export default defineConfig({
  experimental: {
    // viewTransitions: true,
    optimizeHoistedScript: true
  },
  output: 'server',
  adapter: vercel(
    imageService: true,
    imagesConfig: {
      sizes: [320, 640, 1280],
    },
    {
    analytics: true,
  }),
  integrations: [tailwind(), 
    compress({
			CSS: true,
			HTML: true,
			Image: true,
			JavaScript: true,
			SVG: true,
		}), 
    sitemap(), 
    robotsTxt(), 
    react()]
});

 