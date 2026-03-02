export interface SpaServiceInputDTO {
  name: string;
  description?: string;
  price: number;
  vipOnly: boolean;
}

export interface SpaServiceOutputDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  vipOnly: boolean;
}
