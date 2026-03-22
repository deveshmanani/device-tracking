import { requireAdmin } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import LabelPrintManager from '@/components/admin/LabelPrintManager';

const AdminLabelsPage = async () => {
  const { profile } = await requireAdmin();

  return (
    <AppShell 
      userRole={profile.role} 
      userName={profile.full_name || profile.email}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Print Device Labels</h1>
          <p className="text-muted-foreground mt-1">
            Select devices to generate QR code labels for printing
          </p>
        </div>

        <LabelPrintManager />
      </div>
    </AppShell>
  );
};

export default AdminLabelsPage;
