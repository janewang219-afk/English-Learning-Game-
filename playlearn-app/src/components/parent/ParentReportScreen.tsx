'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePlayLearnStore } from '@/components/shared/PlayLearnStore';
import { ParentScreen } from '@/components/shared/AppShell';
import Icon from '@/components/shared/Icon';
import { submitFeedbackRequest } from '@/lib/api';

export default function ParentReportScreen() {
  const { profiles, currentChildId, selectChild, getReport, submitFeedback } = usePlayLearnStore();
  const report = getReport();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const content = message.trim();
    if (!content) return;
    const delivered = await submitFeedbackRequest({ childProfileId: currentChildId, message: content });
    if (!delivered) submitFeedback(content);
    setMessage('');
    setFeedbackOpen(false);
    setSent(true);
    window.setTimeout(() => setSent(false), 2400);
  };

  return (
    <ParentScreen title="家长周报" backHref="/profile" actionHref="/settings" actionLabel="设置">
      <h1 className="leaderboard-title">家长周报</h1>

      <section className="parent-child-switcher" aria-label="选择儿童档案">
        {profiles.map((profile) => (
          <button key={profile.id} type="button" className={`switcher-button${currentChildId === profile.id ? ' is-active' : ''}`} onClick={() => selectChild(profile.id)}>
            {profile.nickname}
          </button>
        ))}
      </section>

      <section className="parent-stats">
        <div className="card stat-card"><p className="stat-value">{report.completedLevels}/{report.totalLevels}</p><p className="stat-label">本周完成关卡</p></div>
        <div className="card stat-card"><p className="stat-value">{report.weeklyMinutes}</p><p className="stat-label">学习时长（分钟）</p></div>
        <div className="card stat-card"><p className="stat-value primary">{report.masteryRate}%</p><p className="stat-label">词汇掌握率</p></div>
        <div className="card stat-card"><p className="stat-value">{report.streakDays} 天</p><p className="stat-label">连续学习</p></div>
      </section>

      <section className="card bar-chart-card">
        <h2 className="section-title">主题掌握度</h2>
        <div className="bar-list">
          {report.themes.map((theme, index) => {
            const color = theme.mastery < 50 ? 'error' : index === 1 ? 'info' : index === 2 ? 'warning' : '';
            return (
              <Link key={theme.id} href={`/detail/${theme.id}`} className="bar-row">
                <div className="bar-row-head"><span>{theme.name}</span><strong style={{ color: theme.mastery < 50 ? 'var(--play-error)' : undefined }}>{theme.mastery}%</strong></div>
                <div className="bar-track"><div className={`bar-fill ${color}`} style={{ width: `${theme.mastery}%` }} /></div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="weak-alert">
        <Icon name="alert-circle" size={20} />
        <div><strong>弱项提醒</strong><p>{report.weakPoint.theme}掌握度仅 {report.weakPoint.mastery}%，{report.weakPoint.recommendation}</p></div>
      </section>

      <button type="button" className="button button-secondary button-block feedback-button" onClick={() => setFeedbackOpen(true)}>
        <Icon name="message-square" size={17} />内容反馈
      </button>

      {feedbackOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFeedbackOpen(false); }}>
          <section className="modal card" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
            <div className="modal-header"><h2 id="feedback-title">内容反馈</h2><button type="button" className="modal-close" onClick={() => setFeedbackOpen(false)} aria-label="关闭"><Icon name="x" size={19} /></button></div>
            <div className="modal-body"><div className="field"><label htmlFor="feedback-message">请告诉我们哪里可以更好</label><textarea id="feedback-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="例如：某个单词的音频听不清楚" /></div></div>
            <div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setFeedbackOpen(false)}>取消</button><button type="button" className="button" onClick={submit} disabled={!message.trim()}>提交反馈</button></div>
          </section>
        </div>
      ) : null}
      {sent ? <div className="toast" role="status">感谢反馈，我们会尽快处理。</div> : null}
    </ParentScreen>
  );
}
