// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    define: {
      'process.env.PUBLIC_CLOUDINARY_CLOUD_NAME': 
        JSON.stringify(process.env.PUBLIC_CLOUDINARY_CLOUD_NAME),
      'process.env.PUBLIC_CLOUDINARY_PRESET': 
        JSON.stringify(process.env.PUBLIC_CLOUDINARY_PRESET),
    },
  },
});
