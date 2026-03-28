import { ActionItem } from '@/types/meeting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface DeadlineCalendarProps {
  items: ActionItem[];
}

export default function DeadlineCalendar({ items }: DeadlineCalendarProps) {
  const withDeadline = items
    .filter((i) => i.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  const grouped = withDeadline.reduce<Record<string, ActionItem[]>>((acc, item) => {
    const date = item.deadline!;
    acc[date] = [...(acc[date] || []), item];
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4" /> Deadline Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(grouped).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No deadlines set</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(grouped).map(([date, dateItems]) => (
              <div key={date}>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  📅 {new Date(date).toLocaleDateString('fr-TN', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                {dateItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 pl-4">
                    <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                      {item.priority}
                    </Badge>
                    <span className="text-sm">{item.title}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
