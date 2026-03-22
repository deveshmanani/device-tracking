import Badge from '@/components/ui/Badge';
import type { DeviceStatus } from '@/types/database';

interface StatusBadgeProps {
  status: DeviceStatus;
}

const statusConfig: Record<DeviceStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  available: { label: 'Available', variant: 'success' },
  checked_out: { label: 'Checked Out', variant: 'default' },
  in_repair: { label: 'In Repair', variant: 'warning' },
  retired: { label: 'Retired', variant: 'secondary' },
  lost: { label: 'Lost', variant: 'destructive' },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
