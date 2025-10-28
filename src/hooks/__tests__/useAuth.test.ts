import { act, renderHook } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { jwtDecode } from 'jwt-decode';

// Mock dos serviços
jest.mock('@/services/authService');
jest.mock('@/services/userService');
jest.mock('jwt-decode');

describe('useAuth', () => {
  const mockAccessToken = 'mock-access-token';
  const mockRefreshToken = 'mock-refresh-token';
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'client',
  };

  beforeEach(() => {
    // Limpa localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }

    // Reset dos mocks
    jest.clearAllMocks();

    // Mock do JWT decode
    (jwtDecode as jest.Mock).mockReturnValue({
      sub: mockUser.id,
      email: mockUser.email,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      role: mockUser.role,
    });
  });

  it('should login with email', async () => {
    const mockLoginResponse = {
      access_token: mockAccessToken,
      refresh_token: mockRefreshToken,
      user: mockUser,
    };

    (authService.login as jest.Mock).mockResolvedValueOnce(mockLoginResponse);
    (userService.getProfile as jest.Mock).mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({
        identifier: 'test@example.com',
        password: 'password123',
      });
    });

    expect(authService.login).toHaveBeenCalledWith({
      identifier: 'test@example.com',
      password: 'password123',
    });
    expect(result.current.user).toEqual(expect.objectContaining(mockUser));
    expect(result.current.accessToken).toBe(mockAccessToken);
  });

  it('should login with CPF', async () => {
    const mockLoginResponse = {
      access_token: mockAccessToken,
      refresh_token: mockRefreshToken,
      user: mockUser,
    };

    (authService.login as jest.Mock).mockResolvedValueOnce(mockLoginResponse);
    (userService.getProfile as jest.Mock).mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({
        identifier: '123.456.789-00',
        password: 'password123',
      });
    });

    expect(authService.login).toHaveBeenCalledWith({
      identifier: '12345678900',
      password: 'password123',
    });
    expect(result.current.user).toEqual(expect.objectContaining(mockUser));
  });

  it('should login with CNPJ', async () => {
    const mockLoginResponse = {
      access_token: mockAccessToken,
      refresh_token: mockRefreshToken,
      user: mockUser,
    };

    (authService.login as jest.Mock).mockResolvedValueOnce(mockLoginResponse);
    (userService.getProfile as jest.Mock).mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({
        identifier: '12.345.678/0001-90',
        password: 'password123',
      });
    });

    expect(authService.login).toHaveBeenCalledWith({
      identifier: '12345678000190',
      password: 'password123',
    });
    expect(result.current.user).toEqual(expect.objectContaining(mockUser));
  });

  it('should handle login error correctly', async () => {
    const error = new Error('Invalid credentials');
    (authService.login as jest.Mock).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.login({
          identifier: 'test@example.com',
          password: 'wrong',
        });
      } catch {}
    });

    expect(result.current.error).toBe('Credenciais inválidas');
    expect(result.current.user).toBeNull();
  });

  it('should refresh token', async () => {
    const mockRefreshResponse = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
    };

    (authService.refresh as jest.Mock).mockResolvedValueOnce(mockRefreshResponse);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.refresh({ refresh_token: mockRefreshToken });
    });

    expect(authService.refresh).toHaveBeenCalledWith({
      refresh_token: mockRefreshToken,
    });
    expect(result.current.accessToken).toBe('new-access-token');
    expect(result.current.refreshToken).toBe('new-refresh-token');
  });

  it('should logout correctly', async () => {
    (authService.logout as jest.Mock).mockResolvedValueOnce({
      message: 'Logout realizado com sucesso',
    });

    const { result } = renderHook(() => useAuth());

    // Simula que o usuário está logado fazendo login primeiro
    const mockLoginResponse = {
      access_token: mockAccessToken,
      refresh_token: mockRefreshToken,
      user: mockUser,
    };
    (authService.login as jest.Mock).mockResolvedValueOnce(mockLoginResponse);
    (userService.getProfile as jest.Mock).mockResolvedValueOnce(mockUser);

    await act(async () => {
      await result.current.login({
        identifier: 'test@example.com',
        password: 'password123',
      });
    });

    // Realiza logout
    await act(async () => {
      await result.current.logout();
    });

    expect(authService.logout).toHaveBeenCalledWith({ token: mockAccessToken });
    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.refreshToken).toBeNull();
    expect(localStorage.getItem('chatcheckout_access_token')).toBeNull();
  });

  it('should logout and clear local data even if backend call fails', async () => {
    (authService.logout as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAuth());

    // Simula que o usuário está logado fazendo login primeiro
    const mockLoginResponse = {
      access_token: mockAccessToken,
      refresh_token: mockRefreshToken,
      user: mockUser,
    };
    (authService.login as jest.Mock).mockResolvedValueOnce(mockLoginResponse);
    (userService.getProfile as jest.Mock).mockResolvedValueOnce(mockUser);

    await act(async () => {
      await result.current.login({
        identifier: 'test@example.com',
        password: 'password123',
      });
    });

    // Realiza logout com erro
    await act(async () => {
      await result.current.logout();
    });

    // Mesmo com erro, deve limpar dados locais
    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.refreshToken).toBeNull();
    expect(localStorage.getItem('chatcheckout_access_token')).toBeNull();
  });
});
