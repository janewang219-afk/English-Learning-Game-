'use client';

import { useRouter } from 'next/navigation';
import { DEMO_LEVELS, getLevelItems, getTheme } from '@/lib/demo-data';
import { usePlayLearnStore } from '@/components/shared/PlayLearnStore';
import { ChildScreen } from '@/components/shared/AppShell';
import Icon from '@/components/shared/Icon';

export default function LevelViewPage({ params }: { params: { levelId: string } }) {
  const router = useRouter();
  const { currentProfile, startSession } = usePlayLearnStore();
  const level = DEMO_LEVELS.find((entry) => entry.id === params.levelId);
  const currentLevel = DEMO_LEVELS.find((entry) => entry.id === currentProfile.currentLevelId);
  const theme = level ? getTheme(level.themeId) : null;
  const items = level ? getLevelItems(level) : [];
  const isUnlocked = Boolean(level && theme?.status === 'active' && currentLevel && level.order <= currentLevel.order);

  if (!level || !theme) {
    return (
      <ChildScreen>
        <section className="card time-lock-card"><Icon name="info" size={40} className="muted" /><h1>找不到这个关卡</h1><p>返回地图，选择一个学习关卡吧。</p><button type="button" className="button button-block" style={{ marginTop: 22 }} onClick={() => router.push('/theme-map')}>返回学习地图</button></section>
      </ChildScreen>
    );
  }

  if (!isUnlocked) {
    return (
      <ChildScreen>
        <section className="back-title" data-dom-id="back-theme-map"><button type="button" className="icon-button card" onClick={() => router.push('/theme-map')} aria-label="返回学习地图"><Icon name="arrow-left" size={20} /></button><h1>关卡 {level.order} · {theme.name}</h1></section>
        <section className="card time-lock-card"><Icon name="lock" size={40} className="muted" /><h1>这个关卡还没解锁</h1><p>先完成前面的学习任务，就能继续探索啦！</p><button type="button" className="button button-block" style={{ marginTop: 22 }} onClick={() => router.push('/theme-map')}>返回学习地图</button></section>
      </ChildScreen>
    );
  }

  const start = () => {
    const session = startSession(level.id);
    router.push(`/game/${level.gameTypes[0]}?levelId=${encodeURIComponent(level.id)}&sessionId=${encodeURIComponent(session.id)}`);
  };

  return (
    <ChildScreen>
      <section className="back-title" data-dom-id="back-theme-map">
        <button type="button" className="icon-button card" onClick={() => router.push('/theme-map')} aria-label="返回学习地图">
          <Icon name="arrow-left" size={20} />
        </button>
        <h1>关卡 {level.order} · {theme.name}</h1>
      </section>

      <section className="card level-hero">
        <div className="level-emoji" aria-hidden="true">{level.emoji}</div>
        <h2>{level.title}</h2>
        <p>{level.description}</p>
        <div className="level-meta">
          <span><Icon name="clock" size={16} />约 {level.durationMin} 分钟</span>
          <span><Icon name="target" size={16} />{items.length} 个单词</span>
        </div>
      </section>

      <section className="page-section-lg">
        <h2 className="section-title">本关学习目标</h2>
        <div className="goal-grid">
          {items.map((item) => (
            <div key={item.id} className="card goal-card">
              <span className="goal-emoji" aria-hidden="true">{item.emoji}</span>
              <strong>{item.word}</strong>
              <small>{item.phonetic}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="page-section-lg">
        <button type="button" className="button button-block" onClick={start} data-dom-id="cta-game-listen-pick">开始闯关</button>
      </section>
    </ChildScreen>
  );
}
