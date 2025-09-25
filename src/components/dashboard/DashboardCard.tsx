interface DashboardCardProps {
  title: string;
  value: string;
  subtitle?: string;
  percent?: string;
  percentColor?: string;
  score?: string;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  percent,
  percentColor = 'text-green-500',
  score,
}: DashboardCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-1 min-w-[180px]">
      <span className="text-sm font-semibold text-gray-500 mb-1">{title}</span>
      <span className="text-2xl font-bold text-[#181b4a]">{value}</span>
      {percent && <span className={`text-xs font-semibold ${percentColor}`}>{percent}</span>}
      {subtitle && <span className="text-xs text-gray-400 mt-1">{subtitle}</span>}
      {score && <span className="text-xs text-blue-400 mt-1">{score}</span>}
    </div>
  );
}
