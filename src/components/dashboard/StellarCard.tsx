interface StellarCardProps {
  transacoes: number;
  volume: number;
  taxa: number;
  settlement: string;
}

export default function StellarCard({ transacoes, volume, taxa, settlement }: StellarCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-2 min-w-[220px]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">⭐</span>
        <span className="font-bold text-base text-[#181b4a]">Stellar Network</span>
      </div>
      <div className="text-sm text-gray-600">
        Transações Hoje: <span className="font-semibold text-[#181b4a]">{transacoes}</span>
      </div>
      <div className="text-sm text-gray-600">
        Volume USDC: <span className="font-semibold text-[#181b4a]">{volume}</span>
      </div>
      <div className="text-sm text-gray-600">
        Taxa de Rede: <span className="font-semibold text-[#181b4a]">${taxa}</span>
      </div>
      <div className="text-sm text-gray-600">
        Settlement Médio: <span className="font-semibold text-[#181b4a]">{settlement}</span>
      </div>
    </div>
  );
}
