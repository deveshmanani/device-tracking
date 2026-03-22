import { requireAuth } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import DeviceDetailContent from '@/components/devices/DeviceDetailContent';

interface DeviceDetailPageProps {
  params: Promise<{ id: string }>;
}

const DeviceDetailPage = async ({ params }: DeviceDetailPageProps) => {
  const { profile } = await requireAuth();
  const { id } = await params;

  return (
    <AppShell 
      userRole={profile.role} 
      userName={profile.full_name || profile.email}
    >
      <DeviceDetailContent deviceId={id} />
    </AppShell>
  );
};

export default DeviceDetailPage;
