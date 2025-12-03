/**
 * Formulário inline para coleta de dados do cliente
 */

'use client';

import { useState, FormEvent } from 'react';
import { MessageComponentData, CustomerData } from '@/types/checkout';
import { UseCheckoutReturn } from '@/types/checkout-hook';

interface CustomerDataFormProps {
  data: MessageComponentData;
  checkout: UseCheckoutReturn;
  initialData: CustomerData | null;
}

export function CustomerDataForm({ checkout, initialData }: CustomerDataFormProps) {
  const [formData, setFormData] = useState<CustomerData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    whatsapp: initialData?.whatsapp || '',
    cpf: initialData?.cpf || '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    checkout.submitCustomerData(formData);
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  return (
    <div className="bg-white rounded-xl p-6 w-full border border-gray-200 mt-3">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="full-name">
            Nome completo
          </label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm text-gray-800 placeholder:text-gray-400 bg-white"
            id="full-name"
            placeholder="Seu nome completo"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
            E-mail
          </label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm text-gray-800 placeholder:text-gray-400 bg-white"
            id="email"
            placeholder="seuemail@exemplo.com"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="whatsapp">
            WhatsApp
          </label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm text-gray-800 placeholder:text-gray-400 bg-white"
            id="whatsapp"
            placeholder="(99) 99999-9999"
            type="tel"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: formatWhatsApp(e.target.value) })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="cpf">
            CPF
          </label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm text-gray-800 placeholder:text-gray-400 bg-white"
            id="cpf"
            placeholder="000.000.000-00"
            type="text"
            value={formData.cpf}
            onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 mt-6 rounded-xl gradient-bg text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 shadow-lg"
        >
          <span>Enviar dados pessoais</span>
          <span className="material-symbols-outlined text-xl">arrow_forward</span>
        </button>
      </form>
    </div>
  );
}
