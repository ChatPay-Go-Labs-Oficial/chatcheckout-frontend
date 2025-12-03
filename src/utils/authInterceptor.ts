/**
 * Interceptor de autenticação para detectar tokens expirados
 * e fazer logout automático
 */

export class AuthInterceptor {
  private static tokenKey = 'chatcheckout_access_token';
  private static refreshTokenKey = 'chatcheckout_refresh_token';
  private static userKey = 'chatcheckout_user';

  /**
   * Verifica se o usuário está autenticado
   */
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem(this.tokenKey);
    return !!token;
  }

  /**
   * Limpa todos os dados de autenticação e redireciona para login
   */
  static logout(): void {
    if (typeof window === 'undefined') return;

    // Limpa localStorage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);

    // Redireciona para login
    window.location.href = '/login';
  }

  /**
   * Intercepta resposta de erro 401 e faz logout automático
   */
  static handleUnauthorized(): void {
    console.warn('Token expirado ou inválido. Fazendo logout...');
    this.logout();
  }

  /**
   * Wrapper para fetch que adiciona autenticação e trata 401
   */
  static async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = typeof window !== 'undefined' ? localStorage.getItem(this.tokenKey) : null;

    // Adiciona token ao header se existir
    const headers = new Headers(options.headers);
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Intercepta erro 401
    if (response.status === 401) {
      this.handleUnauthorized();
      throw new Error('Não autorizado. Token expirado ou inválido.');
    }

    return response;
  }

  /**
   * Verifica se o token JWT está expirado
   */
  static isTokenExpired(token: string): boolean {
    try {
      // Valida a estrutura do JWT (deve ter 3 partes)
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      // Decodifica o payload do JWT (parte do meio)
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp;

      if (!exp) return true;

      // Verifica se expirou (exp está em segundos, Date.now() em milissegundos)
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  }

  /**
   * Verifica token ao carregar a página e faz logout se expirado
   */
  static checkTokenOnLoad(): void {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem(this.tokenKey);
    if (token && this.isTokenExpired(token)) {
      console.warn('Token expirado detectado. Fazendo logout...');
      this.logout();
    }
  }
}
