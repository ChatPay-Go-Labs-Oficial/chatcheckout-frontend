import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MessageSquareText } from 'lucide-react';

interface FaqCardProps {
  faqs: { question: string; count: number }[];
}

export default function FaqCard({ faqs }: FaqCardProps) {
  return (
    <Card className="flex flex-col min-w-[220px]">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <MessageSquareText className="w-5 h-5 text-primary" />
        <CardTitle className="text-base">Perguntas Frequentes</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2 mt-2">
          {faqs.map((faq) => (
            <li
              key={faq.question}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-muted-foreground">{faq.question}</span>
              <span className="font-semibold text-primary">{faq.count}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
