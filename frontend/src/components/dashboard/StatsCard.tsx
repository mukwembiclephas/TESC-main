import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "success" | "warning" | "accent";
  onClick?: () => void; // ✅ ADD THIS
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
  onClick, // ✅ ADD THIS
}: StatsCardProps) {
  const variants = {
    default: "bg-card border-border",
    success: "bg-success-light border-success",
    warning: "bg-warning-light border-warning",
    accent: "bg-accent-light border-accent",
  };

  return (
    <Card
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "shadow-md transition-all select-none",
        variants[variant],
        onClick && "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
      )}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}

        {trend && (
          <div className="flex items-center pt-1">
            <span
              className={cn(
                "text-xs font-medium",
                trend.value > 0
                  ? "text-success"
                  : trend.value < 0
                    ? "text-destructive"
                    : "text-muted-foreground",
              )}
            >
              {trend.value > 0 ? "+" : ""}
              {trend.value}% {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
