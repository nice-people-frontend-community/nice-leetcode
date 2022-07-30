import { fileURLToPath, URL } from 'url';

import Inspect from 'vite-plugin-inspect';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Inspect(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
        {
          axios: [['default', 'axios'], 'AxiosError'],
          dayjs: [['default', 'dayjs']],
        },
      ],
      resolvers: [ElementPlusResolver()],
      dts: './auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      },
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      include: [/\.vue/],
      dirs: 'src/components',
      dts: 'components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  base: process.env.NODE_ENV === 'production' ? '/nice-leetcode/docs' : '/',
  build: {
    outDir: 'docs',
    reportCompressedSize: false,
  },
});
