import { unified } from '@astrojs/markdown-remark'
import mdx from '@astrojs/mdx'
// import partytown from '@astrojs/partytown'
import sitemap from '@astrojs/sitemap'
import Compress from 'astro-compress'
import { defineConfig } from 'astro/config'
import rehypeKatex from 'rehype-katex'
import rehypeMermaid from 'rehype-mermaid'
import rehypeSlug from 'rehype-slug'
import remarkDirective from 'remark-directive'
import remarkMath from 'remark-math'
import UnoCSS from 'unocss/astro'
import { base, defaultLocale, themeConfig } from './src/config'
import { langMap } from './src/i18n/config'
import { rehypeCodeCopyButton } from './src/plugins/rehype-code-copy-button.mjs'
import { rehypeExternalLinks } from './src/plugins/rehype-external-links.mjs'
import { rehypeHeadingAnchor } from './src/plugins/rehype-heading-anchor.mjs'
import { rehypeImageProcessor } from './src/plugins/rehype-image-processor.mjs'
import { remarkContainerDirectives } from './src/plugins/remark-container-directives.mjs'
import { remarkLeafDirectives } from './src/plugins/remark-leaf-directives.mjs'
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs'

// Configure unified processor with all plugins
const markdownProcessor = unified()
  .use(remarkDirective)
  .use(remarkMath)
  .use(remarkContainerDirectives)
  .use(remarkLeafDirectives)
  .use(remarkReadingTime)
  .use(rehypeKatex)
  .use(rehypeMermaid, { strategy: 'pre-mermaid' })
  .use(rehypeSlug)
  .use(rehypeHeadingAnchor)
  .use(rehypeImageProcessor)
  .use(rehypeExternalLinks)
  .use(rehypeCodeCopyButton)

const { url: site } = themeConfig.site
const imageConfig = {
  image: {
    remotePatterns: [{ protocol: 'https' }],
    service: { entrypoint: 'astro/assets/services/noop' },
  },
}

export default defineConfig({
  site,
  base,
  trailingSlash: 'always', // Not recommended to change
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport', // hover, tap, viewport, load
  },
  ...imageConfig,
  i18n: {
    locales: Object.entries(langMap).map(([path, codes]) => ({
      path,
      codes: [...codes] as [string, ...string[]],
    })),
    defaultLocale,
  },
  integrations: [
    UnoCSS({
      injectReset: true,
    }),
    mdx(),
    // partytown({
    //   config: {
    //     forward: ['dataLayer.push', 'gtag'],
    //   },
    // }),
    sitemap(),
    Compress({
      CSS: true,
      HTML: true,
      Image: true,
      JavaScript: true,
      SVG: true,
    }),
  ],
  markdown: {
    processor: markdownProcessor,
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid'],
    },
    shikiConfig: {
      // Available themes: https://shiki.style/themes
      themes: {
        light: 'material-theme-lighter',
        dark: 'material-theme-darker',
      },
    },
  },
  vite: {
    plugins: [
      {
        name: 'prefix-font-urls-with-base',
        transform(code, id) {
          if (!id.split('?')[0].endsWith('src/styles/font.css')) {
            return null
          }

          return code.replace(/url\(\s*(['"]?)\/fonts\//g, `url($1${base}/fonts/`)
        },
      },
    ],
    build: {
      chunkSizeWarningLimit: 600,
    },
  },
  devToolbar: {
    enabled: false,
  },
  // For local development
  server: {
    headers: {
      'Access-Control-Allow-Origin': 'https://comment.eaverse.top',
    },
  },
})
