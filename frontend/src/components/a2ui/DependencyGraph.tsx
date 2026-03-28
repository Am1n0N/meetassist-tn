import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DependencyNode {
  id: string;
  label: string;
  type?: 'task' | 'decision' | 'milestone';
  dependsOn?: string[];
}

interface DependencyGraphProps {
  nodes: DependencyNode[];
  title?: string;
}

const typeColor: Record<string, string> = {
  task: 'bg-blue-100 text-blue-800 border-blue-200',
  decision: 'bg-green-100 text-green-800 border-green-200',
  milestone: 'bg-purple-100 text-purple-800 border-purple-200',
};

export default function DependencyGraph({ nodes, title = 'Task Dependencies' }: DependencyGraphProps) {
  const layers: DependencyNode[][] = [];
  const assigned = new Set<string>();

  while (assigned.size < nodes.length) {
    const layer = nodes.filter(
      (n) => !assigned.has(n.id) && (n.dependsOn || []).every((dep) => assigned.has(dep))
    );
    if (layer.length === 0) break;
    layers.push(layer);
    layer.forEach((n) => assigned.add(n.id));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4 overflow-x-auto pb-2">
          {layers.map((layer, li) => (
            <div key={li} className="flex flex-col gap-2 flex-shrink-0">
              {layer.map((node) => (
                <div
                  key={node.id}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium ${typeColor[node.type || 'task']}`}
                >
                  {node.label}
                  {node.type && <span className="ml-1 opacity-60">({node.type})</span>}
                </div>
              ))}
            </div>
          ))}
          {layers.length === 0 && (
            <p className="text-sm text-muted-foreground">No dependency data available.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
