import { requireAuth } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';

const Home = async () => {
  const { user, profile } = await requireAuth();

  return (
    <AppShell 
      userRole={profile.role} 
      userName={profile.full_name || profile.email}
    >
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">Device Tracking Dashboard</h1>
          <p className="text-muted-foreground mb-6">
            Welcome back, {profile.full_name || profile.email}!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold text-lg mb-2">Total Devices</h3>
              <p className="text-3xl font-bold text-primary">--</p>
              <p className="text-sm text-muted-foreground mt-2">Coming soon</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold text-lg mb-2">Assigned</h3>
              <p className="text-3xl font-bold text-primary">--</p>
              <p className="text-sm text-muted-foreground mt-2">Coming soon</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold text-lg mb-2">Available</h3>
              <p className="text-3xl font-bold text-primary">--</p>
              <p className="text-sm text-muted-foreground mt-2">Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Home;
