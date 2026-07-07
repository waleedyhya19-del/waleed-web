import type { LucideIcon } from 'lucide-react';
import {
  BellRing,
  FileText,
  Gauge,
  Info,
  Megaphone,
  Phone,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Users,
  UserSquare,
  UserCircle,
} from 'lucide-react';
import type { Role } from '@/lib/api/types';

export interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

export interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  roles: Role[];
}

export const portalNav: NavGroup[] = [
  {
    labelKey: 'nav.overview',
    items: [
      {
        href: '/portal',
        labelKey: 'nav.overview',
        icon: Gauge,
        roles: ['END_USER'],
      },
      {
        href: '/portal/reports',
        labelKey: 'nav.myReports',
        icon: FileText,
        roles: ['END_USER'],
      },
      {
        href: '/portal/serial-lookup',
        labelKey: 'nav.serialLookup',
        icon: Search,
        roles: ['END_USER'],
      },
    ],
  },
  {
    labelKey: 'nav.settings',
    items: [
      {
        href: '/portal/notifications',
        labelKey: 'nav.notifications',
        icon: BellRing,
        roles: ['END_USER'],
      },
      {
        href: '/portal/announcements',
        labelKey: 'nav.announcements',
        icon: Megaphone,
        roles: ['END_USER'],
      },
      {
        href: '/portal/contact',
        labelKey: 'nav.contact',
        icon: Phone,
        roles: ['END_USER'],
      },
      {
        href: '/portal/profile',
        labelKey: 'nav.profile',
        icon: UserCircle,
        roles: ['END_USER'],
      },
    ],
  },
];

export const staffNav: NavGroup[] = [
  {
    labelKey: 'nav.overview',
    items: [
      {
        href: '/staff',
        labelKey: 'nav.overview',
        icon: Gauge,
        roles: ['MODERATOR', 'ADMIN', 'LAWYER'],
      },
      {
        href: '/staff/reports',
        labelKey: 'nav.reports',
        icon: FileText,
        roles: ['MODERATOR', 'ADMIN', 'LAWYER'],
      },
      {
        href: '/staff/serial-lookup',
        labelKey: 'nav.serialLookup',
        icon: Search,
        roles: ['MODERATOR', 'ADMIN', 'LAWYER'],
      },
    ],
  },
  {
    labelKey: 'nav.users',
    items: [
      {
        href: '/staff/users',
        labelKey: 'nav.users',
        icon: Users,
        roles: ['MODERATOR', 'ADMIN'],
      },
      {
        href: '/staff/moderators',
        labelKey: 'nav.moderators',
        icon: ShieldCheck,
        roles: ['ADMIN'],
      },
      {
        href: '/staff/lawyers',
        labelKey: 'nav.lawyers',
        icon: Scale,
        roles: ['ADMIN'],
      },
    ],
  },
  {
    labelKey: 'nav.settings',
    items: [
      {
        href: '/staff/announcements',
        labelKey: 'nav.announcements',
        icon: Megaphone,
        roles: ['MODERATOR', 'ADMIN', 'LAWYER'],
      },
      {
        href: '/staff/contact-info',
        labelKey: 'nav.contactInfo',
        icon: Info,
        roles: ['MODERATOR', 'ADMIN', 'LAWYER'],
      },
      {
        href: '/staff/notifications',
        labelKey: 'nav.notifications',
        icon: BellRing,
        roles: ['MODERATOR', 'ADMIN', 'LAWYER'],
      },
      {
        href: '/staff/settings',
        labelKey: 'nav.settings',
        icon: Settings,
        roles: ['MODERATOR', 'ADMIN', 'LAWYER'],
      },
      {
        href: '/staff/profile',
        labelKey: 'nav.profile',
        icon: UserSquare,
        roles: ['MODERATOR', 'ADMIN', 'LAWYER'],
      },
    ],
  },
];

export function filterNavByRole(groups: NavGroup[], role: Role): NavGroup[] {
  return groups
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => i.roles.includes(role)),
    }))
    .filter((g) => g.items.length > 0);
}
