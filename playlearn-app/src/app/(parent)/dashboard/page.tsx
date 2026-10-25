/**
 * 家长端首页 /dashboard — 默认重定向到报告概览。
 * PRD §8：家长管理端入口
 */
import { redirect } from 'next/navigation';

export default function ParentDashboardPage() {
  redirect('/reports');
}
