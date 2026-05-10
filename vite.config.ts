import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'plugin-inspect-react-code'
import { glyphCachePlugin } from "./src/plugins/glyphCache"

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react(), glyphCachePlugin()],
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
