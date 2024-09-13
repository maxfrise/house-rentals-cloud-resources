import { House, Person, PaymentStatus } from "../../common/types/house";

export interface PaymentDetail {
  method: string;
  amount: string;
}

export interface Payment {
  landlords: Person[];
  tenants: Person[];
  st: string;
  houseid: string;
  status: PaymentStatus;
  details: PaymentDetail;
  pk: string;
}

export interface Responsebody {
  House: House;
  payments: Payment[];
}

export interface Body {
  user: string;
  houseid: string;
}
