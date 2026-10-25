'use client';

import { ChildScreen } from '@/components/shared/AppShell';
import { usePlayLearnStore } from '@/components/shared/PlayLearnStore';
import Icon from '@/components/shared/Icon';

export default function AchievementsPage() {
  const { currentProfile, badges } = usePlayLearnStore();
  return (
    <ChildScreen>
      <section className="card achievement-summary" data-dom-id="achievement-summary">
        <div className="achievement-header">
          <div className="achievement-icon" aria-hidden="true">🏅</div>
          <div>
            <h1>Lv.5 小探险家</h1>
            <p>再获得 250 分升级</p>
          </div>
        </div>
        <div className="achievement-stats">
          <div className="achievement-stat"><strong>{currentProfile.totalPoints.toLocaleString('en-US')}</strong><span>总积分</span></div>
          <div className="achievement-stat"><strong style={{ color: 'var(--play-primary)' }}>{currentProfile.streakDays} 天</strong><span>连续学习</span></div>
        </div>
      </section>

      <section className="page-section-lg">
        <h2 className="section-title">成就勋章</h2>
        <div className="badge-grid">
          {badges.map((badge) => (
            <div key={badge.id} className={`card badge-card${badge.earnedAt ? '' : ' is-locked'}`} title={badge.description}>
              {badge.earnedAt ? <span className="badge-emoji" aria-hidden="true">{badge.icon}</span> : <Icon name="lock" size={24} />}
              {badge.earnedAt ? <span className="badge-date">{badge.earnedAt}</span> : null}
            </div>
          ))}
        </div>
      </section>
    </ChildScreen>
  );
}

