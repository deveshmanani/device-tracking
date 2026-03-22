import type { HTMLAttributes, ReactNode } from 'react';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  children: ReactNode;
}

const Alert = ({ variant = 'default', children, className = '', ...props }: AlertProps) => {
  const variantClasses = {
    default: 'bg-background text-foreground border-border',
    success: 'bg-success/10 text-success-foreground border-success/20',
    warning: 'bg-warning/10 text-warning-foreground border-warning/20',
    destructive: 'bg-destructive/10 text-destructive-foreground border-destructive/20',
  };

  return (
    <div
      className={`relative w-full rounded-lg border p-4 ${variantClasses[variant]} ${className}`}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
};

interface AlertTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

const AlertTitle = ({ children, className = '', ...props }: AlertTitleProps) => {
  return (
    <h5 className={`mb-1 font-medium leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h5>
  );
};

interface AlertDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

const AlertDescription = ({ children, className = '', ...props }: AlertDescriptionProps) => {
  return (
    <div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props}>
      {children}
    </div>
  );
};

export { Alert, AlertTitle, AlertDescription };
export default Alert;
