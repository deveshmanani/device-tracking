import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import DashboardContent from '@/components/dashboard/DashboardContent';

const Home = async () => {
  const { user, profile } = await requireAuth();

  // Redirect non-admin users to devices page
  if (profile.role !== 'admin') {
    redirect('/devices');
  }

  return (
    <AppShell 
      userRole={profile.role} 
      userName={profile.full_name || profile.email}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {profile.full_name || profile.email}!
          </p>
        </div>
        
        <DashboardContent />
      </div>
    </AppShell>
  );
};

export default Home;
