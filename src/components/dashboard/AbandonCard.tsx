interface AbandonCardProps {
  reasons: { reason: string; count: number }[];
}

export default function AbandonCard({ reasons }: AbandonCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-2 min-w-[220px]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🔍</span>
        <span className="font-bold text-base text-[#181b4a]">Análise de Abandono</span>
      </div>
      <ul className="mt-2">
        {reasons.map((item) => (
          <li
            key={item.reason}
            className="flex justify-between items-center py-1 text-sm text-gray-600"
          >
            <span>{item.reason}</span>
            <span className="font-semibold text-red-500">{item.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
