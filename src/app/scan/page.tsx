import { requireAuth } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import QRScanner from '@/components/scan/QRScanner';

const ScanPage = async () => {
  const { profile } = await requireAuth();

  return (
    <AppShell 
      userRole={profile.role} 
      userName={profile.full_name || profile.email}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Scan QR Code</h1>
          <p className="text-muted-foreground mt-1">
            Scan a device QR code to assign or return it
          </p>
        </div>

        <QRScanner />
      </div>
    </AppShell>
  );
};

export default ScanPage;
