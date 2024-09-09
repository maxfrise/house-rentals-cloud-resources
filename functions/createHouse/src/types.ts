export type Responsebody = {
  message: string;
}

interface Person {
  name: string;
  phone: string
}

export interface Body {
  landlord: string;
  houseId: string;
  houseFriendlyName: string;
  address: string;
  details: string;
  landlords: Person[],
  leaseStatus: string
  tenants: Person[]
}
