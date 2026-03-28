import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

interface ComparisonOption {
  name: string;
  values: Record<string, boolean | string | null>;
}

interface ComparisonTableProps {
  title?: string;
  criteria: string[];
  options: ComparisonOption[];
}

export default function ComparisonTable({ title = 'Option Comparison', criteria, options }: ComparisonTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2 text-muted-foreground">Criteria</th>
                {options.map((opt) => (
                  <th key={opt.name} className="text-center p-2 font-semibold">{opt.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteria.map((criterion) => (
                <tr key={criterion} className="border-t">
                  <td className="p-2 text-muted-foreground">{criterion}</td>
                  {options.map((opt) => {
                    const val = opt.values[criterion];
                    return (
                      <td key={opt.name} className="text-center p-2">
                        {val === true ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                        ) : val === false ? (
                          <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                        ) : val === null ? (
                          <MinusCircle className="w-4 h-4 text-gray-400 mx-auto" />
                        ) : (
                          <span>{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
