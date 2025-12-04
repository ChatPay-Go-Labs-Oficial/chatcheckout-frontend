/**
 * Serviço para comunicação com a API de checkout
 */

import { ProductInfo, ChatAiResponse, CustomerData, PaymentMethod } from '@/types/checkout';
import { paymentService } from './paymentService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Constantes para filtrar conteúdo indesejado do streaming da API
const STREAM_FILTER_PATTERNS = {
  ERROR_MARKER: '[ERROR]',
  NONE_VALUE: 'None',
  DONE_MARKER: '[DONE]',
  API_DEBUG_FUNCTION: 'buscar_conteudo_completo_site',
  API_DEBUG_TIMING: 'completed in',
} as const;

/**
 * Decodifica o hash do produto e retorna as informações completas
 */
export async function decodeProduct(hash: string): Promise<ProductInfo> {
  const response = await fetch(`${API_URL}/product/by-hash/${hash}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Falha ao decodificar produto' }));
    throw new Error(error.message || 'Produto não encontrado');
  }

  return response.json();
}

/**
 * Envia uma mensagem para a IA e recebe a resposta com streaming real
 */
export async function sendChatMessage(
  productHash: string,
  message: string,
  onChunk?: (chunk: string) => void,
): Promise<ChatAiResponse> {
  const response = await fetch(`${API_URL}/chat-ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productHash,
      message,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Falha ao enviar mensagem' }));
    throw new Error(error.message || 'Erro ao se comunicar com a IA');
  }

  // Processa o stream SSE (Server-Sent Events) em tempo real
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';
  let buffer = '';

  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');

        // Mantém a última linha incompleta no buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.substring(6).trim();
            if (content === STREAM_FILTER_PATTERNS.DONE_MARKER) break;

            // Filters out API metadata, error markers, and debug information from the Python streaming response
            if (
              content &&
              content !== STREAM_FILTER_PATTERNS.ERROR_MARKER &&
              content !== STREAM_FILTER_PATTERNS.NONE_VALUE &&
              !content.includes(STREAM_FILTER_PATTERNS.API_DEBUG_FUNCTION) &&
              !content.includes(STREAM_FILTER_PATTERNS.API_DEBUG_TIMING)
            ) {
              fullResponse += content;
              // Chama callback com cada chunk (streaming real)
              if (onChunk) {
                onChunk(content);
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  return { response: fullResponse.trim() };
}

/**
 * Processa pagamento via Stripe Payment Intent
 */
export async function processPayment(
  productId: string,
  customerData: CustomerData,
  paymentMethod: PaymentMethod,
): Promise<{ success: boolean; qrCode?: string; pixCode?: string; clientSecret?: string; orderId?: string }> {
  try {
    const response = await paymentService.createPaymentIntent({
      productId,
      paymentMethod,
      customerData: {
        name: customerData.name,
        email: customerData.email,
        cpf: customerData.cpf,
        phone: customerData.phone || customerData.whatsapp,
      },
    });

    return {
      success: true,
      clientSecret: response.clientSecret,
      orderId: response.orderId,
      qrCode: response.qrCode,
      pixCode: response.pixCode,
    };
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    throw error;
  }
}

/**
 * Confirma o pagamento
 * TODO: Implementar lógica real de confirmação
 */
export async function confirmPayment(): Promise<{ success: boolean }> {
  // Simulação - substituir por webhook/polling real
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 2000);
  });
}

export const checkoutService = {
  decodeProduct,
  sendChatMessage,
  processPayment,
  confirmPayment,
};
