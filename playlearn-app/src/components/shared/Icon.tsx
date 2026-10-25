'use client';

import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  Clock,
  FileText,
  Heart,
  Info,
  Lightbulb,
  Lock,
  Map,
  Medal,
  MessageSquare,
  Mic,
  Minus,
  Plus,
  Settings,
  Share2,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  User,
  Volume2,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { SVGProps } from 'react';

export type IconName =
  | 'alert-circle'
  | 'arrow-left'
  | 'bell'
  | 'check'
  | 'chevron-right'
  | 'clock'
  | 'file-text'
  | 'heart'
  | 'info'
  | 'lightbulb'
  | 'lock'
  | 'map'
  | 'medal'
  | 'message-square'
  | 'mic'
  | 'minus'
  | 'plus'
  | 'settings'
  | 'share-2'
  | 'shield-check'
  | 'star'
  | 'target'
  | 'trophy'
  | 'user'
  | 'volume-2'
  | 'x';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
  filled?: boolean;
}

const icons: Record<IconName, LucideIcon> = {
  'alert-circle': AlertCircle,
  'arrow-left': ArrowLeft,
  bell: Bell,
  check: Check,
  'chevron-right': ChevronRight,
  clock: Clock,
  'file-text': FileText,
  heart: Heart,
  info: Info,
  lightbulb: Lightbulb,
  lock: Lock,
  map: Map,
  medal: Medal,
  'message-square': MessageSquare,
  mic: Mic,
  minus: Minus,
  plus: Plus,
  settings: Settings,
  'share-2': Share2,
  'shield-check': ShieldCheck,
  star: Star,
  target: Target,
  trophy: Trophy,
  user: User,
  'volume-2': Volume2,
  x: X,
};

export default function Icon({ name, size = 20, filled = false, strokeWidth = 1.9, ...props }: IconProps) {
  const shouldFill = filled || name === 'star' || name === 'heart';
  const Component = icons[name];
  return <Component aria-hidden="true" focusable="false" size={size} strokeWidth={strokeWidth} fill={shouldFill ? 'currentColor' : 'none'} {...props} />;
}
