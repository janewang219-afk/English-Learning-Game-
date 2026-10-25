'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const [email, setEmail] = useState('parent@example.com');
  const [password, setPassword] = useState('playlearn');
  const [displayName, setDisplayName] = useState('家长');
  const [error, setError] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.includes('@')) { setError('请输入有效的邮箱地址'); return; }
    if (password.length < 6) { setError('密码至少需要 6 位'); return; }
    if (mode === 'register' && !displayName.trim()) { setError('请输入称呼'); return; }
    window.localStorage.setItem('playlearn-demo-auth', JSON.stringify({ email, displayName, signedInAt: new Date().toISOString() }));
    router.push('/reports');
  };

  return (
    <main className="auth-shell" aria-label={mode === 'login' ? '家长登录' : '家长注册'}>
      <section className="card auth-card">
        <div className="auth-header"><span className="brand-mark">P</span><h1>{mode === 'login' ? '家长登录' : '创建家长账号'}</h1><p>{mode === 'login' ? '登录后查看孩子的学习周报' : '为孩子创建一个安全的学习空间'}</p></div>
        <form className="auth-form" onSubmit={submit}>
          {mode === 'register' ? <div className="field"><label htmlFor="displayName">怎么称呼你</label><input id="displayName" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" /></div> : null}
          <div className="field"><label htmlFor="email">邮箱</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></div>
          <div className="field"><label htmlFor="password">密码</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></div>
          {error ? <p className="feedback-banner error" role="alert">{error}</p> : null}
          <button type="submit" className="button button-block">{mode === 'login' ? '登录' : '注册并开始'}</button>
        </form>
        <p className="auth-footer">{mode === 'login' ? <>还没有账号？<Link href="/register">立即注册</Link></> : <>已有账号？<Link href="/login">返回登录</Link></>}</p>
        <p className="auth-footer" style={{ marginTop: 9, fontSize: 11 }}>当前为前端演示模式，不会提交真实账号信息。</p>
      </section>
    </main>
  );
}
