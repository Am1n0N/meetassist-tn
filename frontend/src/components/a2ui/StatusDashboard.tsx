import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface StatItem {
  label: string;
  value: number;
  total?: number;
  color?: string;
}

interface StatusDashboardProps {
  stats: StatItem[];
  title?: string;
}

const colorMap: Record<string, string> = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  red: 'text-red-600',
  orange: 'text-orange-600',
  purple: 'text-purple-600',
};

export default function StatusDashboard({ stats, title = 'Meeting Status' }: StatusDashboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <span className={`text-lg font-bold ${colorMap[stat.color || 'blue']}`}>
                {stat.value}{stat.total ? `/${stat.total}` : ''}
              </span>
            </div>
            {stat.total && (
              <Progress value={(stat.value / stat.total) * 100} className="h-2" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
