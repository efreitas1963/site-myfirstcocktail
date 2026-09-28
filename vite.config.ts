import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * IMPORTANTE:
 * O valor de FOLDER_NAME deve ser EXATAMENTE o nome da pasta em C:\xampp\htdocs\
 */
const FOLDER_NAME = "mycocktail";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,

    // Permitir acesso via domínio (Cloudflare Tunnel)
    allowedHosts: ["myfirstcocktail.com.br", "www.myfirstcocktail.com.br"],

    proxy: {
      // Redireciona chamadas para o PHP no Apache (XAMPP)
      "/api.php": {
        target: `http://127.0.0.1/${FOLDER_NAME}/`,
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: `http://127.0.0.1/${FOLDER_NAME}/`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
