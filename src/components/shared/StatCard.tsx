import { Card, CardContent } from '@/components/ui/card';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
}

const StatCard = ({ title, value, icon, variant = 'default' }: StatCardProps) => {
  const variantClasses = {
    default: 'border-border',
    primary: 'border-primary/20 bg-primary/5',
    success: 'border-success/20 bg-success/5',
    warning: 'border-warning/20 bg-warning/5',
    destructive: 'border-destructive/20 bg-destructive/5',
  };

  const textColors = {
    default: 'text-foreground',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
  };

  return (
    <Card className={variantClasses[variant]}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold mt-2 ${textColors[variant]}`}>
              {value}
            </p>
          </div>
          {icon && (
            <div className={`${textColors[variant]} opacity-20`}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
