import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'plugin-inspect-react-code'
import { glyphCachePlugin } from "./src/plugins/glyphCache"

// https://vite.dev/config/
export default defineConfig({
  base: '/hanzi-ancestry/',
  plugins: [inspectAttr(), react(), glyphCachePlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const p = id.replace(/\\/g, '/');
          if (!p.includes('/node_modules/')) return undefined;
          if (/\/node_modules\/(d3|d3-[a-z-]+|internmap|delaunator|robust-predicates)\//.test(p)) return 'd3';
          if (p.includes('framer-motion')) return 'framer';
          if (p.includes('@radix-ui')) return 'radix';
          if (p.includes('lucide-react')) return 'icons';
          if (/\/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler|@remix-run|cookie|clsx|tailwind-merge|class-variance-authority)\//.test(p)) return 'react-vendor';
          return undefined;
        },
      },
    },
  },
  server: {
    port: 3000,
    // Proxy GlyphWiki requests for regular script SVG fallback.
    // Proxy 小学堂 (Taiwan Academia Sinica) for ancient script glyphs.
    proxy: {
      '/api/glyphwiki': {
        target: 'https://glyphwiki.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/glyphwiki/, ''),
      },
      '/api/xiaoxue': {
        target: 'https://xiaoxue.iis.sinica.edu.tw',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/xiaoxue/, ''),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
