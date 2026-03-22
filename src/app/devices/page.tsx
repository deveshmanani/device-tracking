import { requireAuth } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import DevicesList from '@/components/devices/DevicesList';

const DevicesPage = async () => {
  const { profile } = await requireAuth();

  return (
    <AppShell 
      userRole={profile.role} 
      userName={profile.full_name || profile.email}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Devices</h1>
            <p className="text-muted-foreground mt-1">
              Browse and manage all devices
            </p>
          </div>
        </div>
        
        <DevicesList />
      </div>
    </AppShell>
  );
};

export default DevicesPage;
