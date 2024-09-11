export type LandLord = {
  name: string;
  phone: string;
};

export type Tenant = {
  name: string;
  phone: string;
};

export type InitLeaseRequest = {
  user: string;
  houseid: string;
  startDate: string;
  term: string;
  rentAmount: string;
  landlords: LandLord[];
  tenants: Tenant[];
};

export type Responsebody = {
  message: string;
  isUserOwner?: boolean;
  houseAvailable?: boolean;
  jobsCreated?: number;
};

export enum PROPERTY_STATUS {
  LEASED = "LEASED",
  AVAILABLE = "AVAILABLE",
}
