'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from '@/components/shared/ThemeToggle';
import SignOutButton from '@/components/layout/SignOutButton';

interface HeaderProps {
  userRole: 'admin' | 'user';
  userName: string;
}

const Header = ({ userRole, userName }: HeaderProps) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Dashboard', roles: ['admin'], mobileOnly: false },
    { href: '/devices', label: 'Devices', roles: ['admin', 'user'], mobileOnly: false },
    { href: '/my-devices', label: 'My Devices', roles: ['admin', 'user'], mobileOnly: false },
    { href: '/scan', label: 'Scan QR', roles: ['admin', 'user'], mobileOnly: false },
    { href: '/admin/labels', label: 'Print Labels', roles: ['admin'], mobileOnly: false },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(userRole));
  const mobileNavItems = visibleNavItems.filter(item => item.href !== '/scan');

  // Determine home link based on role
  const homeLink = userRole === 'admin' ? '/' : '/devices';

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link href={homeLink} className="flex items-center space-x-2">
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

            {/* Right side: User info + Sign Out + Theme toggle */}
            <div className="flex items-center space-x-4">
              {/* Mobile Scan QR Button */}
              <Link href="/scan" className="md:hidden">
                <button
                  className={`p-2 rounded-md transition-colors ${
                    pathname === '/scan'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                  aria-label="Scan QR Code"
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
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </button>
              </Link>

              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{userName}</span>
                <span className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                  {userRole}
                </span>
              </div>

              <div className="hidden md:block">
                <SignOutButton />
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
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Mobile Navigation */}
          <nav className="fixed top-14 left-0 right-0 bg-background border-b border-border shadow-lg z-40 md:hidden animate-in slide-in-from-top duration-200">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-3">
                {mobileNavItems.map(item => (
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
                  <div className="px-2 mt-2">
                    <SignOutButton />
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
};

export default Header;
