import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RiskItem {
  label: string;
  impact: 'high' | 'low';
  likelihood: 'high' | 'low';
  description?: string;
}

interface RiskMatrixProps {
  risks: RiskItem[];
}

export default function RiskMatrix({ risks }: RiskMatrixProps) {
  const quadrants = {
    'high-high': risks.filter((r) => r.impact === 'high' && r.likelihood === 'high'),
    'high-low': risks.filter((r) => r.impact === 'high' && r.likelihood === 'low'),
    'low-high': risks.filter((r) => r.impact === 'low' && r.likelihood === 'high'),
    'low-low': risks.filter((r) => r.impact === 'low' && r.likelihood === 'low'),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Risk Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-red-100 rounded p-3 border border-red-200">
            <p className="font-semibold text-red-700 mb-2">🔴 High Impact / High Likelihood</p>
            {quadrants['high-high'].map((r, i) => (
              <Badge key={i} variant="destructive" className="mr-1 mb-1">{r.label}</Badge>
            ))}
          </div>
          <div className="bg-orange-100 rounded p-3 border border-orange-200">
            <p className="font-semibold text-orange-700 mb-2">🟠 High Impact / Low Likelihood</p>
            {quadrants['high-low'].map((r, i) => (
              <Badge key={i} className="mr-1 mb-1 bg-orange-500">{r.label}</Badge>
            ))}
          </div>
          <div className="bg-yellow-100 rounded p-3 border border-yellow-200">
            <p className="font-semibold text-yellow-700 mb-2">🟡 Low Impact / High Likelihood</p>
            {quadrants['low-high'].map((r, i) => (
              <Badge key={i} className="mr-1 mb-1 bg-yellow-500">{r.label}</Badge>
            ))}
          </div>
          <div className="bg-green-100 rounded p-3 border border-green-200">
            <p className="font-semibold text-green-700 mb-2">🟢 Low Impact / Low Likelihood</p>
            {quadrants['low-low'].map((r, i) => (
              <Badge key={i} variant="secondary" className="mr-1 mb-1">{r.label}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
