import { requireAuth } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import MyDevicesList from '@/components/my-devices/MyDevicesList';

const MyDevicesPage = async () => {
  const { profile } = await requireAuth();

  return (
    <AppShell 
      userRole={profile.role} 
      userName={profile.full_name || profile.email}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Devices</h1>
          <p className="text-muted-foreground mt-1">
            Devices currently assigned to you
          </p>
        </div>

        <MyDevicesList />
      </div>
    </AppShell>
  );
};

export default MyDevicesPage;
