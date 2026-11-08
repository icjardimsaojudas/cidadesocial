// Site estático (SPA) para o GitHub Pages
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  compatibilityDate: '2025-01-01',
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || './',
    buildAssetsDir: '/arquivos/',
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'FSI · IC Jardim São Judas',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Programa Família Saudável Integral · Cidade Social · Igreja da Cidade Jardim São Judas' },
        { name: 'theme-color', content: '#F66300' },
        { name: 'robots', content: 'noindex' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: 'logo.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap' }
      ]
    }
  },
  router: { options: { hashMode: true } },
  css: ['~/assets/main.css']
})
