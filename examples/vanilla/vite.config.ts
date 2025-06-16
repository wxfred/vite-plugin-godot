import { defineConfig } from 'vite';
import godotPlugin from 'vite-plugin-godot';

export default defineConfig({
  plugins: [
    godotPlugin({
      projectName: 'godot/example2d',
      reload: ['src/main.js'],
    }),
  ],
});
