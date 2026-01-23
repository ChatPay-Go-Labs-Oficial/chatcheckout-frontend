import StellarCard from '@/components/dashboard/StellarCard';
import FaqCard from '@/components/dashboard/FaqCard';
import AbandonCard from '@/components/dashboard/AbandonCard';
import FunnelChart from '@/components/dashboard/FunnelChart';
import SalesBarChart from '@/components/dashboard/SalesBarChart';
import DashboardCard from '@/components/dashboard/DashboardCard';

// Mock de dados para os cards superiores
const mockCards = [
  {
    title: 'Receita Hoje',
    value: 'R$ 1.247,80',
    percent: '+15.3%',
    subtitle: '12 transações',
  },
  {
    title: 'Taxa de Conversão',
    value: '8.2%',
    subtitle: '45/548 visitantes → compras',
  },
  {
    title: 'Ticket Médio',
    value: 'R$ 103,98',
    subtitle: 'por transação',
    percent: '-13.7%',
    percentColor: 'text-red-500',
  },
  {
    title: 'Performance Chat',
    value: '3m 24s',
    subtitle: '312 conversas',
    score: 'Score: 4.2/5',
  },
];

// Mock vendas da semana
const mockSalesWeek = [
  { day: 'Seg', value: 120 },
  { day: 'Ter', value: 140 },
  { day: 'Qua', value: 160 },
  { day: 'Qui', value: 180 },
  { day: 'Sex', value: 170 },
  { day: 'Sáb', value: 110 },
  { day: 'Dom', value: 80 },
];

// Mock funil de conversão
const mockFunnel = [
  { label: 'Chat Iniciado', value: 548 },
  { label: 'Engajado', value: 312 },
  { label: 'Checkout', value: 89 },
  { label: 'Pagamento', value: 67 },
  { label: 'Completado', value: 45 },
];

// Mock Stellar Network
const mockStellar = {
  transacoes: 12,
  volume: 2847.35,
  taxa: 0.000001,
  settlement: '4.2s',
};

// Mock perguntas frequentes
const mockFaq = [
  { question: 'Qual é o preço?', count: 45 },
  { question: 'Como funciona o pagamento?', count: 32 },
  { question: 'Aceita cartão?', count: 28 },
  { question: 'Tem garantia?', count: 23 },
];

// Mock análise de abandono
const mockAbandon = [
  { reason: 'Preço alto', count: 15 },
  { reason: 'Não entendeu o produto', count: 12 },
  { reason: 'Problemas técnicos', count: 8 },
  { reason: 'Mudou de ideia', count: 6 },
];

export default function DashboardPage() {
  return (
    <main className="flex flex-col min-h-screen w-full bg-[#f7f8fa]">
      <div className="w-full h-full pt-0 pb-12 px-10">
        <h1 className="text-3xl font-bold mb-8 text-primary pt-8">Dashboard</h1>
        {/* Grid de cards superiores */}
        <section className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {mockCards.map((card, idx) => (
            <DashboardCard key={idx} {...card} />
          ))}
        </section>
        {/* Gráficos principais: vendas da semana e funil de conversão */}
        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          <SalesBarChart data={mockSalesWeek} />
          <FunnelChart data={mockFunnel} />
        </section>
        {/* Cards informativos */}
        <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-10">
          <StellarCard {...mockStellar} />
          <FaqCard faqs={mockFaq} />
          <AbandonCard reasons={mockAbandon} />
        </section>
      </div>
    </main>
  );
}
