'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePlayLearnStore } from '@/components/shared/PlayLearnStore';
import { ParentScreen } from '@/components/shared/AppShell';
import Icon from '@/components/shared/Icon';

export default function ParentSettingsScreen() {
  const { profiles, currentChildId, selectChild, settings, saveSettings } = usePlayLearnStore();
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);

  const changeLimit = (delta: number) => setDraft((current) => ({ ...current, sessionTimeLimitMin: Math.max(15, Math.min(20, current.sessionTimeLimitMin + delta)) }));
  const save = () => {
    saveSettings(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <ParentScreen title="家长设置" backHref="/profile" actionHref="/reports" actionLabel="周报">
      <h1 className="leaderboard-title">家长设置</h1>

      <section className="parent-profile-grid" aria-label="切换儿童档案">
        {profiles.map((profile) => (
          <button key={profile.id} type="button" className={`card parent-profile${currentChildId === profile.id ? ' is-active' : ' is-muted'}`} onClick={() => selectChild(profile.id)}>
            <span className="small-avatar" aria-hidden="true">{profile.avatar}</span>
            <span><strong>{profile.nickname}</strong><span>{currentChildId === profile.id ? '当前' : '切换'}</span></span>
          </button>
        ))}
      </section>

      <section className="card settings-list" style={{ marginTop: 24 }}>
        <div className="setting-row">
          <div className="setting-label"><span className="settings-icon"><Icon name="clock" size={20} /></span><span>学习时长限制</span></div>
          <div className="stepper"><button type="button" onClick={() => changeLimit(-5)} aria-label="减少学习时长"><Icon name="minus" size={16} /></button><span className="stepper-value">{draft.sessionTimeLimitMin}</span><button type="button" onClick={() => changeLimit(5)} aria-label="增加学习时长"><Icon name="plus" size={16} /></button><span className="muted" style={{ fontSize: 11 }}>min</span></div>
        </div>
        <div className="setting-row">
          <div className="setting-label"><span className="settings-icon"><Icon name="trophy" size={20} /></span><span>排行榜参与</span></div>
          <button type="button" className={`toggle${draft.leaderboardOptIn ? ' is-on' : ''}`} onClick={() => setDraft((current) => ({ ...current, leaderboardOptIn: !current.leaderboardOptIn }))} aria-pressed={draft.leaderboardOptIn} aria-label="切换排行榜参与" />
        </div>
        <div className="setting-row">
          <div className="setting-label"><span className="settings-icon"><Icon name="share-2" size={20} /></span><span>成就分享授权</span></div>
          <button type="button" className={`toggle${draft.shareRequiresAuth ? ' is-on' : ''}`} onClick={() => setDraft((current) => ({ ...current, shareRequiresAuth: !current.shareRequiresAuth }))} aria-pressed={draft.shareRequiresAuth} aria-label="切换成就分享授权" />
        </div>
        <Link href="/reports" className="settings-link"><span className="settings-link-copy"><span className="settings-icon"><Icon name="message-square" size={20} /></span><span>内容反馈</span></span><Icon name="chevron-right" size={20} className="muted" /></Link>
      </section>

      <button type="button" className="button button-block" style={{ marginTop: 28 }} onClick={save}>保存</button>
      {saved ? <div className="toast" role="status">设置已保存</div> : null}
    </ParentScreen>
  );
}

