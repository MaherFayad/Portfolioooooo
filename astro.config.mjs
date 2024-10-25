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
  build: {
    inlineStylesheets: 'auto', // Inline small stylesheets
    minify: true,
    // Removed format option to use default 'directory' setting
    assets: 'assets'
  },
  vite: {
    build: {
      cssMinify: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'alpine': ['alpinejs'],
            'emailjs': ['emailjs-com', '@emailjs/browser']
          }
        }
      }
    },
    ssr: {
      noExternal: ['@fontsource/inter']
    }
  },
  integrations: [
    tailwind({
      // Minify CSS in production
      minify: true,
    }),
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
      svg: true,
      logger: 1
    }),
    compressor()
  ],
});
