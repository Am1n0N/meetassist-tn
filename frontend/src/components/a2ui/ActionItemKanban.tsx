'use client';

import { ActionItem } from '@/types/meeting';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ActionItemKanbanProps {
  items: ActionItem[];
}

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'bg-gray-100' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-blue-50' },
  { id: 'done', label: 'Done', color: 'bg-green-50' },
];

const priorityVariant: Record<string, 'default' | 'destructive' | 'secondary'> = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
};

export default function ActionItemKanban({ items }: ActionItemKanbanProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {COLUMNS.map((col) => (
        <div key={col.id} className={`rounded-lg p-3 ${col.color}`}>
          <h3 className="font-semibold text-sm mb-3">{col.label}</h3>
          <div className="space-y-2">
            {items
              .filter((item) => item.status === col.id)
              .map((item) => (
                <Card key={item.id} className="p-3 shadow-sm">
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.assignee && (
                    <p className="text-xs text-muted-foreground mt-1">👤 {item.assignee}</p>
                  )}
                  {item.deadline && (
                    <p className="text-xs text-muted-foreground">📅 {item.deadline}</p>
                  )}
                  <Badge
                    variant={priorityVariant[item.priority]}
                    className="mt-2 text-xs"
                  >
                    {item.priority}
                  </Badge>
                </Card>
              ))}
            {items.filter((item) => item.status === col.id).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Empty</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
