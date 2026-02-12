import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function ScoreCard({ title, value }: { title: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="text-sm text-muted">{pct}%</div>
      </CardHeader>
      <CardContent>
        <div className="h-2 w-full rounded-full bg-border/60">
          <div className="h-2 rounded-full bg-accent" style={{ width: `${pct}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}
