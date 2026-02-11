export interface LocationInputDTO {
  name: string;
  address?: string;
  vipServiceAvailable?: boolean;
}

export interface LocationOutputDTO {
  id: number;
  name: string;
  address: string;
  vipServiceAvailable: boolean;
}

