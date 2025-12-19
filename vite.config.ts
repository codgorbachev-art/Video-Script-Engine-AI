
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Загружаем переменные окружения из системного процесса (Vercel)
  // Casting process to any to avoid "Property 'cwd' does not exist on type 'Process'" TS error
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    define: {
      // Подменяем обращение к process.env.API_KEY на реальное значение ключа
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY),
      // Создаем объект process.env для совместимости в браузере
      'process.env': {
        API_KEY: env.API_KEY || process.env.API_KEY
      }
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: './index.html'
        }
      }
    }
  };
});
