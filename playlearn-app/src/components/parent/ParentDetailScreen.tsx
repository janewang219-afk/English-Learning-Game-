'use client';

import Link from 'next/link';
import { getItem } from '@/lib/demo-data';
import { usePlayLearnStore } from '@/components/shared/PlayLearnStore';
import { ParentScreen } from '@/components/shared/AppShell';

export default function ParentDetailScreen({ section }: { section: string }) {
  const { getReport } = usePlayLearnStore();
  const report = getReport();
  const theme = report.themes.find((entry) => entry.id === section) ?? report.themes[3];
  const weakItems = ['cat', 'rabbit', 'bird'].map(getItem);

  return (
    <ParentScreen title="学习详情" backHref="/reports" actionHref="/settings" actionLabel="设置">
      <section className="back-title"><Link href="/reports" className="icon-button card" aria-label="返回周报">←</Link><h1>{theme.name} · 学习详情</h1></section>
      <section className="card level-hero" style={{ textAlign: 'left' }}>
        <p className="eyebrow">当前主题掌握度</p>
        <h2 style={{ marginTop: 7, fontSize: 34, color: theme.mastery < 50 ? 'var(--play-error)' : 'var(--play-primary)' }}>{theme.mastery}%</h2>
        <div className="bar-track" style={{ marginTop: 14 }}><div className={`bar-fill${theme.mastery < 50 ? ' error' : ''}`} style={{ width: `${theme.mastery}%` }} /></div>
      </section>
      <section className="page-section-lg">
        <h2 className="section-title">建议复习词汇</h2>
        <div className="goal-grid">
          {weakItems.map((item) => <div key={item.id} className="card goal-card"><span className="goal-emoji">{item.emoji}</span><strong>{item.word}</strong><small>{item.phonetic}</small></div>)}
        </div>
      </section>
      <section className="weak-alert" style={{ marginTop: 28 }}><div><strong>学习建议</strong><p>{report.weakPoint.recommendation}</p></div></section>
    </ParentScreen>
  );
}

