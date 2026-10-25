'use client';

import Link from 'next/link';
import { DEMO_LEVELS, formatPoints } from '@/lib/demo-data';
import { usePlayLearnStore } from '@/components/shared/PlayLearnStore';
import { ChildScreen } from '@/components/shared/AppShell';
import Icon from '@/components/shared/Icon';

export default function ThemeMapPage() {
  const { currentProfile, themes } = usePlayLearnStore();
  const activeLevel = currentProfile.currentLevelId;

  return (
    <ChildScreen>
      <section className="card greeting-card page-section" data-dom-id="greeting-card">
        <div className="greeting-main">
          <div className="greeting-avatar" aria-hidden="true">👋</div>
          <div className="greeting-copy">
            <p className="eyebrow">下午好，</p>
            <h1>{currentProfile.nickname}</h1>
          </div>
          <div className="greeting-stat">
            <p className="eyebrow">今日学习</p>
            <strong>12 分钟</strong>
          </div>
        </div>
        <div className="progress-line">
          <div className="progress-track"><div className="progress-fill" style={{ width: '60%' }} /></div>
          <span className="progress-label">3/5 关</span>
        </div>
      </section>

      <section className="page-section-lg map-path" aria-label="主题地图">
        {themes.map((theme, themeIndex) => {
          const isActive = theme.status === 'active';
          const level = DEMO_LEVELS.find((entry) => entry.id === activeLevel) ?? DEMO_LEVELS[2];
          const unlockedThrough = isActive ? level.order : 0;
          return (
            <article key={theme.id} className={`theme-node${isActive ? '' : ' is-locked'}`}>
              {isActive ? (
                <Link href={`/level/${level.id}`} className="card card-hover theme-card" data-dom-id="link-level-view">
                  <div className="theme-card-main">
                    <div className="theme-icon" aria-hidden="true">{theme.icon}</div>
                    <div className="theme-card-copy">
                      <h2>{theme.name}</h2>
                      <p>{theme.unlockHint}</p>
                    </div>
                    <div className="theme-stars" aria-label="三星评价">
                      {[0, 1, 2].map((star) => <Icon key={star} name="star" size={16} filled />)}
                    </div>
                  </div>
                  <div className="theme-levels">
                    <div className="level-bubbles" aria-label="关卡进度">
                      {Array.from({ length: 5 }, (_, index) => {
                        const unlocked = index + 1 <= unlockedThrough;
                        return <span key={index} className={`level-bubble${unlocked ? '' : ' is-locked'}`} aria-label={unlocked ? `第 ${index + 1} 关已解锁` : `第 ${index + 1} 关已锁定`}>{index + 1}</span>;
                      })}
                    </div>
                    <span className="continue-label">继续闯关 →</span>
                  </div>
                </Link>
              ) : (
                <div className="card theme-card" aria-disabled="true">
                  <div className="theme-card-main">
                    <div className="theme-icon" aria-hidden="true">{theme.icon}</div>
                    <div className="theme-card-copy">
                      <h2>{theme.name}</h2>
                      <p>{themeIndex === 1 ? '下一主题 · 解锁需 5 星' : theme.unlockHint}</p>
                    </div>
                    <Icon name="lock" size={20} className="theme-lock" />
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className="page-section tip-card">
        <Icon name="lightbulb" size={20} />
        <div>
          <strong>学习小贴士</strong>
          <p>每天坚持 15 分钟，比一次学很久效果更好哦！</p>
        </div>
      </section>

      <span className="visually-hidden">当前积分 {formatPoints(currentProfile.totalPoints)}</span>
    </ChildScreen>
  );
}
