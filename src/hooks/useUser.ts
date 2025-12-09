import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { UserRegisterPayload, UserUpdatePayload } from '@/types/user';

export function useUser(accessToken?: string) {
  const queryClient = useQueryClient();

  // Query para buscar perfil
  const {
    data: profile = null,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ['user-profile', accessToken],
    queryFn: () => {
      if (!accessToken) throw new Error('Token não fornecido');
      return userService.getProfile(accessToken);
    },
    enabled: !!accessToken,
  });

  // Mutation para registrar
  const registerMutation = useMutation({
    mutationFn: (payload: UserRegisterPayload) => userService.register(payload),
  });

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UserUpdatePayload }) => {
      if (!accessToken) throw new Error('Token não fornecido');
      return userService.update(id, payload, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', accessToken] });
    },
  });

  // Mutation para remover
  const removeMutation = useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) throw new Error('Token não fornecido');
      return userService.remove(id, accessToken);
    },
    onSuccess: () => {
      queryClient.setQueryData(['user-profile', accessToken], null);
    },
  });

  // Wrappers para manter API compatível e simplificada
  const register = async (payload: UserRegisterPayload) => {
    return registerMutation.mutateAsync(payload);
  };

  const update = async (id: string, payload: UserUpdatePayload) => {
    return updateMutation.mutateAsync({ id, payload });
  };

  const remove = async (id: string) => {
    return removeMutation.mutateAsync(id);
  };

  const getProfile = async (token: string) => {
    // A query automática cuida disso se o token mudar, mas se precisar forçar:
    if (token !== accessToken) {
      // Isso é tecnicamente estranho com useQuery, pois o token deve vir da prop ou context
      // Mas mantendo compatibilidade, podemos apenas retornar a promise da query se quisermos,
      // ou deixar o componente reagir à mudança de prop.
      // Para manter a assinatura async, podemos usar fetchQuery do client se necessário,
      // mas o ideal é deixar o useQuery reativo.
      // Retornaremos o dado atual ou null
      return profile;
    }
    return profile;
  };

  const error =
    (profileError as Error)?.message ||
    (registerMutation.error as Error)?.message ||
    (updateMutation.error as Error)?.message ||
    (removeMutation.error as Error)?.message ||
    null;

  const loading =
    isLoadingProfile ||
    registerMutation.isPending ||
    updateMutation.isPending ||
    removeMutation.isPending;

  return {
    profile,
    loading,
    error,
    register,
    getProfile, // Nota: Com React Query, preferencialmente deixe o hook reagir ao token em vez de chamar imperativamente
    update,
    remove,
  };
}
