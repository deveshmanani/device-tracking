'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from '@/components/shared/ThemeToggle';

interface HeaderProps {
  userRole: 'admin' | 'standard' | 'view_only';
  userName: string;
}

const Header = ({ userRole, userName }: HeaderProps) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Dashboard', roles: ['admin'] },
    { href: '/devices', label: 'Devices', roles: ['admin', 'standard', 'view_only'] },
    { href: '/my-devices', label: 'My Devices', roles: ['admin', 'standard'] },
    { href: '/scan', label: 'Scan QR', roles: ['admin', 'standard'] },
    { href: '/admin/labels', label: 'Print Labels', roles: ['admin'] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg">Device Tracker</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {visibleNavItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-foreground/60'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side: User info + Theme toggle */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{userName}</span>
              <span className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                {userRole}
              </span>
            </div>

            <ThemeToggle />

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isMobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              {visibleNavItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2 py-2 rounded-md transition-colors ${
                    pathname === item.href
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-border">
                <div className="px-2 py-2 text-sm">
                  <p className="font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
