import { defineConfig } from "@solidjs/start/config";
import UnoCSS from "unocss/vite";
import presetWind4 from "@unocss/preset-wind4";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      UnoCSS({
        presets: [presetWind4()]
      })
    ]
  }
});
