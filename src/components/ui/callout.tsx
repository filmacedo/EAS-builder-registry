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
  info: "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20 dark:border-l-blue-400",
  warning:
    "border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-l-yellow-400",
  error:
    "border-l-red-500 bg-red-50/50 dark:bg-red-950/20 dark:border-l-red-400",
  success:
    "border-l-green-500 bg-green-50/50 dark:bg-green-950/20 dark:border-l-green-400",
};

const titleStyles = {
  info: "text-blue-950 dark:text-blue-100",
  warning: "text-yellow-950 dark:text-yellow-100",
  error: "text-red-950 dark:text-red-100",
  success: "text-green-950 dark:text-green-100",
};

const textStyles = {
  info: "text-blue-800/80 dark:text-blue-200/80",
  warning: "text-yellow-800/80 dark:text-yellow-200/80",
  error: "text-red-800/80 dark:text-red-200/80",
  success: "text-green-800/80 dark:text-green-200/80",
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
