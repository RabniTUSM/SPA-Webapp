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
  vipMember: boolean;
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
  isVipMember: boolean;
  role: string;
}

