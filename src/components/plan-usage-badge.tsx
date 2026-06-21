import { Badge } from "@/components/ui/badge";

interface PlanUsageBadgeProps {
  used: number;
  total: number;
  label: string;
}

export function PlanUsageBadge({ used, total, label }: PlanUsageBadgeProps) {
  const isUnlimited = total === -1;
  const isNearLimit = !isUnlimited && used >= total;
  const isWarning = !isUnlimited && !isNearLimit && used >= total * 0.8;

  return (
    <Badge
      variant={isNearLimit ? "destructive" : isWarning ? "outline" : "secondary"}
      className="gap-1 text-xs"
    >
      <span>{used}</span>
      <span className="text-muted-foreground">/</span>
      <span>{isUnlimited ? "∞" : total}</span>
      <span className="ml-0.5 text-muted-foreground">{label}</span>
    </Badge>
  );
}
