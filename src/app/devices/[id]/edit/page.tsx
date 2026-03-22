import { requireAdmin } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import DeviceEditForm from '@/components/admin/DeviceEditForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface EditDevicePageProps {
  params: Promise<{ id: string }>;
}

const EditDevicePage = async ({ params }: EditDevicePageProps) => {
  const { profile } = await requireAdmin();
  const { id } = await params;

  return (
    <AppShell 
      userRole={profile.role} 
      userName={profile.full_name || profile.email}
    >
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Link href={`/devices/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Device</h1>
            <p className="text-muted-foreground mt-1">
              Update device information
            </p>
          </div>
        </div>

        <DeviceEditForm deviceId={id} />
      </div>
    </AppShell>
  );
};

export default EditDevicePage;
