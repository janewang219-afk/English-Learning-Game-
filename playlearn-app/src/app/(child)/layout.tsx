/**
 * 儿童端共享布局（Route Group: (child)）。
 *
 * 不影响 URL，仅为儿童学习端提供通用 shell（防沉迷顶栏、退出按钮等）。
 * PRD §8：儿童端不接触任何个人信息输入界面，隐私即架构。
 *
 * 实际 shell 实现待业务开发阶段完成。
 */
export default function ChildLayout({ children }: { children: React.ReactNode }) {
  return <section aria-label="儿童学习端">{children}</section>;
}
