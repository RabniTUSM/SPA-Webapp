export interface RoleInputDTO {
  name: string;
  hasAdminAccess: boolean;
  description?: string;
}

export interface RoleOutputDTO {
  id: number;
  name: string;
  hasAdminAccess: boolean;
  description: string;
}

