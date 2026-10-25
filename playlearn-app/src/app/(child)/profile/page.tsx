'use client';

import Link from 'next/link';
import { ChildScreen } from '@/components/shared/AppShell';
import { usePlayLearnStore } from '@/components/shared/PlayLearnStore';
import Icon, { type IconName } from '@/components/shared/Icon';

const settings = [
  { label: '账号设置', icon: 'user' as IconName, href: '/settings' },
  { label: '学习提醒', icon: 'bell' as IconName, href: '/settings' },
  { label: '家长验证', icon: 'shield-check' as IconName, href: '/reports' },
  { label: '关于我们', icon: 'info' as IconName, href: '/detail/about' },
];

export default function ProfilePage() {
  const { currentProfile } = usePlayLearnStore();
  return (
    <ChildScreen>
      <section className="card profile-card">
        <div className="profile-avatar" aria-hidden="true">{currentProfile.avatar}</div>
        <div className="profile-copy"><h1>{currentProfile.nickname}</h1><p>Lv.5 小探险家</p></div>
        <div className="profile-streak"><p className="eyebrow">已坚持</p><strong>{currentProfile.streakDays} 天</strong></div>
      </section>

      <section className="stats-grid">
        <div className="card stat-card"><p className="stat-value">{currentProfile.completedLevels}</p><p className="stat-label">已完成关卡</p></div>
        <div className="card stat-card"><p className="stat-value primary">{currentProfile.masteryRate}%</p><p className="stat-label">词汇掌握率</p></div>
        <div className="card stat-card"><p className="stat-value">{currentProfile.weeklyMinutes}</p><p className="stat-label">本周学习分钟</p></div>
        <div className="card stat-card"><p className="stat-value">{currentProfile.badgeCount}</p><p className="stat-label">获得徽章</p></div>
      </section>

      <section className="card settings-list">
        {settings.map((item) => (
            <Link key={item.label} href={item.href} className="settings-link" data-dom-id={item.label === '家长验证' ? 'link-parent-report' : undefined}>
            <span className="settings-link-copy"><span className="settings-icon"><Icon name={item.icon} size={20} /></span><span>{item.label}</span></span>
            <Icon name="chevron-right" size={20} className="muted" />
          </Link>
        ))}
      </section>
    </ChildScreen>
  );
}
