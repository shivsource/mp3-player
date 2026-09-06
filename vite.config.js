import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = parseInt(env.PORT || env.VITE_PORT || '3100', 10);

  return {
    plugins: [react()],
    server: {
      port: port,
      open: false,
    },
    preview: {
      port: port,
    },
  };
});
