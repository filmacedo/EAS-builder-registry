import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CalloutProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  variant?: "info" | "warning" | "error" | "success";
  className?: string;
}

const variantStyles = {
  info: "border-l-accent bg-accent-light/10 dark:bg-accent-light/20 dark:border-l-accent",
  warning:
    "border-l-accent bg-accent-light/20 dark:bg-accent-light/30 dark:border-l-accent",
  error:
    "border-l-destructive bg-destructive/10 dark:bg-destructive/20 dark:border-l-destructive",
  success:
    "border-l-accent bg-accent-light/10 dark:bg-accent-light/20 dark:border-l-accent",
};

const titleStyles = {
  info: "text-accent dark:text-accent",
  warning: "text-accent dark:text-accent",
  error: "text-destructive dark:text-destructive",
  success: "text-accent dark:text-accent",
};

const textStyles = {
  info: "text-accent/80 dark:text-accent/80",
  warning: "text-accent/80 dark:text-accent/80",
  error: "text-destructive/80 dark:text-destructive/80",
  success: "text-accent/80 dark:text-accent/80",
};

export function Callout({
  title,
  children,
  action,
  variant = "info",
  className,
}: CalloutProps) {
  return (
    <div
      className={cn(
        "rounded-lg border-l-4 p-6",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
        <div className="space-y-1">
          <h4 className={cn("font-medium", titleStyles[variant])}>{title}</h4>
          <div className={cn("text-sm", textStyles[variant])}>{children}</div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
