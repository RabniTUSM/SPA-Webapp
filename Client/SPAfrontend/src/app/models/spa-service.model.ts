export interface SpaServiceInputDTO {
  name: string;
  description?: string;
  price: number;
  isVipOnly: boolean;
}

export interface SpaServiceOutputDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  isVipOnly: boolean;
}

