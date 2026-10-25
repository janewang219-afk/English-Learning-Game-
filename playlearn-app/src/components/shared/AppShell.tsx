'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { formatPoints } from '@/lib/demo-data';
import { usePlayLearnStore } from './PlayLearnStore';
import Icon, { type IconName } from './Icon';

const childNavItems: Array<{ href: string; label: string; icon: IconName; key: string }> = [
  { href: '/theme-map', label: '地图', icon: 'map', key: 'map' },
  { href: '/achievements', label: '成就', icon: 'medal', key: 'achievements' },
  { href: '/leaderboard', label: '排行', icon: 'trophy', key: 'leaderboard' },
  { href: '/profile', label: '我的', icon: 'user', key: 'profile' },
];

function getActiveKey(pathname: string) {
  if (pathname.startsWith('/achievements')) return 'achievements';
  if (pathname.startsWith('/leaderboard')) return 'leaderboard';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'map';
}

export function ChildBrandBar() {
  const { currentProfile } = usePlayLearnStore();
  return (
    <header className="brand-bar" data-dom-id="child-brand-bar">
      <Link href="/theme-map" className="brand-lockup" aria-label="返回学习地图">
        <span className="brand-mark">P</span>
        <span className="brand-name">PlayLearn</span>
      </Link>
      <div className="points-pill" aria-label={`当前积分 ${formatPoints(currentProfile.totalPoints)}`}>
        <Icon name="star" size={14} filled />
        <span>{formatPoints(currentProfile.totalPoints)}</span>
      </div>
    </header>
  );
}

export function ChildBottomNav() {
  const pathname = usePathname();
  const activeKey = getActiveKey(pathname);
  return (
    <nav className="mobile-nav" data-mobile-nav="global" aria-label="儿童端主导航">
      <div className="mobile-nav-inner">
        {childNavItems.map((item) => {
          const active = activeKey === item.key;
          return (
            <Link
              key={item.key}
              href={item.href}
              data-nav-key={item.key}
              data-dom-id={`nav-${item.key}`}
              aria-current={active ? 'page' : undefined}
              className={`mobile-nav-item${active ? ' is-active' : ''}`}
            >
              <Icon name={item.icon} size={20} filled={active && item.icon === 'star'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function ChildScreen({ children, navigation = true, className = '' }: { children: ReactNode; navigation?: boolean; className?: string }) {
  return (
    <div className={`app-shell child-shell${navigation ? ' has-bottom-nav' : ''}`}>
      <ChildBrandBar />
      <main className={`page-container child-content ${className}`}>{children}</main>
      {navigation ? <ChildBottomNav /> : null}
    </div>
  );
}

export function ParentBrandBar({ title, backHref = '/profile', actionHref = '/settings', actionLabel = '设置' }: { title: string; backHref?: string; actionHref?: string; actionLabel?: string }) {
  return (
    <header className="brand-bar parent-brand-bar" data-dom-id="parent-brand-bar">
      <div className="parent-brand-left">
        <Link href={backHref} className="icon-button back-button" aria-label="返回" data-dom-id="back-profile">
          <Icon name="arrow-left" size={20} />
        </Link>
        <Link href="/profile" className="brand-lockup" aria-label="返回我的页面">
          <span className="brand-mark">P</span>
          <span className="brand-name">PlayLearn</span>
        </Link>
      </div>
      <Link href={actionHref} className="header-action" aria-label={actionLabel} data-dom-id={actionLabel === '设置' ? 'link-parent-settings' : 'link-parent-report'}>
        {actionLabel === '设置' ? <Icon name="settings" size={20} /> : <><Icon name="file-text" size={17} /><span>{actionLabel}</span></>}
      </Link>
      <span className="parent-title">{title}</span>
    </header>
  );
}

export function ParentScreen({ children, title, backHref, actionHref, actionLabel = '设置', className = '' }: { children: ReactNode; title: string; backHref?: string; actionHref?: string; actionLabel?: string; className?: string }) {
  return (
    <div className="app-shell parent-shell">
      <ParentBrandBar title={title} backHref={backHref} actionHref={actionHref} actionLabel={actionLabel} />
      <main className={`page-container parent-content ${className}`}>{children}</main>
    </div>
  );
}

export function SectionTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`section-title ${className}`}>{children}</h2>;
}
