import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="auth-shell" aria-label="PlayLearn 角色选择">
      <section className="card auth-card">
        <div className="auth-header">
          <span className="brand-mark">P</span>
          <h1>PlayLearn</h1>
          <p>玩就是学 · 一起去摘星星吧</p>
        </div>
        <div className="role-grid">
          <Link href="/theme-map" className="card card-hover role-card">
            <span className="role-emoji" aria-hidden="true">⭐</span>
            <h2>我是小朋友</h2>
            <p>选择头像，开始今天的学习冒险</p>
            <span className="button button-block button-small">进入学习</span>
          </Link>
          <Link href="/login" className="card card-hover role-card">
            <span className="role-emoji" aria-hidden="true">👨‍👩‍👧</span>
            <h2>我是家长</h2>
            <p>查看周报，了解孩子的学习成长</p>
            <span className="button button-secondary button-block button-small">家长入口</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

