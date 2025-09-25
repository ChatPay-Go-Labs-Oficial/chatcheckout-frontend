interface FaqCardProps {
  faqs: { question: string; count: number }[];
}

export default function FaqCard({ faqs }: FaqCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-2 min-w-[220px]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">💬</span>
        <span className="font-bold text-base text-[#181b4a]">Perguntas Frequentes</span>
      </div>
      <ul className="mt-2">
        {faqs.map((faq) => (
          <li
            key={faq.question}
            className="flex justify-between items-center py-1 text-sm text-gray-600"
          >
            <span>{faq.question}</span>
            <span className="font-semibold text-[#6f43d0]">{faq.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
