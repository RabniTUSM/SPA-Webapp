export interface RoleInputDTO {
  name: string;
  hasAdminAccess: boolean;
  description?: string;
  viewType?: 'customer' | 'vip' | 'employee' | 'admin';
}

export interface RoleOutputDTO {
  id: number;
  name: string;
  hasAdminAccess: boolean;
  description: string;
  viewType: 'customer' | 'vip' | 'employee' | 'admin';
}
