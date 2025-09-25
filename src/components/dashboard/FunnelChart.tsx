interface FunnelChartProps {
  data: { label: string; value: number }[];
}

export default function FunnelChart({ data }: FunnelChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 w-full flex flex-col">
      <span className="text-base font-semibold text-[#181b4a] mb-2">Funil de Conversão</span>
      <div className="flex flex-col gap-4 mt-2">
        {data.map((step, idx) => (
          <div key={step.label} className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 min-w-[120px]">{step.label}</span>
            <div className="flex-1 h-5 bg-gray-100 rounded-lg relative">
              <div
                className="h-5 rounded-lg bg-gradient-to-r from-[#6fdcff] to-[#6f43d0] transition-all"
                style={{ width: `${(step.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-[#181b4a] ml-2">{step.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
