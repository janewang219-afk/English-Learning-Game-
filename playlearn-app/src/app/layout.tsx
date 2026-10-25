import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { PlayLearnProvider } from '@/components/shared/PlayLearnStore';

export const metadata: Metadata = {
  title: 'PlayLearn — 玩就是学',
  description: '游戏化儿童英语学习平台 · 7-11 岁零基础英语启蒙',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FF8B8B',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <PlayLearnProvider>{children}</PlayLearnProvider>
      </body>
    </html>
  );
}
