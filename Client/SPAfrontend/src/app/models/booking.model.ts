export interface BookingInputDTO {
  customerId: number;
  employeeId: number;
  serviceId: number;
  locationId: number;
  startTime: string;
  endTime: string;
}

export interface BookingOutputDTO {
  id: number;
  customerName: string;
  employeeName: string;
  serviceName: string;
  locationName: string;
  startTime: string;
  endTime: string;
}

