export interface UserInputDTO {
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
}

export interface UserOutputDTO {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface CreateAdminDTO {
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
}

export interface AdminUserInputDTO {
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}
