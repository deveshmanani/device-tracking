import type { ReactNode } from 'react';
import Header from './Header';

interface AppShellProps {
  children: ReactNode;
  userRole: 'admin' | 'user';
  userName: string;
}

const AppShell = ({ children, userRole, userName }: AppShellProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header userRole={userRole} userName={userName} />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
};

export default AppShell;
