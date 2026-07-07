'use client';

import { useTranslations } from 'next-intl';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSessionStore } from '@/stores/session-store';
import { logoutAndReset } from '@/lib/auth/login-flow';
import { useRouter } from '@/lib/i18n/routing';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { roleKey } from '@/lib/i18n/enums';

export function UserMenu() {
  const t = useTranslations();
  const user = useSessionStore((s) => s.user);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  if (!user) return null;

  const initials = user.displayName
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const onSignOut = async () => {
    await logoutAndReset();
    router.replace('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar>
            {user.profilePhotoUrl && (
              <AvatarImage src={user.profilePhotoUrl} alt={user.displayName} />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{user.displayName}</span>
            <span className="text-xs text-muted-foreground">
              {user.email ?? user.phone ?? ''}
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              {t(roleKey(user.role))}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() =>
            setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')
          }
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {t('common.toggleTheme')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onSignOut}>
          <LogOut className="h-4 w-4 rtl:-scale-x-100" />
          {t('common.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
