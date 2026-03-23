import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const handleMouseDown = () => {
      setIsOpen((prev) => !prev);
    };

    const handleChange = () => {
      setIsOpen(false);
    };

    const handleBlur = () => {
      setIsOpen(false);
    };

    return (
      <div className="relative pt-2">
        <select
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm appearance-none [&>option]:bg-background [&>option]:text-foreground",
            className,
          )}
          ref={ref}
          onMouseDown={handleMouseDown}
          onChange={handleChange}
          onBlur={handleBlur}
          {...props}
        >
          {children}
        </select>
        {isOpen ? (
          <ChevronUp className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        ) : (
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        )}
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
