export enum UserRole {
  Client = 'client',
  Infoproducer = 'infoproducer',
}

export type UserRegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  password: string;
  role: UserRole;
  companyName?: string;
  cnpj?: string;
};

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  role: UserRole;
  companyName?: string;
  cnpj?: string;
};

export type UserUpdatePayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  cpf?: string;
  password?: string;
  role?: UserRole;
  companyName?: string;
  cnpj?: string;
};
