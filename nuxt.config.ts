import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  compatibilityDate: "2026-09-06",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  alias: {
    "#domain": join(root, "domain"),
  },
  runtimeConfig: {
    public: {
      gaMeasurementId: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || "",
    },
  },
  app: {
    head: {
      title: "Waktu Sembahyang Brunei",
      htmlAttrs: { lang: "ms" },
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500&family=Source+Sans+3:wght@400;600&display=swap",
        },
        { rel: "manifest", href: "/manifest.webmanifest" },
      ],
      script: [
        {
          src: "https://www.googletagmanager.com/gtag/js",
          async: true,
          ...(() => {
            const id = process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID;
            return id ? { "data-id": id } : {};
          })(),
        },
      ],
    },
  },
  typescript: {
    strict: true,
  },
  ignore: ["src/**", "website/**", "graphify-out/**", "legacy/**"],
});
