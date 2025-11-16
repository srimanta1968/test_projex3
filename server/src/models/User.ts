export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  created_at: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserDTO;
  token: string;
}

export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    created_at: user.created_at,
  };
}
