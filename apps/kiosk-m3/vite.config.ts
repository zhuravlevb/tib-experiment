import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' — чтобы сборка работала из подпапки на GitHub Pages
export default defineConfig({ base: './', plugins: [react()] });
