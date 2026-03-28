'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryAccordionProps {
  summary: string;
  sections?: Array<{ title: string; content: string }>;
}

export default function SummaryAccordion({ summary, sections }: SummaryAccordionProps) {
  const defaultSections = sections || [
    { title: '📋 Meeting Overview', content: summary },
    { title: '🎯 Key Points', content: 'Key discussion points will appear here after AI analysis.' },
    { title: '📊 Outcomes', content: 'Meeting outcomes and next steps will be listed here.' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Meeting Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['item-0']}>
          {defaultSections.map((section, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-sm">{section.title}</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">{section.content}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
