export interface Person {
  name: string;
  phone: string;
}

export interface House {
  landlord: string;
  houseId: string;
  houseFriendlyName: string;
  address: string;
  details: string;
  landlords: Person[];
  leaseStatus: string;
  tenants: Person[];
}

export enum PaymentStatus {
  PAID,
  DUE,
  PAST_DUE,
  NOT_DUE,
}
