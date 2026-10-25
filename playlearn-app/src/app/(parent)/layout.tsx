/**
 * 家长端共享布局（Route Group: (parent)）。
 *
 * 用于家长管理端共享的认证守卫与导航。
 * PRD §8：家长端包含报告概览页、详细分析页、设置页。
 *
 * 实际守卫实现待业务开发阶段完成。
 */
export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <section aria-label="家长管理端">{children}</section>;
}
