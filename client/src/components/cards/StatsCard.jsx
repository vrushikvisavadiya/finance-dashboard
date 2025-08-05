import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // same util you already have

/* ------------------------------------------------------------------ */
/*  Props
/*  ──────────────────────────────────────────────────────────────────
    label        : string        – top title
    value        : JSX | string  – big number
    icon         : JSX           – lucide-react icon (optional)
    accent       : tailwind tint – “emerald”, “red”, “blue”, “yellow”… (default primary)
    secondary    : string        – small footer text (optional)
    className    : string        – extra classes
/* ------------------------------------------------------------------ */
export default function StatsCard({
  label,
  value,
  icon,
  accent = "primary",
  secondary,
  className = "",
}) {
  /* Choose colour tokens based on accent prop */
  const accentBg = `bg-${accent}/10 dark:bg-${accent}/20`;
  const accentText = `text-${accent}-600 dark:text-${accent}-400`;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-shadow hover:shadow-lg",
        accentBg,
        className
      )}
    >
      {/* subtle gradient overlay */}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-5",
          `bg-${accent}`
        )}
      />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {icon && <span className={cn("h-5 w-5", accentText)}>{icon}</span>}
      </CardHeader>

      <CardContent>
        <div className={cn("text-3xl font-bold tracking-tight", accentText)}>
          {value}
        </div>

        {secondary && (
          <p className="text-xs text-muted-foreground mt-1">{secondary}</p>
        )}
      </CardContent>
    </Card>
  );
}
