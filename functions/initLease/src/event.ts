export type LandLord = {
  name: string;
  phone: string
}

export type Tenant = {
  name: string;
  phone: string
}

type Body = {
  user: string;
  houseid: string;
  startDate: string;
  term: string;
  rentAmount: string;
  landlords: LandLord[]
  tenants: Tenant[]
}

export type Event = {
  body: Body;
  environment: string;
}