/**
 * Price Oracle Service Interface
 * Interface abstrata para serviços de cotação de preços
 * Facilita migração entre diferentes provedores de dados
 */

export interface PriceOracleService {
  /**
   * Obtém a taxa de conversão entre duas moedas
   * @param from Moeda de origem (ex: 'BRL')
   * @param to Moeda de destino (ex: 'USDC')
   * @returns Taxa de conversão (1 `to` = X `from`)
   */
  getExchangeRate(from: string, to: string): Promise<number>;

  /**
   * Converte um valor de uma moeda para outra
   * @param amount Valor a converter
   * @param from Moeda de origem
   * @param to Moeda de destino
   * @returns Valor convertido
   */
  convertAmount(amount: number, from: string, to: string): Promise<number>;
}
