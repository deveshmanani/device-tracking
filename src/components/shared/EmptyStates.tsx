import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Package, 
  Search, 
  Smartphone, 
  Plus,
  AlertCircle,
  RefreshCcw 
} from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
        {icon && (
          <div className="rounded-full bg-muted p-6 mb-4">
            {icon}
          </div>
        )}
        
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {description}
        </p>

        {action && (
          action.href ? (
            <Link href={action.href}>
              <Button>{action.label}</Button>
            </Link>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )
        )}
      </CardContent>
    </Card>
  );
};

export const NoDevicesFound = ({ hasFilters = false, onClearFilters }: { hasFilters?: boolean; onClearFilters?: () => void }) => {
  return (
    <EmptyState
      icon={<Search className="h-12 w-12 text-muted-foreground" />}
      title={hasFilters ? "No devices found" : "No devices yet"}
      description={
        hasFilters
          ? "No devices match your current filters. Try adjusting your search criteria."
          : "There are no devices in the system yet. Add your first device to get started."
      }
      action={
        hasFilters && onClearFilters
          ? {
              label: "Clear Filters",
              onClick: onClearFilters,
            }
          : undefined
      }
    />
  );
};

export const NoMyDevicesFound = () => {
  return (
    <EmptyState
      icon={<Package className="h-12 w-12 text-muted-foreground" />}
      title="No devices assigned"
      description="You don't have any devices currently assigned to you. Scan a QR code to check out a device."
      action={{
        label: "Scan QR Code",
        href: "/scan",
      }}
    />
  );
};

export const NoDevicesAvailable = () => {
  return (
    <EmptyState
      icon={<Smartphone className="h-12 w-12 text-muted-foreground" />}
      title="No devices available"
      description="All devices are currently checked out or unavailable. Please check back later."
    />
  );
};

export const ErrorState = ({ 
  title = "Something went wrong", 
  description = "An unexpected error occurred. Please try again.",
  onRetry 
}: { 
  title?: string; 
  description?: string; 
  onRetry?: () => void;
}) => {
  return (
    <EmptyState
      icon={<AlertCircle className="h-12 w-12 text-destructive" />}
      title={title}
      description={description}
      action={
        onRetry
          ? {
              label: "Try Again",
              onClick: onRetry,
            }
          : undefined
      }
    />
  );
};

export const NoHistoryFound = () => {
  return (
    <EmptyState
      icon={<Package className="h-12 w-12 text-muted-foreground" />}
      title="No history yet"
      description="This device doesn't have any recorded events yet."
    />
  );
};
