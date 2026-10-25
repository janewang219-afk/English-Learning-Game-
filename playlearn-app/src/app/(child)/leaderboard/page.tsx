'use client';

import { ChildScreen } from '@/components/shared/AppShell';
import { usePlayLearnStore } from '@/components/shared/PlayLearnStore';
import { useLeaderboard } from '@/hooks/use-leaderboard';

export default function LeaderboardPage() {
  const { currentProfile } = usePlayLearnStore();
  const { entries } = useLeaderboard();
  const first = entries.find((entry) => entry.rank === 1) ?? entries[0];
  const second = entries.find((entry) => entry.rank === 2) ?? entries[1];
  const third = entries.find((entry) => entry.rank === 3) ?? entries[2];
  const rest = entries.filter((entry) => (entry.rank ?? 0) > 3);

  return (
    <ChildScreen>
      <h1 className="leaderboard-title">本周排行榜</h1>

      <section className="podium" aria-label="排行榜前三名">
        {[second, first, third].filter(Boolean).map((entry) => (
          <div key={entry.childProfileId} className={`podium-person${entry.rank === 1 ? ' first' : ''}`}>
            <div className="podium-avatar" aria-hidden="true">{entry.avatar}</div>
            <div className="podium-copy"><strong>{entry.nickname}</strong><span>{entry.weeklyPoints.toLocaleString('en-US')}</span></div>
            <div className="podium-block">{entry.rank}</div>
          </div>
        ))}
      </section>

      <section className="ranking-list" aria-label="排行榜列表">
        {rest.map((entry) => (
          <div key={entry.childProfileId} className="card ranking-row">
            <span className="rank-number">{entry.rank}</span>
            <span className="rank-avatar" aria-hidden="true">{entry.avatar}</span>
            <span className="rank-name">{entry.nickname}</span>
            <span className="rank-points">{entry.weeklyPoints.toLocaleString('en-US')}</span>
          </div>
        ))}
      </section>

      <section className="card ranking-row self-rank" aria-label="我的排名">
        <span className="rank-number" style={{ color: 'var(--play-primary)' }}>12</span>
        <span className="rank-avatar" aria-hidden="true">{currentProfile.avatar}</span>
        <span className="rank-name">{currentProfile.nickname}<small className="muted" style={{ display: 'block', fontSize: 11 }}>我</small></span>
        <span className="rank-points">{currentProfile.totalPoints.toLocaleString('en-US')}</span>
      </section>
    </ChildScreen>
  );
}
