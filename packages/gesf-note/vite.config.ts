import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        // icon: 'https://vitejs.dev/logo.svg',
        author: '沉冰浮水',
        description: '收集各种作品信息发送至 GitHub Issues',
        match: ['https://www.bilibili.com/video/*'],
        namespace: 'com.wdssmq.gesf-note',
      },
    }),
  ],
});
