import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServer: {
    host: "0.0.0.0",
  },

  vite: {
    plugins: [tailwindcss()],
  },

  compatibilityDate: "2025-07-15",
  css: [
    "/assets/styles/global.scss",
    "/assets/styles/variables.scss",
    "/assets/styles/tailwind.css",
  ],
  devtools: { enabled: true },
  modules: ["@nuxtjs/supabase", "@pinia/nuxt"],

  // 全局 head 配置
  app: {
    head: {
      title: "PixelFlow",
      titleTemplate: "%s | PixelFlow",
      link: [{ rel: "icon", type: "image/svg+xml", href: "/logo.svg" }],
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },

  // Supabase 配置
  supabase: {
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      include: undefined,
      exclude: ["/*"], // 暂时排除所有页面的重定向
      saveRedirectToCookie: false,
    },
  },

  // Vercel 部署配置
  nitro: {
    preset: "vercel",
  },

  // 运行时配置
  runtimeConfig: {
    // 服务端私有配置
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
    public: {
      // 客户端公开配置
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    },
  },
});
