import { requireAdmin } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import DeviceForm from '@/components/admin/DeviceForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const NewDevicePage = async () => {
  const { profile } = await requireAdmin();

  return (
    <AppShell 
      userRole={profile.role} 
      userName={profile.full_name || profile.email}
    >
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Link href="/admin/devices">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Add New Device</h1>
            <p className="text-muted-foreground mt-1">
              Enter device information to add it to the inventory
            </p>
          </div>
        </div>

        <DeviceForm />
      </div>
    </AppShell>
  );
};

export default NewDevicePage;
